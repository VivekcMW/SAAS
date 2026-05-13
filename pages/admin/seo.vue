<script setup lang="ts">
/**
 * /admin/seo — Admin SEO Dashboard
 *
 * Overview of SEO scores, IndexNow log, GSC keyword rankings.
 */
import { ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'default', middleware: 'admin' })

useHead({ title: 'SEO Dashboard — Admin | Moonmart' })

interface AppScore {
  app_id: string
  app_name: string
  app_slug: string
  seo_score: number
  last_scored_at: string | null
  faq_count: number
  indexnow_count: number
}

interface IndexNowLog {
  id: string
  url: string
  engine: string
  status: string
  submitted_at: string
}

interface GscTopQuery {
  query: string
  total_impressions: number
  total_clicks: number
  avg_position: number
  url_count: number
}

const appScores = ref<AppScore[]>([])
const recentIndexNow = ref<IndexNowLog[]>([])
const topQueries = ref<GscTopQuery[]>([])
const loading = ref(true)
const submittingCron = ref(false)
const cronMessage = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const [scores, logs, gsc] = await Promise.all([
      $fetch<{ scores: AppScore[] }>('/api/admin/seo/scores'),
      $fetch<{ logs: IndexNowLog[] }>('/api/admin/seo/indexnow-log'),
      $fetch<{ topQueries: GscTopQuery[] }>('/api/admin/seo/search-console?limit=20').catch(() => ({ topQueries: [] })),
    ])
    appScores.value = scores.scores
    recentIndexNow.value = logs.logs
    topQueries.value = gsc.topQueries
  } catch { /* ignore */ }
  loading.value = false
})

const avgScore = computed(() => {
  if (!appScores.value.length) return 0
  return Math.round(appScores.value.reduce((s, a) => s + a.seo_score, 0) / appScores.value.length)
})

const excellent = computed(() => appScores.value.filter(a => a.seo_score >= 80).length)
const needsWork = computed(() => appScores.value.filter(a => a.seo_score < 40).length)

const scoreColor = (s: number) => s >= 80 ? 'text-green-700' : s >= 60 ? 'text-yellow-700' : 'text-red-600'

async function runCronNow() {
  submittingCron.value = true
  cronMessage.value = ''
  try {
    const res = await $fetch<{ result: string }>('/api/_nitro/tasks/run', {
      method: 'POST',
      body: { taskName: 'seo:score-all' }
    })
    cronMessage.value = res.result || 'Done'
    // Reload scores
    const scores = await $fetch<{ scores: AppScore[] }>('/api/admin/seo/scores')
    appScores.value = scores.scores
  } catch {
    cronMessage.value = 'Failed to run task — check server logs.'
  }
  submittingCron.value = false
}
</script>

<template>
  <div class="admin-seo-page max-w-7xl mx-auto px-4 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">SEO Dashboard</h1>
        <p class="text-gray-500 text-sm">Per-app SEO health scores and indexing status</p>
      </div>
      <div class="flex gap-3 items-center">
        <span v-if="cronMessage" class="text-sm text-green-700">{{ cronMessage }}</span>
        <button
          class="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-60"
          :disabled="submittingCron"
          @click="runCronNow"
        >
          {{ submittingCron ? 'Running…' : '⟳ Run Score Cron Now' }}
        </button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-md p-5 text-center">
        <div class="text-3xl font-extrabold text-gray-900">{{ avgScore }}</div>
        <div class="text-sm text-gray-500">Avg SEO Score</div>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-md p-5 text-center">
        <div class="text-3xl font-extrabold text-green-700">{{ excellent }}</div>
        <div class="text-sm text-gray-500">Excellent (80+)</div>
      </div>
      <div class="bg-red-50 border border-red-200 rounded-md p-5 text-center">
        <div class="text-3xl font-extrabold text-red-600">{{ needsWork }}</div>
        <div class="text-sm text-gray-500">Needs Work (&lt;40)</div>
      </div>
    </div>

    <!-- App scores table -->
    <div class="bg-white rounded-md border border-gray-200 shadow-sm mb-10 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-left">
            <th class="px-4 py-3 font-semibold text-gray-600">App</th>
            <th class="px-4 py-3 font-semibold text-gray-600">SEO Score</th>
            <th class="px-4 py-3 font-semibold text-gray-600">FAQs</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Indexed</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Last Scored</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-8 text-gray-400">Loading…</td>
          </tr>
          <tr v-else-if="!appScores.length">
            <td colspan="6" class="text-center py-8 text-gray-400">No scores yet — run the cron to compute them.</td>
          </tr>
          <tr v-for="a in appScores" :key="a.app_id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3">
              <NuxtLink :to="`/marketplace/app/${a.app_slug}`" class="font-medium text-orange-600 hover:underline">{{ a.app_name }}</NuxtLink>
            </td>
            <td class="px-4 py-3">
              <span :class="['font-bold', scoreColor(a.seo_score)]">{{ Math.round(a.seo_score) }}/100</span>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ a.faq_count }}</td>
            <td class="px-4 py-3 text-gray-600">{{ a.indexnow_count }} times</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ a.last_scored_at ? new Date(a.last_scored_at).toLocaleDateString() : '—' }}</td>
            <td class="px-4 py-3">
              <NuxtLink :to="`/marketplace/app/${a.app_slug}`" class="text-xs text-blue-600 hover:underline">View</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- IndexNow log -->
    <h2 class="text-lg font-bold text-gray-900 mb-4">Recent IndexNow Submissions</h2>
    <div class="bg-white rounded-md border border-gray-200 shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-left">
            <th class="px-4 py-3 font-semibold text-gray-600">URL</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Engine</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Status</th>
            <th class="px-4 py-3 font-semibold text-gray-600">Submitted</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!recentIndexNow.length">
            <td colspan="4" class="text-center py-8 text-gray-400">No submissions yet</td>
          </tr>
          <tr v-for="log in recentIndexNow" :key="log.id" class="border-b border-gray-100">
            <td class="px-4 py-3 text-gray-700 text-xs max-w-xs truncate">{{ log.url }}</td>
            <td class="px-4 py-3 text-gray-600 capitalize">{{ log.engine }}</td>
            <td class="px-4 py-3">
              <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', log.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">{{ log.status }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ new Date(log.submitted_at).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Google Search Console — Top Keywords & Rankings -->
    <h2 class="text-lg font-bold text-gray-900 mt-10 mb-4">Keyword Rankings <span class="text-sm font-normal text-gray-400">(via GSC)</span></h2>
    <div class="bg-white rounded-md border border-gray-200 shadow-sm overflow-x-auto mb-10">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-left">
            <th class="px-4 py-3 font-semibold text-gray-600">Keyword</th>
            <th class="px-4 py-3 font-semibold text-gray-600 text-right">Impressions</th>
            <th class="px-4 py-3 font-semibold text-gray-600 text-right">Clicks</th>
            <th class="px-4 py-3 font-semibold text-gray-600 text-right">CTR</th>
            <th class="px-4 py-3 font-semibold text-gray-600 text-right">Avg Position</th>
            <th class="px-4 py-3 font-semibold text-gray-600 text-right">URLs</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!topQueries.length">
            <td colspan="6" class="text-center py-8 text-gray-400">
              No GSC data yet — ingest via
              <code class="bg-gray-100 px-1 rounded text-xs">POST /api/seo/gsc-ingest</code>
            </td>
          </tr>
          <tr v-for="q in topQueries" :key="q.query" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-800">{{ q.query }}</td>
            <td class="px-4 py-3 text-right text-gray-700">{{ q.total_impressions.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right text-gray-700">{{ q.total_clicks.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right text-gray-700">{{ (q.total_clicks / Math.max(q.total_impressions, 1) * 100).toFixed(1) }}%</td>
            <td class="px-4 py-3 text-right">
              <span :class="['font-semibold', q.avg_position <= 3 ? 'text-green-700' : q.avg_position <= 10 ? 'text-yellow-700' : 'text-red-600']">
                {{ q.avg_position.toFixed(1) }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-gray-500">{{ q.url_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Links to related admin pages -->
    <div class="flex gap-4 mt-6">
      <NuxtLink to="/admin/campaigns" class="text-sm text-orange-600 hover:underline font-medium">→ SEM Campaigns</NuxtLink>
      <NuxtLink to="/admin/listings" class="text-sm text-orange-600 hover:underline font-medium">→ Listings</NuxtLink>
    </div>
  </div>
</template>
