<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Summary {
  pitch: string
  pros: string[]
  cons: string[]
  verdict: string
  idealFor?: string[]
  notIdealFor?: string[]
  contextNote?: string
  confidence?: number
  generatedAt?: string
}

const props = defineProps<{
  appId: string
  appName: string
}>()

type TabKey = 'pitch' | 'pros' | 'cons' | 'verdict'
const tab = ref<TabKey>('pitch')
const context = ref<'default' | 'sales' | 'engineering' | 'marketing'>('default')
const summary = ref<Summary | null>(null)
const loading = ref(false)
const errMsg = ref('')

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'pitch', label: '30-sec Pitch', icon: 'heroicons:megaphone' },
  { key: 'pros', label: 'Pros', icon: 'heroicons:hand-thumb-up' },
  { key: 'cons', label: 'Cons', icon: 'heroicons:hand-thumb-down' },
  { key: 'verdict', label: 'Verdict', icon: 'heroicons:sparkles' }
]

async function load() {
  loading.value = true
  errMsg.value = ''
  try {
    summary.value = await $fetch<Summary>('/api/ai/app-summary', {
      method: 'POST',
      body: { appId: props.appId, context: context.value }
    })
  } catch (e) {
    errMsg.value = 'Unable to generate summary. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => props.appId, () => { load() }, { immediate: true })
watch(context, () => load())

const confidencePct = computed(() =>
  summary.value?.confidence ? Math.round(summary.value.confidence * 100) : 0
)
</script>

<template>
  <section class="ai-summary" aria-labelledby="ai-summary-title">
    <header class="ai-head">
      <div class="ai-title-wrap">
        <span class="ai-badge">
          <Icon name="heroicons:sparkles" />
          AI Summary
        </span>
        <h2 id="ai-summary-title" class="ai-title">
          {{ appName }} at a glance
        </h2>
        <p class="ai-sub">
          Neutral, AI-generated overview based on {{ appName }}'s data and real reviews.
        </p>
      </div>

      <div class="ai-context">
        <label for="ai-ctx" class="ai-ctx-label">Perspective</label>
        <div class="select-wrap">
          <select id="ai-ctx" v-model="context" class="ai-ctx-select">
            <option value="default">General</option>
            <option value="sales">Sales / RevOps</option>
            <option value="engineering">Engineering</option>
            <option value="marketing">Marketing</option>
          </select>
          <Icon name="heroicons:chevron-down" class="select-chev" />
        </div>
      </div>
    </header>

    <!-- Tabs -->
    <div class="ai-tabs" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.key"
        role="tab"
        :aria-selected="tab === t.key"
        :class="['ai-tab', { active: tab === t.key }]"
        @click="tab = t.key"
      >
        <Icon :name="t.icon" />
        <span>{{ t.label }}</span>
      </button>
    </div>

    <!-- Panel -->
    <div class="ai-panel" role="tabpanel">
      <div v-if="loading" class="ai-skel">
        <div class="skel-line w-90"></div>
        <div class="skel-line w-75"></div>
        <div class="skel-line w-60"></div>
      </div>

      <div v-else-if="errMsg" class="ai-error">
        <Icon name="heroicons:exclamation-triangle" />
        <span>{{ errMsg }}</span>
        <button class="retry-btn" @click="load">Retry</button>
      </div>

      <template v-else-if="summary">
        <!-- Pitch -->
        <div v-if="tab === 'pitch'" class="panel-content">
          <p class="pitch-text">{{ summary.pitch }}</p>
          <p v-if="summary.contextNote" class="context-note">
            <Icon name="heroicons:light-bulb" />
            {{ summary.contextNote }}
          </p>
        </div>

        <!-- Pros -->
        <ul v-else-if="tab === 'pros'" class="panel-list pros-list">
          <li v-for="(item, i) in summary.pros" :key="i">
            <Icon name="heroicons:check-circle" class="pros-icon" />
            <span>{{ item }}</span>
          </li>
        </ul>

        <!-- Cons -->
        <ul v-else-if="tab === 'cons'" class="panel-list cons-list">
          <li v-for="(item, i) in summary.cons" :key="i">
            <Icon name="heroicons:x-circle" class="cons-icon" />
            <span>{{ item }}</span>
          </li>
        </ul>

        <!-- Verdict -->
        <div v-else-if="tab === 'verdict'" class="panel-content verdict-panel">
          <p class="verdict-text">{{ summary.verdict }}</p>

          <div class="verdict-grid">
            <div class="verdict-col good">
              <h3>Ideal for</h3>
              <ul>
                <li v-for="(v, i) in summary.idealFor || []" :key="i">
                  <Icon name="heroicons:check" />
                  <span>{{ v }}</span>
                </li>
              </ul>
            </div>
            <div class="verdict-col warn">
              <h3>Not ideal for</h3>
              <ul>
                <li v-for="(v, i) in summary.notIdealFor || []" :key="i">
                  <Icon name="heroicons:minus" />
                  <span>{{ v }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <footer class="ai-foot">
      <span class="ai-meta">
        <Icon name="heroicons:cpu-chip" />
        AI-generated · {{ confidencePct }}% confidence
      </span>
      <span class="ai-disclaimer">
        Always double-check pricing and features on the vendor's site before purchase.
      </span>
    </footer>
  </section>
</template>

<style scoped>
.ai-summary {
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  background: linear-gradient(0deg, #ffffff 0%, #fffaf5 100%);
  padding: 20px;
  margin: 24px 0;
}

.ai-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.ai-title-wrap { min-width: 0; flex: 1; }

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff3e6;
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.ai-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
  line-height: 1.3;
}

.ai-sub {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.ai-context {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-ctx-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.select-wrap {
  position: relative;
  display: inline-block;
}

.ai-ctx-select {
  appearance: none;
  border: 0.5px solid #e5e7eb;
  background: #fff;
  padding: 6px 28px 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  cursor: pointer;
  transition: border-color 150ms ease;
}

.ai-ctx-select:hover { border-color: #ff8838; }
.ai-ctx-select:focus { outline: 2px solid #ff8838; outline-offset: 1px; }

.select-chev {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  font-size: 14px;
}

.ai-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 0.5px solid #e5e7eb;
  margin-bottom: 16px;
  overflow-x: auto;
}

.ai-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 0;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: color 150ms ease, border-color 150ms ease;
}

.ai-tab:hover { color: #111827; }
.ai-tab.active {
  color: #b45309;
  border-bottom-color: #ff8838;
}

.ai-panel {
  min-height: 120px;
}

.panel-content { color: #374151; font-size: 15px; line-height: 1.6; }

.pitch-text { margin: 0 0 12px; }

.context-note {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 13px;
  color: #6b7280;
  background: #fffaf5;
  border-left: 3px solid #ff8838;
  padding: 8px 12px;
  margin: 0;
}

.panel-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.panel-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: #374151; line-height: 1.5; }
.pros-icon { color: #10b981; font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.cons-icon { color: #ef4444; font-size: 18px; flex-shrink: 0; margin-top: 2px; }

.verdict-panel .verdict-text {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px;
}

.verdict-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.verdict-col {
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
}

.verdict-col.good { background: #f0fdf4; border-color: #bbf7d0; }
.verdict-col.warn { background: #fef2f2; border-color: #fecaca; }

.verdict-col h3 {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #374151;
  margin: 0 0 8px;
}

.verdict-col ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.verdict-col li { display: flex; gap: 6px; align-items: flex-start; font-size: 13px; color: #374151; }
.verdict-col.good li :deep(svg) { color: #10b981; }
.verdict-col.warn li :deep(svg) { color: #dc2626; }

.ai-skel { display: grid; gap: 10px; }
.skel-line {
  height: 14px;
  background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
.w-90 { width: 90%; }
.w-75 { width: 75%; }
.w-60 { width: 60%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.ai-error {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #dc2626;
}

.retry-btn {
  background: transparent;
  border: 0.5px solid #dc2626;
  color: #dc2626;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease;
}
.retry-btn:hover { background: #fef2f2; }

.ai-foot {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 0.5px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ai-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
}

.ai-disclaimer {
  font-size: 11px;
  color: #9ca3af;
  font-style: italic;
}

@media (max-width: 640px) {
  .verdict-grid { grid-template-columns: 1fr; }
}
</style>
