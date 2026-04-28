<template>
  <div class="wl-wrap">
    <div class="wl-header">
      <div class="wl-header__left">
        <span class="wl-ai-badge">AI</span>
        <h2 class="wl-title">Win/Loss Analysis</h2>
      </div>
      <button v-if="!loaded" class="wl-run-btn" :disabled="loading" @click="load">
        <svg v-if="!loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <div v-else class="wl-spin-sm" />
        {{ loading ? 'Analysing…' : 'Run analysis' }}
      </button>
      <button v-else class="wl-ghost-btn" @click="loaded = false; load()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        Refresh
      </button>
    </div>

    <!-- Idle state -->
    <div v-if="!loading && !loaded && !err" class="wl-idle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36"><path d="M3 3v18h18"/><path d="M7 16l5-7 5 7"/></svg>
      <p>Analyse your last 90 days of buyer intent data to understand conversion patterns.</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="wl-loading">
      <div class="wl-skel wl-skel--wide" />
      <div class="wl-skel wl-skel--mid" />
      <div class="wl-skel wl-skel--mid" />
    </div>

    <!-- Error -->
    <div v-else-if="err" class="wl-err">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ err }}
    </div>

    <!-- Results -->
    <template v-else-if="data">
      <!-- KPIs -->
      <div class="wl-kpis">
        <div class="wl-kpi" :class="{ 'wl-kpi--good': data.winRate >= 50 }">
          <span class="wl-kpi__val">{{ data.winRate }}%</span>
          <span class="wl-kpi__lbl">Win rate</span>
        </div>
        <div class="wl-kpi">
          <span class="wl-kpi__val">{{ data.totalComparisons }}</span>
          <span class="wl-kpi__lbl">Total comparisons</span>
        </div>
        <div class="wl-kpi wl-kpi--good">
          <span class="wl-kpi__val">{{ data.wins.length }}</span>
          <span class="wl-kpi__lbl">Wins</span>
        </div>
        <div class="wl-kpi wl-kpi--bad">
          <span class="wl-kpi__val">{{ data.losses.length }}</span>
          <span class="wl-kpi__lbl">Losses</span>
        </div>
      </div>

      <!-- Insights -->
      <div class="wl-insights">
        <h3 class="wl-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
          AI insights
        </h3>
        <ul class="wl-insight-list">
          <li v-for="(insight, i) in data.insights" :key="i" class="wl-insight-item">
            <span class="wl-insight-num">{{ i + 1 }}</span>
            <span>{{ insight }}</span>
          </li>
        </ul>
      </div>

      <!-- Tipping factors -->
      <div v-if="data.tippingFactors.length" class="wl-tipping">
        <h3 class="wl-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Per-listing conversion
        </h3>
        <div class="wl-tip-list">
          <div v-for="t in data.tippingFactors" :key="t.app" class="wl-tip-row">
            <span class="wl-tip-name">{{ t.app }}</span>
            <div class="wl-tip-bar-wrap">
              <div class="wl-tip-bar" :style="{ width: t.rate + '%' }" :class="t.rate >= 50 ? 'wl-tip-bar--good' : 'wl-tip-bar--bad'" />
            </div>
            <span class="wl-tip-rate" :class="t.rate >= 50 ? 'wl-tip-rate--good' : 'wl-tip-rate--bad'">{{ t.rate }}%</span>
            <span class="wl-tip-detail">{{ t.wins }}W / {{ t.losses }}L</span>
          </div>
        </div>
      </div>

      <!-- Recent signals -->
      <details class="wl-details">
        <summary class="wl-summary">Recent wins ({{ data.wins.slice(0, 10).length }})</summary>
        <ul class="wl-signal-list">
          <li v-for="(w, i) in data.wins.slice(0, 10)" :key="i" class="wl-signal-item wl-signal-item--win">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="wl-sig-app">{{ w.app_name }}</span>
            <span class="wl-sig-co">{{ w.company || 'Anonymous buyer' }}</span>
            <span class="wl-sig-date">{{ relDate(w.date) }}</span>
          </li>
        </ul>
      </details>

      <details class="wl-details">
        <summary class="wl-summary">Recent losses ({{ data.losses.slice(0, 10).length }})</summary>
        <ul class="wl-signal-list">
          <li v-for="(l, i) in data.losses.slice(0, 10)" :key="i" class="wl-signal-item wl-signal-item--loss">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span class="wl-sig-app">{{ l.app_name }}</span>
            <span class="wl-sig-co">{{ l.company || 'Anonymous buyer' }}</span>
            <span class="wl-sig-date">{{ relDate(l.date) }}</span>
          </li>
        </ul>
      </details>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface WinLossData {
  winRate: number
  totalComparisons: number
  wins: { app_id: string; app_name: string; date: string; company: string | null }[]
  losses: { app_id: string; app_name: string; date: string; company: string | null; last_event: string }[]
  insights: string[]
  tippingFactors: { app: string; wins: number; losses: number; rate: number }[]
}

const loading = ref(false)
const loaded = ref(false)
const err = ref('')
const data = ref<WinLossData | null>(null)

async function load() {
  loading.value = true
  err.value = ''
  try {
    data.value = await $fetch<WinLossData>('/api/vendor/win-loss', { method: 'POST' })
    loaded.value = true
  } catch (e: unknown) {
    const code = (e as { statusCode?: number })?.statusCode
    if (code === 402) {
      err.value = 'Win/Loss Analysis requires a Professional plan. Upgrade in Billing to access.'
    } else if (code === 429) {
      err.value = 'Rate limit reached. Please try again in an hour.'
    } else {
      err.value = 'Failed to load win/loss data. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function relDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`
}
</script>

<style scoped>
.wl-wrap {
  background: var(--mm-s1, #0F1220);
  border: 0.5px solid var(--b1, rgba(255,255,255,0.06));
  border-radius: 14px; padding: 20px; margin-top: 24px;
}
.wl-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.wl-header__left { display: flex; align-items: center; gap: 10px; }
.wl-ai-badge {
  background: rgba(74,128,212,0.15); color: var(--mm-blue, #4A80D4);
  font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em;
}
.wl-title { font-size: 1rem; font-weight: 700; margin: 0; }
.wl-run-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px; background: var(--mm-blue, #4A80D4); color: #fff;
  font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer; transition: opacity .15s;
}
.wl-run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.wl-run-btn:hover:not(:disabled) { opacity: 0.85; }
.wl-ghost-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px;
  background: transparent; border: 0.5px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5);
  font-size: 0.8rem; font-weight: 600; cursor: pointer;
}
.wl-ghost-btn:hover { background: rgba(255,255,255,0.04); }
.wl-spin-sm {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.wl-idle {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 28px 16px; color: rgba(255,255,255,0.3); text-align: center;
}
.wl-idle p { font-size: 0.85rem; margin: 0; max-width: 360px; }

.wl-loading { display: flex; flex-direction: column; gap: 10px; }
.wl-skel { border-radius: 8px; background: rgba(255,255,255,0.05); animation: shimmer 1.4s infinite; height: 42px; }
.wl-skel--wide { width: 100%; }
.wl-skel--mid { width: 75%; }
@keyframes shimmer { 0%,100% { opacity:.4 } 50% { opacity:.8 } }

.wl-err {
  display: flex; align-items: center; gap: 9px;
  padding: 12px 14px; background: rgba(248,113,113,0.08);
  border: 0.5px solid rgba(248,113,113,0.25); border-radius: 10px;
  color: #f87171; font-size: 0.85rem;
}

.wl-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
.wl-kpi {
  background: var(--mm-s2, #161B2E); border: 0.5px solid var(--b1, rgba(255,255,255,0.06));
  border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 3px;
}
.wl-kpi--good { border-color: rgba(42,157,143,0.25); }
.wl-kpi--good .wl-kpi__val { color: var(--mm-sea, #2A9D8F); }
.wl-kpi--bad { border-color: rgba(248,113,113,0.2); }
.wl-kpi--bad .wl-kpi__val { color: #f87171; }
.wl-kpi__val { font-size: 1.4rem; font-weight: 800; line-height: 1; color: rgba(255,255,255,0.9); }
.wl-kpi__lbl { font-size: 0.73rem; color: rgba(255,255,255,0.4); font-weight: 500; }

.wl-section-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  color: rgba(255,255,255,0.5); margin: 0 0 10px;
}

.wl-insights {
  background: rgba(74,128,212,0.05); border: 0.5px solid rgba(74,128,212,0.15);
  border-radius: 10px; padding: 14px; margin-bottom: 14px;
}
.wl-insights .wl-section-title { color: var(--mm-blue, #4A80D4); }
.wl-insight-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.wl-insight-item { display: flex; gap: 9px; align-items: flex-start; font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.5; }
.wl-insight-num {
  min-width: 20px; height: 20px; border-radius: 50%;
  background: rgba(74,128,212,0.2); color: var(--mm-blue, #4A80D4);
  font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
}

.wl-tipping { margin-bottom: 14px; }
.wl-tip-list { display: flex; flex-direction: column; gap: 8px; }
.wl-tip-row { display: flex; align-items: center; gap: 10px; font-size: 0.84rem; }
.wl-tip-name { width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; flex-shrink: 0; }
.wl-tip-bar-wrap { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.wl-tip-bar { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.wl-tip-bar--good { background: var(--mm-sea, #2A9D8F); }
.wl-tip-bar--bad { background: #f87171; }
.wl-tip-rate { width: 38px; text-align: right; font-weight: 700; font-size: 0.84rem; flex-shrink: 0; }
.wl-tip-rate--good { color: var(--mm-sea, #2A9D8F); }
.wl-tip-rate--bad { color: #f87171; }
.wl-tip-detail { font-size: 0.75rem; color: rgba(255,255,255,0.35); white-space: nowrap; }

.wl-details { margin-top: 10px; }
.wl-summary {
  cursor: pointer; font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.45);
  padding: 6px 0; user-select: none;
}
.wl-summary:hover { color: rgba(255,255,255,0.7); }
.wl-signal-list { list-style: none; padding: 4px 0 8px; margin: 0; display: flex; flex-direction: column; gap: 5px; }
.wl-signal-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; padding: 6px 10px; border-radius: 7px; }
.wl-signal-item--win { background: rgba(42,157,143,0.06); }
.wl-signal-item--win svg { color: var(--mm-sea, #2A9D8F); flex-shrink: 0; }
.wl-signal-item--loss { background: rgba(248,113,113,0.05); }
.wl-signal-item--loss svg { color: #f87171; flex-shrink: 0; }
.wl-sig-app { font-weight: 600; flex: 1; }
.wl-sig-co { color: rgba(255,255,255,0.4); font-size: 0.78rem; }
.wl-sig-date { color: rgba(255,255,255,0.3); font-size: 0.75rem; white-space: nowrap; margin-left: auto; }

@media (max-width: 640px) { .wl-kpis { grid-template-columns: 1fr 1fr; } }
</style>
