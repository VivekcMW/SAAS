<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Analytics</h1>
        <p class="bw-head__sub">Your funnel, in one place. Ask questions in plain English.</p>
      </div>
      <div class="bw-head__actions">
        <select v-model="period" class="bw-select" style="max-width: 180px;">
          <option value="30d">Last 30 days</option>
          <option value="7d">Last 7 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
    </header>

    <!-- AI NL query -->
    <div class="vw-ai-card nl-card">
      <div class="vw-ai-card__title">
        <span class="vw-ai-chip">AI</span>
        Ask a question about your data
      </div>
      <form class="nl-form" @submit.prevent="askAI">
        <input v-model="nlQuery" class="bw-input" placeholder="e.g. Why did demos drop last week?" >
        <button class="bw-btn bw-btn--primary" :disabled="!nlQuery.trim() || thinking">
          {{ thinking ? 'Thinking…' : 'Ask' }}
        </button>
      </form>
      <div v-if="nlAnswer" class="nl-answer">{{ nlAnswer }}</div>
      <div v-if="!nlAnswer" class="nl-suggest">
        <button v-for="s in suggestions" :key="s" type="button" class="nl-chip" @click="nlQuery = s; askAI()">{{ s }}</button>
      </div>
    </div>

    <!-- KPI row -->
    <div class="bw-kpis">
      <template v-if="analyticsLoading">
        <div v-for="i in 4" :key="i" class="bw-kpi bw-kpi--skel"/>
      </template>
      <template v-else>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Views</div>
        <div class="bw-kpi__value">{{ fmt(kpis.views30d) }}</div>
        <div class="bw-kpi__foot">{{ analyticsData?.uniqueViews != null ? fmt(analyticsData.uniqueViews) + ' unique' : '—' }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Leads</div>
        <div class="bw-kpi__value">{{ kpis.leads30d }}</div>
        <div class="bw-kpi__foot">{{ kpis.hotLeads }} hot</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Demos booked</div>
        <div class="bw-kpi__value">{{ analyticsData?.demos ?? '—' }}</div>
        <div class="bw-kpi__foot">{{ analyticsData?.demos != null ? 'from ' + kpis.leads30d + ' leads' : 'no data yet' }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">MRR</div>
        <div class="bw-kpi__value">${{ fmt(kpis.mrr) }}</div>
        <div class="bw-kpi__foot">{{ analyticsData ? 'this ' + (analyticsPeriod === '7d' ? 'week' : analyticsPeriod === '90d' ? 'quarter' : 'month') : '—' }}</div>
      </div>
      </template>
    </div>

    <div class="bw-grid bw-grid--main-aside bw-section">
      <section class="bw-card">
        <div class="bw-card__head">
          <h2 class="bw-card__title">Conversion funnel</h2>
        </div>
        <div class="vw-funnel">
          <div v-for="(s, i) in funnel" :key="s.label" class="vw-funnel__step">
            <div class="vw-funnel__label">{{ s.label }}</div>
            <div class="vw-funnel__bar" :style="{ width: barWidth(s, funnel[0]) }">{{ fmt(s.value) }}</div>
            <div class="vw-funnel__rate">{{ i === 0 ? '—' : s.rate + '%' }}</div>
          </div>
        </div>
      </section>

      <aside class="bw-card">
        <div class="bw-card__head">
          <h2 class="bw-card__title">Traffic by day</h2>
        </div>
        <div v-if="traffic.length" class="vw-bars">
          <div v-for="(v, i) in traffic" :key="i" class="vw-bars__bar" :class="{ 'vw-bars__bar--active': i === traffic.length - 1 }" :style="{ height: (v / maxTraffic * 100) + '%' }" />
        </div>
        <p v-else class="va-no-data">Traffic breakdown available once analytics sync.</p>
        <div class="vw-bars__labels">
          <div v-for="d in days" :key="d" class="vw-bars__label">{{ d }}</div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
const { kpis, funnel, loadAnalytics, analyticsLoading, analyticsData, analyticsPeriod } = useVendorData()
const ai = useAICopilot()

const period = ref('30d')

// Load real analytics on mount and when period changes
onMounted(() => loadAnalytics(period.value))
watch(period, (val) => loadAnalytics(val))

const nlQuery = ref('')
const nlAnswer = ref('')
const thinking = ref(false)

// Traffic chart — derived from analyticsData when available, empty otherwise
const traffic = computed(() => (analyticsData.value as any)?.dailyViews ?? [])
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const maxTraffic = computed(() => traffic.value.length ? Math.max(...traffic.value) : 1)

const suggestions = [
  'Why did demos drop last week?',
  'Which listing converts best?',
  'What hour gets the most leads?'
]

const { fmtNumber } = useFmt()
function fmt(n: number) { return fmtNumber(n) }
function barWidth(s: { value: number }, top: { value: number }) {
  return Math.max(15, (s.value / top.value) * 100) + '%'
}

async function askAI() {
  if (!nlQuery.value.trim()) return
  thinking.value = true
  await ai.ask(nlQuery.value)
  const last = ai.messages.value[ai.messages.value.length - 1]
  nlAnswer.value = last?.content || ''
  thinking.value = false
}
</script>

<style scoped>
.nl-card { margin-bottom: 20px; }
.nl-form { display: flex; gap: 8px; }
.nl-answer {
  margin-top: 12px; padding: 12px 14px;
  background: var(--vw-surface); border: 1px solid var(--vw-ai-100);
  border-radius: 10px; font-size: 0.88rem; line-height: 1.55;
  white-space: pre-line;
}
.nl-suggest { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.nl-chip {
  padding: 5px 10px; background: var(--vw-surface);
  border: 1px solid var(--vw-ai-100); color: var(--vw-ai-text);
  border-radius: 999px; font-size: 0.78rem; cursor: pointer;
}
.nl-chip:hover { background: var(--vw-ai-50); }
.va-no-data { font-size: 0.82rem; color: var(--vw-text-subtle); padding: 24px 0; text-align: center; }
.bw-kpi--skel { min-height: 72px; animation: va-skel-pulse 1.4s ease-in-out infinite; }
@keyframes va-skel-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
</style>
