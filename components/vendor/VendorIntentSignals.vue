<template>
  <div class="vis bw-card">
    <div class="vis-head">
      <div>
        <h2 class="vis-title">Buyer Intent Signals</h2>
        <p class="vis-sub">Real-time signals from buyers showing interest in your listings.</p>
      </div>
      <div class="vis-head__actions">
        <span v-if="data" class="vis-stat vis-stat--hot">
          <Icon name="heroicons:fire" />
          {{ data.hotSignals }} hot
        </span>
        <span v-if="data" class="vis-stat">
          {{ data.totalSignals }} total
        </span>
        <button class="bw-btn bw-btn--ghost bw-btn--sm" :disabled="loading" @click="load">
          <Icon name="heroicons:arrow-path" :class="{ 'spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Upgrade -->
    <div v-if="upgradeRequired" class="vis-upgrade">
      <Icon name="heroicons:lock-closed" class="vis-lock" />
      <div>
        <p class="vis-upgrade__title">Starter plan required</p>
        <p class="vis-upgrade__body">Upgrade to see which companies are researching your listings, comparing you to competitors, and showing purchase intent.</p>
      </div>
      <NuxtLink to="/dashboard/billing" class="bw-btn bw-btn--primary bw-btn--sm">Upgrade</NuxtLink>
    </div>

    <!-- Loading -->
    <div v-else-if="loading && !data" class="vis-skels">
      <div v-for="i in 5" :key="i" class="vis-skel"></div>
    </div>

    <!-- Error -->
    <div v-else-if="err" class="vis-err">
      <Icon name="heroicons:exclamation-triangle" />
      <span>{{ err }}</span>
      <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="load">Retry</button>
    </div>

    <!-- Data -->
    <template v-else-if="data">
      <div v-if="data.signals.length === 0" class="vis-empty">
        <Icon name="heroicons:signal" />
        <p>No intent signals yet. They appear as buyers interact with your listings.</p>
      </div>

      <div v-else class="vis-table-wrap">
        <table class="vis-table">
          <thead>
            <tr>
              <th>App</th>
              <th>Signal</th>
              <th>Strength</th>
              <th>Company</th>
              <th>Role</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in data.signals" :key="s.id" class="vis-row">
              <td class="vis-td-app">{{ s.appName }}</td>
              <td>
                <span class="vis-event">{{ formatEvent(s.eventType) }}</span>
                <span v-if="s.comparedTo" class="vis-compared">vs {{ s.comparedTo }}</span>
              </td>
              <td>
                <span class="vis-strength" :class="`vis-strength--${s.signalStrength}`">
                  {{ s.signalStrength.replace(/_/g, ' ') }}
                </span>
              </td>
              <td class="vis-td-meta">{{ s.userCompany || '—' }}</td>
              <td class="vis-td-meta">{{ s.userRole || '—' }}</td>
              <td class="vis-td-time">{{ formatTime(s.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="data.totalSignals > data.signals.length" class="vis-more">
        Showing {{ data.signals.length }} of {{ data.totalSignals }} signals
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Signal {
  id: string
  appId: string
  appName: string
  eventType: string
  signalStrength: string
  userCompany: string | null
  userRole: string | null
  userLocation: string | null
  comparedTo: string | null
  timeSpentSeconds: number | null
  sourcePage: string | null
  createdAt: string
}

interface SignalsData {
  signals: Signal[]
  totalSignals: number
  hotSignals: number
  plan: string
  upgradeRequired: boolean
}

const data = ref<SignalsData | null>(null)
const loading = ref(false)
const err = ref('')
const upgradeRequired = ref(false)

async function load() {
  loading.value = true
  err.value = ''
  try {
    const res = await $fetch<SignalsData>('/api/vendor/intent-signals')
    if (res.upgradeRequired) {
      upgradeRequired.value = true
    } else {
      data.value = res
    }
  } catch (e: unknown) {
    const code = (e as { statusCode?: number })?.statusCode
    if (code === 402) {
      upgradeRequired.value = true
    } else {
      err.value = 'Failed to load intent signals. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function formatEvent(type: string): string {
  const map: Record<string, string> = {
    page_view: 'Viewed listing',
    comparison: 'Compared you',
    download: 'Downloaded resource',
    demo_request: 'Requested demo',
    pricing_view: 'Viewed pricing',
    contact: 'Contacted vendor',
    trial_start: 'Started trial',
    purchase_intent: 'Purchase intent'
  }
  return map[type] ?? type.replace(/_/g, ' ')
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

onMounted(load)
</script>

<style scoped>
.vis { padding: 20px; margin-bottom: 20px; }

.vis-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.vis-title { font-size: 1rem; font-weight: 700; margin: 0 0 2px; }
.vis-sub { font-size: 0.82rem; color: var(--vw-text-subtle); margin: 0; }
.vis-head__actions { display: flex; align-items: center; gap: 8px; }

.vis-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  background: var(--vw-surface-2);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vw-text-muted);
}
.vis-stat--hot { background: rgba(239,68,68,0.1); color: #ef4444; }

/* Upgrade */
.vis-upgrade {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--vw-surface-2);
  border-radius: 10px;
  border: 1px dashed var(--vw-border);
}
.vis-lock { font-size: 24px; color: var(--vw-text-subtle); flex-shrink: 0; }
.vis-upgrade__title { font-weight: 700; font-size: 0.9rem; margin: 0 0 2px; }
.vis-upgrade__body { font-size: 0.8rem; color: var(--vw-text-subtle); margin: 0; }

/* Skeletons */
.vis-skels { display: grid; gap: 8px; }
.vis-skel {
  height: 40px;
  background: var(--vw-surface-2);
  border-radius: 8px;
  animation: vis-shimmer 1.4s ease-in-out infinite;
}
@keyframes vis-shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Error / Empty */
.vis-err {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #f87171;
  padding: 12px;
}
.vis-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px;
  color: var(--vw-text-subtle);
  font-size: 0.88rem;
  justify-content: center;
}

/* Table */
.vis-table-wrap { overflow-x: auto; }
.vis-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}
.vis-table thead th {
  padding: 7px 10px;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vw-text-subtle);
  border-bottom: 1px solid var(--vw-border);
  white-space: nowrap;
}
.vis-row { border-bottom: 0.5px solid var(--vw-border); transition: background 0.1s; }
.vis-row:last-child { border-bottom: none; }
.vis-row:hover { background: var(--vw-surface-2); }
.vis-table td { padding: 9px 10px; vertical-align: middle; }
.vis-td-app { font-weight: 600; white-space: nowrap; }
.vis-td-meta { color: var(--vw-text-muted); }
.vis-td-time { color: var(--vw-text-subtle); white-space: nowrap; font-size: 0.78rem; }

.vis-event { font-weight: 500; }
.vis-compared { display: block; font-size: 0.73rem; color: var(--vw-text-subtle); margin-top: 1px; }

.vis-strength {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}
.vis-strength--hot { background: rgba(239,68,68,0.12); color: #ef4444; }
.vis-strength--purchase_proximate { background: rgba(239,68,68,0.12); color: #ef4444; }
.vis-strength--warm { background: rgba(251,191,36,0.12); color: #f59e0b; }
.vis-strength--medium { background: rgba(99,102,241,0.1); color: #818cf8; }
.vis-strength--cold { background: var(--vw-surface-2); color: var(--vw-text-subtle); }

.vis-more {
  margin-top: 10px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--vw-text-subtle);
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
