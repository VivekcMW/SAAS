<template>
  <BuyerCompare v-if="role === 'buyer'" />
  <div v-else class="analytics-page">
    <header class="page-header">
      <div>
        <h1>Analytics</h1>
        <p>Detailed insights and performance metrics across your products.</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedPeriod" class="period-select" aria-label="Select period">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <button type="button" class="btn btn-ghost" @click="refreshData">
          <UIcon dynamic name="i-heroicons-arrow-path" :class="{ spin: isRefreshing }" />
          <span>Refresh</span>
        </button>
        <button type="button" class="btn btn-primary" @click="exportReport">
          <UIcon dynamic name="i-heroicons-arrow-down-tray" />
          <span>Export CSV</span>
        </button>
      </div>
    </header>

    <output v-if="toastMsg" class="toast toast-success">
      <UIcon dynamic name="i-heroicons-check-circle" />
      <span>{{ toastMsg }}</span>
    </output>

    <!-- KPI Stats -->
    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-blue">
          <UIcon dynamic name="i-heroicons-eye" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Views</span>
          <span class="stat-value">{{ formatNumber(totalViews) }}</span>
          <span class="stat-change positive">
            <UIcon dynamic name="i-heroicons-arrow-trending-up" /> +12.5%
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-teal">
          <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Clicks</span>
          <span class="stat-value">{{ formatNumber(totalClicks) }}</span>
          <span class="stat-change positive">
            <UIcon dynamic name="i-heroicons-arrow-trending-up" /> +8.3%
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-orange">
          <UIcon dynamic name="i-heroicons-arrow-trending-up" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Conversion Rate</span>
          <span class="stat-value">{{ conversionRate }}%</span>
          <span class="stat-change negative">
            <UIcon dynamic name="i-heroicons-arrow-trending-down" /> -2.1%
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-purple">
          <UIcon dynamic name="i-heroicons-currency-dollar" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Revenue</span>
          <span class="stat-value">${{ formatNumber(totalRevenue) }}</span>
          <span class="stat-change positive">
            <UIcon dynamic name="i-heroicons-arrow-trending-up" /> +15.7%
          </span>
        </div>
      </div>
    </section>

    <div class="analytics-grid">
      <!-- Main Chart -->
      <section class="card main-chart">
        <div class="card-head">
          <div>
            <h3>Performance Overview</h3>
            <p>Views, clicks and revenue trend for the selected period.</p>
          </div>
          <div class="segmented">
            <button
              v-for="m in metricOptions"
              :key="m.value"
              type="button"
              :class="['segmented-btn', { active: activeMetric === m.value }]"
              @click="activeMetric = m.value"
            >
              {{ m.label }}
            </button>
          </div>
        </div>
        <div class="card-body">
          <DashboardAnalytics :data="analyticsData" :period="selectedPeriod" />
        </div>
      </section>

      <!-- Top pages -->
      <section class="card top-pages">
        <div class="card-head">
          <div>
            <h3>Top Products</h3>
            <p>Ranked by views this period.</p>
          </div>
        </div>
        <div class="card-body">
          <ul class="rank-list">
            <li v-for="(item, idx) in topProducts" :key="item.name" class="rank-row">
              <span class="rank-index">{{ idx + 1 }}</span>
              <div class="rank-meta">
                <span class="rank-name">{{ item.name }}</span>
                <span class="rank-sub">{{ item.category }}</span>
              </div>
              <div class="rank-value">
                <span>{{ formatNumber(item.views) }}</span>
                <span class="rank-trend" :class="item.trend >= 0 ? 'positive' : 'negative'">
                  {{ item.trend >= 0 ? '+' : '' }}{{ item.trend }}%
                </span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Geo distribution -->
      <section class="card geo-card">
        <div class="card-head">
          <div>
            <h3>Geographic Distribution</h3>
            <p>Where your visitors are coming from.</p>
          </div>
        </div>
        <div class="card-body">
          <DashboardGeoMap :countries="geoData" />
        </div>
      </section>

      <!-- Traffic sources -->
      <section class="card sources-card">
        <div class="card-head">
          <div>
            <h3>Traffic Sources</h3>
            <p>Breakdown by channel.</p>
          </div>
        </div>
        <div class="card-body">
          <ul class="source-list">
            <li v-for="src in trafficSources" :key="src.name" class="source-row">
              <div class="source-head">
                <span class="source-name">{{ src.name }}</span>
                <span class="source-val">{{ src.percent }}%</span>
              </div>
              <div class="bar">
                <div class="bar-fill" :style="{ width: src.percent + '%', background: src.color }" />
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { currentUser } = useAuth()
const role = computed(() => currentUser.value?.role || 'buyer')

useSeoMeta({
  title: 'Analytics — SaaSWorld Dashboard',
  description: 'Detailed analytics and performance insights for your products.'
})

definePageMeta({ layout: false })

// State
const selectedPeriod = ref('30d')
const activeMetric = ref<'views' | 'clicks' | 'revenue'>('views')
const isRefreshing = ref(false)
const toastMsg = ref('')

const flash = (msg: string) => {
  toastMsg.value = msg
  setTimeout(() => (toastMsg.value = ''), 2500)
}

const metricOptions = [
  { value: 'views' as const, label: 'Views' },
  { value: 'clicks' as const, label: 'Clicks' },
  { value: 'revenue' as const, label: 'Revenue' }
]

// KPI values
const totalViews = ref(12540)
const totalClicks = ref(890)
const totalRevenue = ref(3850)

const conversionRate = computed(() =>
  ((totalClicks.value / totalViews.value) * 100).toFixed(2)
)

const PERIOD_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }

// Chart data
const analyticsData = computed(() => {
  const days = PERIOD_DAYS[selectedPeriod.value] ?? 30
  const data = [] as Array<{ date: string; views: number; clicks: number; revenue: number }>
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const views = Math.floor(Math.random() * 500) + 100
    const clicks = Math.floor(views * (Math.random() * 0.15 + 0.05))
    data.push({
      date: date.toISOString().split('T')[0],
      views,
      clicks,
      revenue: Math.floor(clicks * (Math.random() * 10 + 5))
    })
  }
  return data
})

// Top products
const topProducts = ref([
  { name: 'CloudSync Pro', category: 'Productivity', views: 4820, trend: 18 },
  { name: 'InsightBoard', category: 'Analytics', views: 3510, trend: 9 },
  { name: 'SecureVault', category: 'Security', views: 2230, trend: -4 },
  { name: 'FlowDocs', category: 'Collaboration', views: 1640, trend: 12 },
  { name: 'PixelKit', category: 'Design', views: 980, trend: 3 }
])

// Geo data
const geoData = ref([
  { country: 'United States', visitors: 3542, percentage: 28.2 },
  { country: 'United Kingdom', visitors: 2103, percentage: 16.8 },
  { country: 'Germany', visitors: 1876, percentage: 15 },
  { country: 'Canada', visitors: 1254, percentage: 10 },
  { country: 'France', visitors: 987, percentage: 7.9 },
  { country: 'Australia', visitors: 765, percentage: 6.1 },
  { country: 'Netherlands', visitors: 543, percentage: 4.3 },
  { country: 'Others', visitors: 1470, percentage: 11.7 }
])

// Traffic sources
const trafficSources = ref([
  { name: 'Organic Search', percent: 42, color: '#0073e6' },
  { name: 'Direct', percent: 24, color: '#14b8a6' },
  { name: 'Referral', percent: 18, color: '#f97316' },
  { name: 'Social', percent: 11, color: '#a855f7' },
  { name: 'Email', percent: 5, color: '#64748b' }
])

// Helpers
const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

const refreshData = () => {
  isRefreshing.value = true
  setTimeout(() => {
    totalViews.value = 10_000 + Math.floor(Math.random() * 5000)
    totalClicks.value = 600 + Math.floor(Math.random() * 500)
    totalRevenue.value = 3000 + Math.floor(Math.random() * 2000)
    isRefreshing.value = false
    flash('Analytics data refreshed.')
  }, 500)
}

const exportReport = () => {
  const rows = [
    ['Metric', 'Value'],
    ['Total Views', String(totalViews.value)],
    ['Total Clicks', String(totalClicks.value)],
    ['Conversion Rate (%)', conversionRate.value],
    ['Total Revenue ($)', String(totalRevenue.value)],
    [],
    ['Top Products', 'Views', 'Trend (%)'],
    ...topProducts.value.map(p => [p.name, String(p.views), String(p.trend)]),
    [],
    ['Country', 'Visitors', 'Percentage'],
    ...geoData.value.map(g => [g.country, String(g.visitors), String(g.percentage)])
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  flash('Report exported.')
}
</script>

<style scoped>
.analytics-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: #0f172a;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #0f172a;
}
.page-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.9375rem;
}
.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.period-select {
  height: 38px;
  padding: 0 2rem 0 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  font-size: 0.875rem;
  color: #0f172a;
  cursor: pointer;
}
.period-select:focus {
  outline: none;
  border-color: #0073e6;
  box-shadow: 0 0 0 3px rgba(0, 115, 230, 0.15);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 38px;
  padding: 0 1rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.btn :deep(svg) { width: 16px; height: 16px; }
.btn-primary { background: #0073e6; color: #fff; }
.btn-primary:hover { background: #005cb8; }
.btn-ghost { background: transparent; color: #334155; border-color: #e2e8f0; }
.btn-ghost:hover { background: #f1f5f9; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Toast */
.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}
.toast :deep(svg) { width: 18px; height: 18px; }
.toast-success {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.stat-icon :deep(svg) { width: 22px; height: 22px; }
.stat-icon-blue { background: #0073e6; }
.stat-icon-teal { background: #14b8a6; }
.stat-icon-orange { background: #f97316; }
.stat-icon-purple { background: #a855f7; }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}
.stat-label {
  font-size: 0.8125rem;
  color: #64748b;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}
.stat-change {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.125rem;
}
.stat-change :deep(svg) { width: 14px; height: 14px; }
.stat-change.positive { color: #059669; }
.stat-change.negative { color: #dc2626; }

/* Layout grid */
.analytics-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}
.main-chart { grid-column: 1 / -1; }
.geo-card, .sources-card, .top-pages { grid-column: auto; }

@media (max-width: 960px) {
  .analytics-grid { grid-template-columns: 1fr; }
}

/* Cards */
.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.card-head h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}
.card-head p {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: #64748b;
}
.card-body {
  padding: 1.25rem;
}

/* Segmented control */
.segmented {
  display: inline-flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 2px;
  background: #f8fafc;
}
.segmented-btn {
  border: none;
  background: transparent;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #64748b;
  border-radius: 4px;
  cursor: pointer;
}
.segmented-btn.active {
  background: #fff;
  color: #0073e6;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

/* Rank list (top products) */
.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}
.rank-row + .rank-row { border-top: 1px solid #f1f5f9; padding-top: 0.75rem; }
.rank-index {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rank-meta { flex: 1; min-width: 0; }
.rank-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}
.rank-sub {
  font-size: 0.75rem;
  color: #64748b;
}
.rank-value {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.rank-value > span:first-child {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}
.rank-trend { font-size: 0.75rem; font-weight: 600; }
.rank-trend.positive { color: #059669; }
.rank-trend.negative { color: #dc2626; }

/* Traffic sources */
.source-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.source-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: #334155;
  margin-bottom: 0.375rem;
}
.source-name { font-weight: 500; }
.source-val { font-weight: 600; color: #0f172a; }
.bar {
  height: 8px;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

@media (max-width: 640px) {
  .page-header { flex-direction: column; align-items: stretch; }
  .header-actions { justify-content: flex-start; }
  .stat-value { font-size: 1.25rem; }
}
</style>
