<script setup lang="ts">
// Redirect to the canonical stack page which uses the real DB-backed API
definePageMeta({ layout: false })
await navigateTo('/dashboard/stack', { replace: true })
</script>
<template><div /></template>
  <div class="stack-page">
    <div class="stack-hero">
      <div class="stack-hero__inner">
        <div class="stack-hero__top">
          <span class="stack-eyebrow">My Stack</span>
          <div class="stack-hero__actions">
            <NuxtLink to="/marketplace" class="stack-btn stack-btn--ghost">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
              Browse apps
            </NuxtLink>
          </div>
        </div>
        <h1 class="stack-title">Your software stack</h1>
        <p class="stack-sub">Apps you've saved. Build your ideal stack — see what's missing.</p>

        <!-- Coverage bar -->
        <div v-if="savedIds.length > 0" class="stack-coverage">
          <div class="stack-coverage__label">
            <span>Stack coverage</span>
            <strong>{{ Math.min(Math.round(savedIds.length / 7 * 100), 100) }}%</strong>
          </div>
          <div class="stack-coverage__bar">
            <div class="stack-coverage__fill" :style="{ width: Math.min(savedIds.length / 7 * 100, 100) + '%' }"></div>
          </div>
          <p class="stack-coverage__hint">
            {{ 7 - Math.min(savedIds.length, 7) > 0
              ? `Add ${7 - Math.min(savedIds.length, 7)} more tool${7 - Math.min(savedIds.length, 7) > 1 ? 's' : ''} to cover all core business functions`
              : 'Your stack covers all 7 core business functions!' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="savedIds.length === 0 && !loading" class="stack-empty">
      <div class="stack-empty__icon">
        <svg viewBox="0 0 64 64" width="52" height="52" fill="none">
          <path d="M32 8l24 14v20L32 56 8 42V22L32 8z" stroke="currentColor" stroke-width="2"/>
          <path d="M32 8v24M8 22l24 10 24-10" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Your stack is empty</h2>
      <p>Browse the marketplace and click <strong>Save</strong> on any app to add it here.</p>
      <NuxtLink to="/marketplace" class="stack-btn stack-btn--primary">Discover apps</NuxtLink>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="stack-loading">
      <div class="stack-spinner"></div>
    </div>

    <!-- Saved apps grid -->
    <div v-else class="stack-container">
      <!-- Core function coverage pills -->
      <div class="stack-functions">
        <div
          v-for="fn in coreFunctions"
          :key="fn.id"
          class="stack-fn-pill"
          :class="{ covered: fn.covered }"
        >
          <span class="stack-fn-pill__icon" v-html="fn.icon"></span>
          <span>{{ fn.name }}</span>
          <svg v-if="fn.covered" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
          <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" opacity=".4"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
        </div>
      </div>

      <div class="stack-grid">
        <div v-for="id in savedIds" :key="id" class="stack-card">
          <div v-if="appCache[id]" class="stack-card__inner">
            <div class="stack-card__header">
              <div class="stack-card__logo">
                <img v-if="appCache[id].logo" :src="appCache[id].logo" :alt="appCache[id].name" />
                <span v-else>{{ appCache[id].name.charAt(0) }}</span>
              </div>
              <div class="stack-card__meta">
                <h3 class="stack-card__name">{{ appCache[id].name }}</h3>
                <span class="stack-card__cat">{{ appCache[id].category || 'App' }}</span>
              </div>
              <div class="stack-card__actions">
                <button class="stack-card__compare" @click="toggleCompare(id)" :class="{ active: isInCompare(id) }" title="Compare">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
                </button>
                <button class="stack-card__remove" @click="toggle(id)" title="Remove from stack">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
            <p class="stack-card__desc">{{ appCache[id].description }}</p>
            <div class="stack-card__footer">
              <span class="stack-card__price">{{ getPriceLabel(appCache[id].pricing) }}</span>
              <NuxtLink :to="`/app/${id}`" class="stack-card__view">View →</NuxtLink>
            </div>
          </div>
          <div v-else class="stack-card__inner stack-card__loading">
            <div class="stack-spinner"></div>
          </div>
        </div>

        <!-- Recommendation card: add missing function -->
        <div v-if="missingFunction" class="stack-card stack-card--suggest">
          <div class="stack-card__inner">
            <span class="stack-suggest__label">Missing from your stack</span>
            <h3 class="stack-suggest__title">{{ missingFunction.name }}</h3>
            <p class="stack-suggest__text">{{ missingFunction.description }}</p>
            <NuxtLink :to="`/marketplace?category=${missingFunction.category}`" class="stack-btn stack-btn--ghost stack-suggest__cta">
              Find {{ missingFunction.name }} tools
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Compare CTA if 2+ in compare -->
      <div v-if="compareCount >= 2" class="stack-compare-cta">
        <span>{{ compareCount }} apps selected for comparison</span>
        <NuxtLink to="/compare" class="stack-btn stack-btn--primary">Compare now →</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useFavorites } from '~/composables/useFavorites'
import { useCompare } from '~/composables/useCompare'

definePageMeta({ title: 'My Stack — Moonmart' })

const { all: savedIds, load, toggle, isLoading } = useFavorites()
const { toggleCompare, isInCompare, compareCount } = useCompare()

const loading = isLoading

interface AppSummary {
  id: string; name: string; logo?: string; description: string
  category?: string; pricing: { type: string; value?: number; period?: string }
}
const appCache = reactive<Record<string, AppSummary>>({})

async function fetchApp(id: string) {
  if (appCache[id]) return
  try {
    const data = await $fetch<AppSummary>(`/api/apps/${id}`)
    appCache[id] = data
  } catch {
    appCache[id] = { id, name: id, description: 'App', pricing: { type: 'paid' } }
  }
}

watch(savedIds, (ids) => {
  ids.forEach(id => fetchApp(id))
}, { immediate: true })

onMounted(() => load())

function getPriceLabel(pricing: AppSummary['pricing']) {
  if (!pricing) return '—'
  if (pricing.type === 'free') return 'Free'
  if (pricing.type === 'contact') return 'Custom'
  if (pricing.value) return `$${pricing.value}${pricing.period ? '/' + pricing.period : '/mo'}`
  return 'Paid'
}

// Core business function coverage
const coreFunctions = computed(() => {
  const cats = savedIds.value.map(id => (appCache[id]?.category || '').toLowerCase())
  return [
    { id: 'crm', name: 'CRM', icon: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 5a5 5 0 0 0-10 0h10z"/></svg>', covered: cats.some(c => c.includes('crm') || c.includes('sales')) },
    { id: 'pm', name: 'Project Mgmt', icon: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M2 2h12v2H2zm0 4h8v2H2zm0 4h10v2H2z"/></svg>', covered: cats.some(c => c.includes('project') || c.includes('task') || c.includes('pm')) },
    { id: 'comm', name: 'Communication', icon: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M14 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2v3l4-3h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/></svg>', covered: cats.some(c => c.includes('comm') || c.includes('chat') || c.includes('messaging')) },
    { id: 'hr', name: 'HR & People', icon: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H2z"/><path d="M13.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm2 6h-1.5v-1a2 2 0 0 0-2-2H9v-1a4 4 0 0 1 6.5 3.1V11z"/></svg>', covered: cats.some(c => c.includes('hr') || c.includes('human') || c.includes('payroll')) },
    { id: 'fin', name: 'Finance', icon: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm0 2h14v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5zm3 3a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H4z"/></svg>', covered: cats.some(c => c.includes('finance') || c.includes('accounting') || c.includes('billing')) },
    { id: 'mktg', name: 'Marketing', icon: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M3 2l10 6-10 6V2z"/></svg>', covered: cats.some(c => c.includes('marketing') || c.includes('email') || c.includes('seo')) },
    { id: 'analytics', name: 'Analytics', icon: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M1 11l4-4 3 3 3-5 4 4V14H1v-3z"/></svg>', covered: cats.some(c => c.includes('analytics') || c.includes('reporting') || c.includes('bi')) },
  ]
})

const missingFunction = computed(() => {
  const uncovered = coreFunctions.value.find(f => !f.covered)
  if (!uncovered) return null
  const map: Record<string, { name: string; description: string; category: string }> = {
    crm:       { name: 'CRM', description: 'Track leads, deals and customer relationships.', category: 'crm' },
    pm:        { name: 'Project Management', description: 'Keep your team aligned on tasks and deadlines.', category: 'project-management' },
    comm:      { name: 'Team Communication', description: 'Real-time messaging and async video for remote teams.', category: 'communication' },
    hr:        { name: 'HR & People Ops', description: 'Hire, onboard and manage your team in one place.', category: 'hr' },
    fin:       { name: 'Finance & Billing', description: 'Invoices, expenses and financial reporting.', category: 'accounting' },
    mktg:      { name: 'Marketing', description: 'Email campaigns, automation and growth tools.', category: 'marketing' },
    analytics: { name: 'Analytics', description: 'Turn data into decisions with dashboards and reports.', category: 'analytics' },
  }
  return map[uncovered.id] || null
})
</script>

<style scoped>
.stack-page {
  min-height: 80vh;
  background: var(--mm-bg, #07090F);
  color: var(--mm-pearl, #E2E8F0);
  padding-bottom: 80px;
}

/* Hero */
.stack-hero {
  padding: 56px 0 40px;
  border-bottom: 1px solid rgba(168,180,204,.08);
}
.stack-hero__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1rem,3vw,2rem);
}
.stack-hero__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.stack-eyebrow {
  font-size: .78rem; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: var(--mm-gold, #D4A843);
}
.stack-title {
  font-size: clamp(1.6rem,3.5vw,2.4rem);
  font-weight: 700; letter-spacing: -.02em; margin: 0 0 8px;
}
.stack-sub { color: var(--mm-silver); font-size:1rem; margin:0 0 28px; }

/* Coverage bar */
.stack-coverage { max-width: 420px; }
.stack-coverage__label {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .82rem; color: var(--mm-silver); margin-bottom: 6px;
}
.stack-coverage__label strong { color: var(--mm-gold); font-size: .9rem; }
.stack-coverage__bar {
  height: 6px; border-radius: 3px;
  background: rgba(168,180,204,.1);
  overflow: hidden;
}
.stack-coverage__fill {
  height: 100%; border-radius: 3px;
  background: var(--mm-gold, #D4A843);
  transition: width .6s ease;
}
.stack-coverage__hint { font-size:.78rem; color:var(--mm-slate); margin:6px 0 0; }

/* Empty */
.stack-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 24px; text-align: center; gap: 16px;
}
.stack-empty__icon { color:var(--mm-silver); opacity:.45; margin-bottom:8px; }
.stack-empty h2 { font-size:1.4rem; font-weight:600; margin:0; }
.stack-empty p { color:var(--mm-silver); max-width:380px; line-height:1.6; margin:0; }

/* Loading */
.stack-loading { display:flex; justify-content:center; padding:80px 0; }

/* Container */
.stack-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 36px clamp(1rem,3vw,2rem) 0;
}

/* Function pills */
.stack-functions {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;
}
.stack-fn-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 20px;
  border: 1px solid rgba(168,180,204,.14);
  font-size: .78rem; font-weight: 600;
  color: var(--mm-slate);
  background: rgba(168,180,204,.04);
  transition: border-color .15s, color .15s, background .15s;
}
.stack-fn-pill.covered {
  border-color: rgba(74,222,128,.3);
  color: #4ade80;
  background: rgba(74,222,128,.06);
}

/* Grid */
.stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
  gap: 16px;
}
.stack-card {
  background: var(--mm-s1, #141921);
  border: 1px solid rgba(168,180,204,.08);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color .15s;
}
.stack-card:hover { border-color: rgba(168,180,204,.2); }
.stack-card__inner { padding: 18px 20px; }
.stack-card__loading { display: flex; align-items: center; justify-content: center; min-height: 120px; }
.stack-card--suggest {
  border: 2px dashed rgba(212,168,67,.25);
  background: rgba(212,168,67,.02);
}
.stack-card--suggest:hover { border-color: rgba(212,168,67,.45); }

.stack-card__header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}
.stack-card__logo {
  width: 40px; height: 40px; border-radius: 10px;
  background: var(--mm-s2); overflow: hidden; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .95rem; color: var(--mm-gold);
}
.stack-card__logo img { width:100%; height:100%; object-fit:contain; }
.stack-card__meta { flex:1; min-width:0; }
.stack-card__name { font-weight:600; font-size:.9rem; margin:0 0 2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.stack-card__cat { font-size:.72rem; color:var(--mm-slate); }
.stack-card__actions { display:flex; gap:6px; flex-shrink:0; }
.stack-card__compare, .stack-card__remove {
  background:none; border:none; cursor:pointer;
  padding:5px; border-radius:6px;
  color:var(--mm-silver); transition: color .15s, background .15s;
}
.stack-card__compare:hover { color:var(--mm-gold); background:rgba(212,168,67,.1); }
.stack-card__compare.active { color:var(--mm-gold); }
.stack-card__remove:hover { color:#f87171; background:rgba(239,68,68,.1); }
.stack-card__desc { font-size:.82rem; color:var(--mm-silver); line-height:1.5; margin:0 0 14px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.stack-card__footer { display:flex; align-items:center; justify-content:space-between; }
.stack-card__price { font-size:.8rem; color:var(--mm-slate); }
.stack-card__view { font-size:.8rem; color:var(--mm-gold); text-decoration:none; font-weight:600; }
.stack-card__view:hover { text-decoration:underline; }

/* Suggest card */
.stack-suggest__label { font-size:.7rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--mm-gold); margin-bottom:8px; display:block; }
.stack-suggest__title { font-size:1rem; font-weight:700; margin:0 0 8px; }
.stack-suggest__text { font-size:.85rem; color:var(--mm-silver); line-height:1.5; margin:0 0 16px; }
.stack-suggest__cta { display:inline-flex; }

/* Compare CTA */
.stack-compare-cta {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  margin-top: 28px; padding: 16px 20px;
  background: rgba(212,168,67,.06); border: 1px solid rgba(212,168,67,.2); border-radius: 10px;
  font-size:.9rem; color:var(--mm-silver);
}

/* Buttons */
.stack-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:9px 18px; border-radius:8px;
  font-size:.875rem; font-weight:600;
  cursor:pointer; border:none; text-decoration:none;
  transition:background .15s, border-color .15s;
}
.stack-btn--primary { background:var(--mm-gold,#D4A843); color:var(--mm-bg,#07090F); }
.stack-btn--primary:hover { background:#c49a30; }
.stack-btn--ghost { background:none; border:1px solid rgba(168,180,204,.2); color:var(--mm-silver); }
.stack-btn--ghost:hover { border-color:rgba(168,180,204,.4); color:var(--mm-pearl); }

/* Spinner */
.stack-spinner {
  width:26px; height:26px; border:2px solid rgba(168,180,204,.12);
  border-top-color:var(--mm-gold,#D4A843); border-radius:50%;
  animation:sspin .7s linear infinite;
}
@keyframes sspin { to { transform:rotate(360deg); } }

@media (max-width:600px) {
  .stack-grid { grid-template-columns:1fr; }
}
</style>
