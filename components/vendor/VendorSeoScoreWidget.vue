<script setup lang="ts">
/**
 * VendorSeoScoreWidget.vue
 *
 * Displays the Moonmart SEO score for a listed app on the vendor dashboard.
 * Shows score (0–100), colour-coded breakdown, and actionable suggestions.
 */
import { ref, onMounted } from 'vue'

const props = defineProps<{
  appId: string
  appName: string
}>()

interface ScoreData {
  score: number
  label: string
  breakdown: Record<string, number>
  suggestions: string[]
  lastScoredAt: string | null
}

const data = ref<ScoreData | null>(null)
const loading = ref(false)
const expanded = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    data.value = await $fetch<ScoreData>(`/api/seo/score/${props.appId}`)
  } catch { /* ignore — widget is non-critical */ }
  loading.value = false
})

const scoreColor = (score: number) =>
  score >= 80 ? '#15803d' : score >= 60 ? '#b45309' : '#dc2626'

const scoreBg = (score: number) =>
  score >= 80 ? '#f0fdf4' : score >= 60 ? '#fffbeb' : '#fef2f2'

const breakdownLabel: Record<string, string> = {
  title: 'SEO Title',
  description: 'Meta Description',
  schema: 'Schema Markup',
  faq: 'FAQ Content',
  ogImage: 'OG Image',
  canonical: 'Canonical URL',
  internalLinks: 'Internal Links',
  pageSpeed: 'Page Speed',
  breadcrumb: 'Breadcrumb',
  reviews: 'Reviews',
}
</script>

<template>
  <div class="seo-score-widget">
    <!-- Loading -->
    <div v-if="loading" class="animate-pulse h-12 bg-gray-100 rounded-md" />

    <!-- Score card -->
    <div v-else-if="data" class="score-card" :style="{ background: scoreBg(data.score), borderColor: scoreColor(data.score) + '40' }">
      <div class="score-header">
        <div class="score-circle" :style="{ color: scoreColor(data.score) }">
          <span class="score-num">{{ Math.round(data.score) }}</span>
          <span class="score-denom">/100</span>
        </div>
        <div class="score-info">
          <div class="score-label" :style="{ color: scoreColor(data.score) }">{{ data.label }}</div>
          <div class="score-name">SEO Health Score</div>
          <div v-if="data.lastScoredAt" class="score-date">Last scored {{ new Date(data.lastScoredAt).toLocaleDateString() }}</div>
        </div>
        <button class="score-expand" @click="expanded = !expanded">
          {{ expanded ? '▲ Hide' : '▼ Details' }}
        </button>
      </div>

      <!-- Breakdown -->
      <div v-if="expanded" class="score-breakdown">
        <div v-for="(max, key) in { title: 10, description: 10, schema: 15, faq: 10, ogImage: 10, canonical: 10, internalLinks: 10, pageSpeed: 15, breadcrumb: 5, reviews: 5 }" :key="key" class="breakdown-row">
          <span class="breakdown-label">{{ breakdownLabel[key] || key }}</span>
          <div class="breakdown-bar-track">
            <div
              class="breakdown-bar-fill"
              :style="{
                width: `${((data.breakdown[key] || 0) / max) * 100}%`,
                background: (data.breakdown[key] || 0) >= max ? '#15803d' : (data.breakdown[key] || 0) >= max / 2 ? '#b45309' : '#dc2626'
              }"
            />
          </div>
          <span class="breakdown-val">{{ data.breakdown[key] || 0 }}/{{ max }}</span>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="data.suggestions.length > 0" class="suggestions">
        <p class="suggestions-title">Improvement tips:</p>
        <ul class="suggestions-list">
          <li v-for="tip in data.suggestions" :key="tip" class="suggestion-item">
            <span class="suggestion-icon">→</span> {{ tip }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seo-score-widget { font-size: 13px; }
.score-card { border: 1px solid; border-radius: 8px; padding: 14px; }
.score-header { display: flex; align-items: center; gap: 12px; }
.score-circle { display: flex; align-items: baseline; gap: 2px; }
.score-num { font-size: 32px; font-weight: 800; line-height: 1; }
.score-denom { font-size: 13px; font-weight: 600; color: #6b7280; }
.score-info { flex: 1; }
.score-label { font-size: 14px; font-weight: 700; }
.score-name { font-size: 12px; color: #6b7280; }
.score-date { font-size: 11px; color: #9ca3af; }
.score-expand { font-size: 11px; color: #6b7280; cursor: pointer; background: none; border: none; padding: 4px 8px; border-radius: 4px; }
.score-expand:hover { background: rgba(0,0,0,0.05); }

.score-breakdown { margin-top: 12px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.breakdown-row { display: grid; grid-template-columns: 120px 1fr 40px; align-items: center; gap: 8px; }
.breakdown-label { font-size: 11px; color: #6b7280; }
.breakdown-bar-track { height: 6px; background: rgba(0,0,0,0.08); border-radius: 3px; overflow: hidden; }
.breakdown-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.breakdown-val { font-size: 11px; font-weight: 600; color: #374151; text-align: right; }

.suggestions { margin-top: 10px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 10px; }
.suggestions-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.suggestions-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.suggestion-item { font-size: 12px; color: #374151; display: flex; gap: 6px; }
.suggestion-icon { color: #f97316; font-weight: bold; flex-shrink: 0; }
</style>
