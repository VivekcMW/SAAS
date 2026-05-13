<template>
  <div class="vi bw-card">
    <div class="vi-head">
      <div>
        <span class="vw-ai-chip">AI</span>
        <h2 class="vi-title">Competitive Intelligence</h2>
        <p class="vi-sub">How your listing compares in the market and what buyers are saying.</p>
      </div>
      <button class="bw-btn bw-btn--ghost bw-btn--sm" :disabled="loading" @click="load">
        <Icon name="heroicons:arrow-path" :class="{ 'spin': loading }" />
        Refresh
      </button>
    </div>

    <!-- Upgrade required -->
    <div v-if="upgradeRequired" class="vi-upgrade">
      <Icon name="heroicons:lock-closed" class="vi-lock" />
      <div>
        <p class="vi-upgrade__title">Professional plan required</p>
        <p class="vi-upgrade__body">Upgrade to unlock competitive intelligence, content gap analysis, and buyer personas.</p>
      </div>
      <NuxtLink to="/dashboard/billing" class="bw-btn bw-btn--primary bw-btn--sm">Upgrade</NuxtLink>
    </div>

    <!-- No listings -->
    <div v-else-if="noListings" class="vi-empty">
      <Icon name="heroicons:chart-bar" />
      <p>Publish your first listing to see competitive intelligence.</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading && !data" class="vi-skels">
      <div class="vi-skel"/>
      <div class="vi-skel"/>
      <div class="vi-skel vi-skel--sm"/>
    </div>

    <!-- Error -->
    <div v-else-if="err" class="vi-err">
      <Icon name="heroicons:exclamation-triangle" />
      <span>{{ err }}</span>
      <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="load">Retry</button>
    </div>

    <!-- Data -->
    <template v-else-if="data">
      <!-- Score map -->
      <div class="vi-section">
        <h3 class="vi-section-title">Rating snapshot</h3>
        <div class="vi-scores">
          <div class="vi-score-col vi-score-col--you">
            <span class="vi-score__n">{{ data.competitiveSentimentMap.yourScore.toFixed(1) }}★</span>
            <span class="vi-score__l">Your listing</span>
          </div>
          <div class="vi-score-divider"/>
          <div class="vi-score-col">
            <span class="vi-score__n">{{ data.competitiveSentimentMap.categoryAvg.toFixed(1) }}★</span>
            <span class="vi-score__l">Category avg</span>
          </div>
          <div v-if="data.competitiveSentimentMap.topCompetitor" class="vi-score-divider"/>
          <div v-if="data.competitiveSentimentMap.topCompetitor" class="vi-score-col">
            <span class="vi-score__n">{{ data.competitiveSentimentMap.topCompetitor.score.toFixed(1) }}★</span>
            <span class="vi-score__l">{{ data.competitiveSentimentMap.topCompetitor.name }}</span>
          </div>
          <div class="vi-score-divider"/>
          <div class="vi-score-col">
            <span class="vi-score__n">{{ data.competitiveSentimentMap.reviewCount }}</span>
            <span class="vi-score__l">Reviews</span>
          </div>
        </div>
      </div>

      <!-- Content gaps -->
      <div class="vi-section">
        <h3 class="vi-section-title">Content gaps</h3>
        <ul class="vi-gaps">
          <li v-for="(gap, i) in data.contentGaps" :key="i" class="vi-gap">
            <Icon name="heroicons:light-bulb" class="vi-gap__icon" />
            <span>{{ gap }}</span>
          </li>
        </ul>
      </div>

      <!-- Buyer personas -->
      <div class="vi-section">
        <h3 class="vi-section-title">Buyer personas (from intent events)</h3>
        <div class="vi-personas">
          <div class="vi-persona">
            <span class="vi-persona__label">Top role</span>
            <span class="vi-persona__val">{{ data.buyerPersonas.topRole }}</span>
          </div>
          <div class="vi-persona">
            <span class="vi-persona__label">Top company</span>
            <span class="vi-persona__val">{{ data.buyerPersonas.topCompany }}</span>
          </div>
          <div class="vi-persona">
            <span class="vi-persona__label">Top industry</span>
            <span class="vi-persona__val">{{ data.buyerPersonas.topIndustry }}</span>
          </div>
        </div>

        <div v-if="data.buyerPersonas.intentBreakdown.length > 0" class="vi-breakdown">
          <h4 class="vi-breakdown__title">Intent breakdown</h4>
          <div v-for="item in data.buyerPersonas.intentBreakdown" :key="item.event_type" class="vi-bar-row">
            <span class="vi-bar-label">{{ item.event_type.replace(/_/g, ' ') }}</span>
            <div class="vi-bar-track">
              <div
                class="vi-bar-fill"
                :style="{ width: barWidth(item.count, data.buyerPersonas.intentBreakdown) + '%' }"
              />
            </div>
            <span class="vi-bar-count">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface IntelligenceData {
  upgradeRequired: boolean
  plan: string
  noListings?: boolean
  competitiveSentimentMap: {
    yourScore: number
    categoryAvg: number
    topCompetitor: { name: string; score: number } | null
    reviewCount: number
  }
  contentGaps: string[]
  buyerPersonas: {
    topRole: string
    topCompany: string
    topIndustry: string
    intentBreakdown: Array<{ event_type: string; count: number }>
  }
}

const data = ref<IntelligenceData | null>(null)
const loading = ref(false)
const err = ref('')
const upgradeRequired = ref(false)
const noListings = ref(false)

async function load() {
  loading.value = true
  err.value = ''
  try {
    const res = await $fetch<IntelligenceData>('/api/vendor/intelligence')
    if (res.upgradeRequired) {
      upgradeRequired.value = true
    } else if (res.noListings) {
      noListings.value = true
    } else {
      data.value = res
    }
  } catch (e: unknown) {
    const code = (e as { statusCode?: number })?.statusCode
    if (code === 402) {
      upgradeRequired.value = true
    } else {
      err.value = 'Failed to load competitive intelligence. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function barWidth(count: number, breakdown: Array<{ count: number }>): number {
  const max = Math.max(...breakdown.map(b => b.count))
  return max > 0 ? Math.round((count / max) * 100) : 0
}

onMounted(load)
</script>

<style scoped>
.vi { padding: 20px; margin-bottom: 20px; }

.vi-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}
.vi-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 4px 0 2px;
  display: inline-block;
  margin-left: 6px;
}
.vi-sub { font-size: 0.82rem; color: var(--vw-text-subtle); margin: 0; }

/* Upgrade / empty */
.vi-upgrade {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--vw-surface-2);
  border-radius: 10px;
  border: 1px dashed var(--vw-border);
}
.vi-lock { font-size: 24px; color: var(--vw-text-subtle); flex-shrink: 0; }
.vi-upgrade__title { font-weight: 700; font-size: 0.9rem; margin: 0 0 2px; }
.vi-upgrade__body { font-size: 0.8rem; color: var(--vw-text-subtle); margin: 0; }

.vi-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px;
  color: var(--vw-text-subtle);
  font-size: 0.88rem;
  justify-content: center;
}

/* Skeletons */
.vi-skels { display: grid; gap: 12px; }
.vi-skel {
  height: 80px;
  background: var(--vw-surface-2);
  border-radius: 10px;
  animation: vi-shimmer 1.4s ease-in-out infinite;
}
.vi-skel--sm { height: 50px; }
@keyframes vi-shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Error */
.vi-err {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #f87171;
  padding: 12px;
}

/* Sections */
.vi-section { margin-bottom: 20px; }
.vi-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vw-text-subtle);
  margin: 0 0 10px;
}

/* Score map */
.vi-scores {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--vw-surface-2);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--vw-border);
}
.vi-score-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 10px;
  gap: 4px;
}
.vi-score-col--you { background: var(--vw-ai-50); }
.vi-score__n { font-size: 1.35rem; font-weight: 700; font-family: var(--f-ui); }
.vi-score__l { font-size: 0.72rem; color: var(--vw-text-subtle); text-align: center; }
.vi-score-divider { width: 1px; background: var(--vw-border); align-self: stretch; }

/* Gaps */
.vi-gaps { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.vi-gap {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: var(--vw-surface-2);
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.5;
}
.vi-gap__icon { color: var(--vw-ai-text); flex-shrink: 0; margin-top: 1px; }

/* Personas */
.vi-personas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.vi-persona {
  padding: 10px 12px;
  background: var(--vw-surface-2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.vi-persona__label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--vw-text-subtle); font-weight: 600; }
.vi-persona__val { font-size: 0.88rem; font-weight: 600; }

/* Intent bar */
.vi-breakdown__title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--vw-text-subtle); margin: 0 0 8px; }
.vi-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; font-size: 0.8rem; }
.vi-bar-label { width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--vw-text-muted); text-transform: capitalize; flex-shrink: 0; }
.vi-bar-track { flex: 1; height: 6px; background: var(--vw-surface-2); border-radius: 999px; overflow: hidden; }
.vi-bar-fill { height: 100%; background: var(--vw-ai-text); border-radius: 999px; transition: width 0.4s ease; }
.vi-bar-count { width: 28px; text-align: right; color: var(--vw-text-subtle); flex-shrink: 0; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .vi-personas { grid-template-columns: 1fr 1fr; }
  .vi-scores { flex-wrap: wrap; }
}
</style>
