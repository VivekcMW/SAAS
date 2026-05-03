<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Auto-Discovery Queue</h1>
        <p class="bw-head__sub">
          {{ statusCounts.pending ?? 0 }} pending ·
          {{ statusCounts.approved ?? 0 }} approved ·
          {{ statusCounts.rejected ?? 0 }} rejected
        </p>
      </div>
      <button class="bw-btn bw-btn--primary" :disabled="triggerLoading" @click="openTriggerModal">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12l7-7 7 7" />
        </svg>
        Trigger Discovery
      </button>
    </header>

    <!-- Crawler source buttons -->
    <div class="dq-sources">
      <span class="dq-sources__label">Run crawler:</span>
      <button
        v-for="src in SOURCES"
        :key="src.key"
        class="bw-btn bw-btn--sm bw-btn--outline"
        :disabled="!!runningSource"
        @click="runCrawler(src.key)"
      >
        <span v-if="runningSource === src.key" class="dq-spinner" aria-hidden="true" />
        {{ src.label }}
      </button>
    </div>

    <!-- Filter bar -->
    <div class="dq-filters">
      <button
        v-for="s in statuses"
        :key="s.value"
        class="bw-tab"
        :class="{ 'bw-tab--active': filterStatus === s.value }"
        @click="setFilter(s.value)"
      >{{ s.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bw-empty">
      <p class="bw-empty__title">Loading…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!queue.length" class="bw-empty">
      <p class="bw-empty__title">No items.</p>
      <p class="bw-empty__desc">No discovery queue items match this filter.</p>
    </div>

    <!-- Grid -->
    <div v-else class="bw-grid bw-grid--main-aside">
      <!-- List -->
      <section class="bw-card bw-card--compact">
        <ul class="pq-list">
          <li
            v-for="item in queue"
            :key="item.id"
            class="pq-item"
            :class="{ 'pq-item--active': selected?.id === item.id }"
            @click="selectedId = item.id"
          >
            <div class="dq-score" :class="scoreClass(item.confidenceScore)">
              {{ Math.round(item.confidenceScore) }}%
            </div>
            <div class="pq-item__body">
              <div class="pq-name">{{ item.extractedData?.name || item.websiteUrl }}</div>
              <div class="pq-meta">{{ item.extractedData?.category || 'Uncategorised' }}</div>
              <div class="pq-meta pq-meta--muted">{{ formatDate(item.createdAt) }}</div>
            </div>
            <span class="dq-badge" :class="`dq-badge--${item.status}`">{{ item.status }}</span>
          </li>
        </ul>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="dq-pagination">
          <button class="bw-btn bw-btn--ghost bw-btn--sm" :disabled="pagination.page <= 1" @click="page--; load()">‹ Prev</button>
          <span class="dq-page-info">{{ pagination.page }} / {{ pagination.pages }}</span>
          <button class="bw-btn bw-btn--ghost bw-btn--sm" :disabled="pagination.page >= pagination.pages" @click="page++; load()">Next ›</button>
        </div>
      </section>

      <!-- Detail panel -->
      <section v-if="selected" class="bw-card dq-detail">
        <div class="pq-detail-head">
          <div>
            <h2 class="pq-detail-title">{{ selected.extractedData?.name || 'Unknown Tool' }}</h2>
            <a :href="selected.websiteUrl" target="_blank" rel="noopener noreferrer" class="dq-url">{{ selected.websiteUrl }}</a>
            <p class="pq-detail-sub">
              Source: {{ selected.source }} ·
              Confidence: {{ Math.round(selected.confidenceScore) }}% ·
              {{ formatDate(selected.createdAt) }}
            </p>
          </div>
        </div>

        <div v-if="selected.extractedData" class="pq-meta-grid">
          <div>
            <div class="pq-label">Category</div>
            <div>{{ selected.extractedData.category || '—' }}</div>
          </div>
          <div>
            <div class="pq-label">Pricing</div>
            <div>{{ selected.extractedData.pricingType || '—' }}</div>
          </div>
          <div v-if="selected.extractedData.pricingValue">
            <div class="pq-label">Price</div>
            <div>${{ selected.extractedData.pricingValue }}/mo</div>
          </div>
          <div>
            <div class="pq-label">Score route</div>
            <div>{{ selected.route || '—' }}</div>
          </div>
        </div>

        <div v-if="selected.extractedData?.description" class="pq-desc">
          <div class="pq-label">Description</div>
          <p class="pq-desc-text">{{ selected.extractedData.description }}</p>
        </div>

        <div v-if="['pending', 'needs_review', 'auto_approved'].includes(selected.status)" class="pq-actions">
          <button class="bw-btn bw-btn--primary" :disabled="!!actioning" @click="approve(selected.id)">
            {{ actioning === 'approve' ? 'Approving…' : 'Approve & Publish' }}
          </button>
          <button class="bw-btn bw-btn--ghost" :disabled="!!actioning" @click="reject(selected.id)">
            {{ actioning === 'reject' ? 'Rejecting…' : 'Reject' }}
          </button>
          <button class="bw-btn bw-btn--outline" @click="openOutreach(selected)">Send Outreach</button>
        </div>
        <div v-else class="dq-action-done">
          Status: <span class="dq-badge" :class="`dq-badge--${selected.status}`">{{ selected.status }}</span>
          <button v-if="['outreached', 'approved'].includes(selected.status)" class="bw-btn bw-btn--sm bw-btn--outline" @click="openOutreach(selected)">Re-send Outreach</button>
        </div>

        <!-- Outreach inline form -->
        <div v-if="outreachItemId === selected.id" class="dq-outreach-form">
          <p class="pq-label" style="margin-bottom:6px">Outreach email</p>
          <div class="dq-outreach-row">
            <input v-model="outreachEmail" type="email" class="dq-textarea" style="padding:8px 12px;resize:none;height:auto" placeholder="founder@company.com" />
            <input v-model="outreachName" class="dq-textarea" style="padding:8px 12px;resize:none;height:auto" placeholder="Name (optional)" />
            <button class="bw-btn bw-btn--primary" :disabled="outreachingId === selected.id" @click="sendOutreach(selected)">
              {{ outreachingId === selected.id ? 'Sending…' : 'Send' }}
            </button>
            <button class="bw-btn bw-btn--ghost" @click="outreachItemId = null">Cancel</button>
          </div>
          <p v-if="outreachError" class="dq-trigger-error">{{ outreachError }}</p>
        </div>
      </section>
    </div>

    <!-- Trigger Modal -->
    <div v-if="showTriggerModal" class="dq-modal-backdrop" @click.self="closeTriggerModal">
      <div class="dq-modal">
        <h2 class="dq-modal__title">Trigger Auto-Discovery</h2>
        <p class="dq-modal__sub">Enter up to 10 URLs (one per line) to run through the discovery pipeline.</p>
        <textarea
          v-model="triggerUrls"
          class="dq-textarea"
          placeholder="https://example.com&#10;https://another.io"
          rows="7"
        />
        <p v-if="triggerError" class="dq-trigger-error">{{ triggerError }}</p>
        <p v-if="triggerSuccess" class="dq-trigger-success">{{ triggerSuccess }}</p>
        <div class="dq-modal__actions">
          <button class="bw-btn bw-btn--primary" :disabled="triggerLoading" @click="triggerDiscovery">
            {{ triggerLoading ? 'Running…' : 'Run Discovery' }}
          </button>
          <button class="bw-btn bw-btn--ghost" @click="closeTriggerModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ExtractedData {
  name?: string
  category?: string
  description?: string
  pricingType?: string
  pricingValue?: number
}

interface QueueItem {
  id: string
  websiteUrl: string
  source: string
  extractedData: ExtractedData | null
  confidenceScore: number
  status: string
  route: string | null
  createdAt: string
}

interface Pagination { page: number; pages: number; total: number; limit: number }

const statuses = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'needs_review', label: 'Needs Review' },
  { value: 'auto_approved', label: 'Auto-Approved' },
  { value: 'approved', label: 'Approved' },
  { value: 'outreached', label: 'Outreached' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'rejected', label: 'Rejected' }
]

const SOURCES = [
  { key: 'yc', label: 'YC' },
  { key: 'producthunt', label: 'Product Hunt' },
  { key: 'github', label: 'GitHub' },
  { key: 'hackernews', label: 'HN' },
  { key: 'indiehackers', label: 'IndieHackers' },
  { key: 'reddit', label: 'Reddit' },
  { key: 'appsumo', label: 'AppSumo' },
  { key: 'zapier', label: 'Zapier' },
  { key: 'enrich', label: 'Enrich (Proxycurl)', variant: 'enrichment' }
]

const queue = ref<QueueItem[]>([])
const statusCounts = ref<Record<string, number>>({})
const pagination = ref<Pagination>({ page: 1, pages: 1, total: 0, limit: 20 })
const loading = ref(false)
const filterStatus = ref('pending')
const page = ref(1)
const selectedId = ref<string | null>(null)
const actioning = ref<string | false>(false)
const selected = computed(() => queue.value.find(i => i.id === selectedId.value) ?? null)

const showTriggerModal = ref(false)
const triggerUrls = ref('')
const triggerLoading = ref(false)
const triggerError = ref('')
const triggerSuccess = ref('')
const runningSource = ref<string | null>(null)
const outreachItemId = ref<string | null>(null)
const outreachEmail = ref('')
const outreachName = ref('')
const outreachError = ref('')
const outreachingId = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: '20' })
    if (filterStatus.value) params.set('status', filterStatus.value)
    const data = await $fetch<{
      items: QueueItem[]
      counts: Record<string, number>
      pagination: Pagination
    }>(`/api/admin/discovery/queue?${params}`)
    queue.value = data.items
    statusCounts.value = data.counts
    pagination.value = data.pagination
    if (!selectedId.value && data.items.length) {
      selectedId.value = data.items[0].id
    }
  } catch (err) {
    console.error('[discovery] load error', err)
  } finally {
    loading.value = false
  }
}

function setFilter(s: string) {
  filterStatus.value = s
  page.value = 1
  selectedId.value = null
  load()
}

async function approve(id: string) {
  actioning.value = 'approve'
  try {
    await $fetch(`/api/admin/discovery/${id}/approve`, { method: 'POST', body: { overrides: {} } })
    await load()
  } catch (e) {
    console.error(e)
  } finally {
    actioning.value = false
  }
}

async function reject(id: string) {
  actioning.value = 'reject'
  try {
    await $fetch(`/api/admin/discovery/${id}/reject`, { method: 'POST', body: {} })
    await load()
  } catch (e) {
    console.error(e)
  } finally {
    actioning.value = false
  }
}

function openTriggerModal() {
  triggerUrls.value = ''
  triggerError.value = ''
  triggerSuccess.value = ''
  showTriggerModal.value = true
}

function closeTriggerModal() {
  showTriggerModal.value = false
}

async function runCrawler(source: string) {
  runningSource.value = source
  try {
    await $fetch('/api/admin/discovery/run', { method: 'POST', body: { source, limit: 100 } })
    setTimeout(() => load(), 3000)
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    alert(err?.data?.statusMessage ?? 'Failed to start crawler')
  }
  finally { runningSource.value = null }
}

function openOutreach(item: QueueItem) {
  outreachItemId.value = item.id
  outreachEmail.value = ''
  outreachName.value = item.extractedData?.name ?? ''
  outreachError.value = ''
}

async function sendOutreach(item: QueueItem) {
  if (!outreachEmail.value) { outreachError.value = 'Email is required'; return }
  outreachingId.value = item.id
  outreachError.value = ''
  try {
    await $fetch('/api/admin/discovery/outreach', {
      method: 'POST',
      body: { queue_item_id: item.id, email: outreachEmail.value, name: outreachName.value || undefined }
    })
    outreachItemId.value = null
    await load()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    outreachError.value = err?.data?.statusMessage ?? 'Failed to send'
  }
  finally { outreachingId.value = null }
}

async function triggerDiscovery() {
  triggerError.value = ''
  triggerSuccess.value = ''
  const urls = triggerUrls.value
    .split('\n')
    .map(u => u.trim())
    .filter(u => u.startsWith('http'))

  if (!urls.length) {
    triggerError.value = 'Enter at least one valid URL.'
    return
  }
  if (urls.length > 10) {
    triggerError.value = 'Maximum 10 URLs per run.'
    return
  }

  triggerLoading.value = true
  try {
    const res = await $fetch<{ queued: number }>('/api/admin/discovery/trigger', {
      method: 'POST',
      body: { urls }
    })
    triggerSuccess.value = `${res.queued} URL(s) queued for discovery.`
    setTimeout(() => {
      closeTriggerModal()
      load()
    }, 1500)
  } catch (e: unknown) {
    triggerError.value = (e as { data?: { message?: string } })?.data?.message || 'Discovery failed.'
  } finally {
    triggerLoading.value = false
  }
}

function scoreClass(score: number) {
  if (score >= 80) return 'dq-score--high'
  if (score >= 50) return 'dq-score--mid'
  return 'dq-score--low'
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(load)
</script>

<style scoped>
.dq-filters { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.bw-tab { padding: 6px 16px; border-radius: 999px; font-size: 0.82rem; font-weight: 500; border: 1.5px solid var(--aw-border); background: transparent; cursor: pointer; color: var(--aw-text-muted); transition: all 0.12s; }
.bw-tab:hover { border-color: var(--aw-accent); color: var(--aw-accent); }
.bw-tab--active { background: var(--aw-accent); border-color: var(--aw-accent); color: #fff; }
.dq-score { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; flex-shrink: 0; }
.dq-score--high { background: var(--aw-green-50, #ecfdf5); color: var(--aw-green-700, #047857); }
.dq-score--mid  { background: var(--aw-yellow-50, #fefce8); color: var(--aw-yellow-700, #a16207); }
.dq-score--low  { background: var(--aw-red-50, #fef2f2); color: var(--aw-red-700, #b91c1c); }
.dq-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
.dq-badge--pending      { background: var(--aw-yellow-50, #fefce8); color: var(--aw-yellow-700, #a16207); }
.dq-badge--approved     { background: var(--aw-green-50, #ecfdf5); color: var(--aw-green-700, #047857); }
.dq-badge--rejected     { background: var(--aw-red-50, #fef2f2); color: var(--aw-red-700, #b91c1c); }
.dq-badge--needs_review { background: var(--aw-surface-2); color: var(--aw-text-muted); }
.dq-url { font-size: 0.8rem; color: var(--aw-accent); word-break: break-all; text-decoration: none; display: block; margin-bottom: 4px; }
.dq-url:hover { text-decoration: underline; }
.dq-detail { min-height: 300px; }
.dq-action-done { font-size: 0.88rem; color: var(--aw-text-muted); margin-top: 20px; display: flex; align-items: center; gap: 10px; }
.dq-pagination { display: flex; align-items: center; gap: 12px; justify-content: center; padding-top: 16px; border-top: 1px solid var(--aw-border); margin-top: 8px; }
.dq-page-info { font-size: 0.82rem; color: var(--aw-text-muted); }
.dq-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; }
.dq-modal { background: var(--aw-surface-1, #fff); border-radius: 16px; padding: 32px; width: min(520px, 90vw); box-shadow: 0 24px 48px rgba(0,0,0,0.15); }
.dq-modal__title { font-size: 1.2rem; font-weight: 700; margin-bottom: 6px; }
.dq-modal__sub { font-size: 0.88rem; color: var(--aw-text-muted); margin-bottom: 16px; }
.dq-modal__actions { display: flex; gap: 12px; margin-top: 16px; }
.dq-textarea { width: 100%; border: 1.5px solid var(--aw-border); border-radius: 10px; padding: 10px 14px; font-size: 0.88rem; font-family: inherit; resize: vertical; color: var(--aw-text); background: var(--aw-surface-2); }
.dq-textarea:focus { outline: none; border-color: var(--aw-accent); }
.dq-trigger-error   { color: var(--aw-red-700, #b91c1c); font-size: 0.82rem; margin-top: 6px; }
.dq-trigger-success { color: var(--aw-green-700, #047857); font-size: 0.82rem; margin-top: 6px; }
.pq-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.pq-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; cursor: pointer; transition: background 0.12s; }
.pq-item:hover { background: var(--aw-surface-2); }
.pq-item--active { background: var(--aw-accent-50); }
.pq-item--active .pq-name { color: var(--aw-accent-text); }
.pq-item__body { flex: 1; min-width: 0; }
.pq-name { font-weight: 600; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pq-meta { font-size: 0.78rem; color: var(--aw-text-muted); }
.pq-meta--muted { opacity: 0.65; }
.pq-detail-head { margin-bottom: 16px; }
.pq-detail-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 2px; }
.pq-detail-sub { font-size: 0.78rem; color: var(--aw-text-muted); }
.pq-meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px 24px; background: var(--aw-surface-2); border-radius: 10px; padding: 14px 16px; font-size: 0.85rem; margin-bottom: 16px; }
.pq-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--aw-text-muted); margin-bottom: 2px; font-weight: 600; }
.pq-desc { margin-bottom: 16px; }
.pq-desc-text { font-size: 0.88rem; color: var(--aw-text-muted); line-height: 1.6; margin-top: 4px; }
.pq-actions { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
.dq-sources { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.dq-sources__label { font-size: 0.82rem; color: var(--aw-text-muted); font-weight: 500; }
.bw-btn--sm { padding: 4px 12px; font-size: 0.8rem; }
.bw-btn--outline { background: transparent; border: 1.5px solid var(--aw-border); color: var(--aw-text); }
.bw-btn--outline:hover { border-color: var(--aw-accent); color: var(--aw-accent); }
.dq-spinner { display: inline-block; width: 10px; height: 10px; border: 1.5px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.dq-outreach-form { margin-top: 16px; padding: 14px 16px; background: var(--aw-surface-2); border-radius: 10px; }
.dq-outreach-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.dq-outreach-row input { flex: 1; min-width: 180px; }
.dq-badge--outreached { background: #f3e8ff; color: #7c3aed; }
.dq-badge--claimed    { background: #ccfbf1; color: #0f766e; }
.dq-badge--auto_approved { background: #dcfce7; color: #15803d; }
</style>
