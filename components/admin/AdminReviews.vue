<template>
  <div class="ar">
    <div class="ar-header">
      <h2 class="ar-title">Review Moderation</h2>
      <p class="ar-sub">Approve or reject user-submitted reviews before they appear publicly.</p>
    </div>

    <!-- Filters -->
    <div class="ar-filters">
      <div class="ar-filter-tabs">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          class="ar-filter-tab"
          :class="{ 'ar-filter-tab--active': filters.status === s.value }"
          @click="setStatus(s.value)"
        >
          {{ s.label }}
          <span v-if="s.value === 'pending' && pendingCount > 0" class="ar-badge">{{ pendingCount }}</span>
        </button>
      </div>
      <div class="ar-filter-right">
        <span class="ar-total">{{ total }} review{{ total !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Table -->
    <div v-if="loading" class="ar-loading">
      <div v-for="i in 5" :key="i" class="ar-skeleton" />
    </div>

    <div v-else-if="!reviews.length" class="ar-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <p>No {{ filters.status === 'all' ? '' : filters.status }} reviews found.</p>
    </div>

    <div v-else class="ar-list">
      <div v-for="review in reviews" :key="review.id" class="ar-card">
        <div class="ar-card-header">
          <div class="ar-card-meta">
            <div class="ar-stars">
              <span v-for="n in 5" :key="n" class="ar-star" :class="n <= review.rating ? 'ar-star--filled' : ''">★</span>
            </div>
            <span class="ar-app-name">
              <a :href="`/app/${review.app_slug}`" target="_blank" rel="noopener">{{ review.app_name || review.app_id }}</a>
            </span>
            <span class="ar-dot">·</span>
            <span class="ar-user">{{ review.user_email || 'Anonymous' }}</span>
            <span class="ar-dot">·</span>
            <span class="ar-date">{{ fmtDate(review.created_at) }}</span>
          </div>
          <span class="ar-status-badge" :class="`ar-status-badge--${review.status}`">{{ review.status }}</span>
        </div>

        <div class="ar-body">
          <p class="ar-title-text"><strong>{{ review.title }}</strong></p>
          <p class="ar-content">{{ review.body }}</p>
          <div v-if="review.pros || review.cons" class="ar-proscons">
            <span v-if="review.pros" class="ar-pro">👍 {{ review.pros }}</span>
            <span v-if="review.cons" class="ar-con">👎 {{ review.cons }}</span>
          </div>
        </div>

        <div class="ar-card-actions">
          <button
            v-if="review.status !== 'approved'"
            class="ar-btn ar-btn--approve"
            :disabled="processing.has(review.id)"
            @click="moderateReview(review.id, 'approved')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Approve
          </button>
          <button
            v-if="review.status !== 'rejected'"
            class="ar-btn ar-btn--reject"
            :disabled="processing.has(review.id)"
            @click="moderateReview(review.id, 'rejected')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="ar-pagination">
      <button class="ar-pg-btn" :disabled="page === 1" @click="page--; load()">← Prev</button>
      <span class="ar-pg-info">Page {{ page }} of {{ totalPages }}</span>
      <button class="ar-pg-btn" :disabled="page === totalPages" @click="page++; load()">Next →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface ReviewRow {
  id: string
  app_id: string
  app_name: string
  app_slug: string
  user_email: string
  rating: number
  title: string
  body: string
  pros: string
  cons: string
  status: string
  helpful_votes: number
  created_at: string
}

const reviews = ref<ReviewRow[]>([])
const total = ref(0)
const totalPages = ref(1)
const page = ref(1)
const loading = ref(false)
const processing = reactive(new Set<string>())

const filters = reactive({ status: 'pending' })

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
]

const pendingCount = ref(0)

async function load() {
  loading.value = true
  try {
    const data = await $fetch<any>('/api/admin/reviews', {
      query: { status: filters.status, page: page.value, limit: 20 },
    })
    reviews.value = data.reviews ?? []
    total.value = data.total ?? 0
    totalPages.value = data.totalPages ?? 1
  } catch (e: any) {
    console.error('Failed to load reviews', e)
  } finally {
    loading.value = false
  }
}

async function loadPendingCount() {
  try {
    const data = await $fetch<any>('/api/admin/reviews', { query: { status: 'pending', limit: 1 } })
    pendingCount.value = data.total ?? 0
  } catch { /* ignore */ }
}

async function moderateReview(reviewId: string, status: 'approved' | 'rejected') {
  processing.add(reviewId)
  try {
    await $fetch(`/api/admin/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: { status },
    })
    reviews.value = reviews.value.filter(r => r.id !== reviewId)
    total.value = Math.max(0, total.value - 1)
    if (status === 'approved' && filters.status === 'pending') pendingCount.value = Math.max(0, pendingCount.value - 1)
  } catch (e: any) {
    alert(e?.data?.statusMessage ?? 'Failed to update review')
  } finally {
    processing.delete(reviewId)
  }
}

function setStatus(s: string) {
  filters.status = s
  page.value = 1
  load()
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  load()
  loadPendingCount()
})
</script>

<style scoped>
.ar { padding: 0 0 40px; }
.ar-header { margin-bottom: 20px; }
.ar-title { font-size: 1.1rem; font-weight: 700; color: var(--bw-text); margin-bottom: 4px; }
.ar-sub { font-size: 0.85rem; color: var(--bw-text-muted); }

.ar-filters {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
}
.ar-filter-tabs { display: flex; gap: 4px; }
.ar-filter-tab {
  padding: 6px 14px; border-radius: 6px; border: 1px solid var(--bw-border);
  font-size: 0.83rem; font-weight: 500; cursor: pointer; background: var(--bw-bg);
  color: var(--bw-text-muted); transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 6px;
}
.ar-filter-tab:hover { color: var(--bw-text); }
.ar-filter-tab--active { background: var(--brand-primary, #6366f1); color: #fff; border-color: transparent; }
.ar-badge {
  background: #ef4444; color: #fff; border-radius: 99px;
  padding: 1px 7px; font-size: 0.72rem; font-weight: 700;
}
.ar-total { font-size: 0.82rem; color: var(--bw-text-muted); }

.ar-loading, .ar-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 48px; color: var(--bw-text-muted);
  gap: 12px; text-align: center;
}
.ar-skeleton { height: 100px; border-radius: 10px; background: var(--bw-bg-secondary, #f1f5f9); margin-bottom: 10px; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }

.ar-list { display: flex; flex-direction: column; gap: 12px; }
.ar-card {
  border: 1px solid var(--bw-border); border-radius: 10px;
  padding: 18px; background: var(--bw-bg); transition: box-shadow 0.15s;
}
.ar-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.07); }

.ar-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
.ar-card-meta { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; flex-wrap: wrap; }

.ar-stars { display: inline-flex; gap: 1px; }
.ar-star { color: #d1d5db; font-size: 14px; }
.ar-star--filled { color: #f59e0b; }

.ar-app-name a { color: var(--bw-text); text-decoration: none; font-weight: 600; }
.ar-app-name a:hover { text-decoration: underline; }
.ar-dot { color: var(--bw-border); }
.ar-user { color: var(--bw-text-muted); }
.ar-date { color: var(--bw-text-muted); }

.ar-status-badge {
  padding: 3px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600;
}
.ar-status-badge--pending { background: #fef3c7; color: #92400e; }
.ar-status-badge--approved { background: #dcfce7; color: #166534; }
.ar-status-badge--rejected { background: #fee2e2; color: #991b1b; }

.ar-body { margin-bottom: 14px; }
.ar-title-text { font-size: 0.9rem; margin-bottom: 4px; }
.ar-content { font-size: 0.85rem; color: var(--bw-text-muted); line-height: 1.6; }
.ar-proscons { display: flex; gap: 16px; margin-top: 8px; font-size: 0.82rem; }
.ar-pro { color: #16a34a; }
.ar-con { color: #dc2626; }

.ar-card-actions { display: flex; gap: 8px; }
.ar-btn {
  padding: 6px 14px; border-radius: 6px; font-size: 0.83rem; font-weight: 500;
  cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 5px;
  transition: all 0.15s;
}
.ar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ar-btn--approve { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.ar-btn--approve:hover:not(:disabled) { background: #16a34a; color: #fff; border-color: transparent; }
.ar-btn--reject { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
.ar-btn--reject:hover:not(:disabled) { background: #dc2626; color: #fff; border-color: transparent; }

.ar-pagination { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 24px; }
.ar-pg-btn {
  padding: 6px 14px; border-radius: 6px; border: 1px solid var(--bw-border);
  font-size: 0.83rem; cursor: pointer; background: var(--bw-bg); color: var(--bw-text);
}
.ar-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ar-pg-info { font-size: 0.83rem; color: var(--bw-text-muted); }
</style>
