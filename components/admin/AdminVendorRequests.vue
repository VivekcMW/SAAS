<template>
  <div class="avr">
    <header class="avr-head">
      <h2 class="avr-head__title">Vendor Upgrade Requests</h2>
      <p class="avr-head__sub">Review buyer accounts requesting vendor access.</p>
      <div class="avr-tabs">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="avr-tab"
          :class="{ 'avr-tab--active': activeTab === t.id }"
          @click="activeTab = t.id; load()"
        >{{ t.label }} <span v-if="t.id === 'pending' && pending > 0" class="avr-badge">{{ pending }}</span></button>
      </div>
    </header>

    <div v-if="loading" class="avr-loading">Loading requests…</div>
    <div v-else-if="requests.length === 0" class="avr-empty">No {{ activeTab }} requests.</div>

    <ul v-else class="avr-list">
      <li v-for="req in requests" :key="req.id" class="avr-item">
        <div class="avr-item__info">
          <div class="avr-item__company">{{ req.companyName }}</div>
          <div class="avr-item__meta">
            <span>{{ req.email }}</span>
            <span class="avr-dot">·</span>
            <span>{{ fmtDate(req.createdAt) }}</span>
            <span v-if="req.websiteUrl" class="avr-dot">·</span>
            <a v-if="req.websiteUrl" :href="req.websiteUrl" target="_blank" rel="noopener noreferrer" class="avr-link">{{ req.websiteUrl }}</a>
          </div>
          <p v-if="req.reason" class="avr-item__reason">{{ req.reason }}</p>
          <p v-if="req.adminNote" class="avr-item__note">
            <strong>Admin note:</strong> {{ req.adminNote }}
          </p>
          <span v-if="req.status !== 'pending'" class="avr-status" :class="`avr-status--${req.status}`">{{ req.status }}</span>
        </div>

        <div v-if="req.status === 'pending'" class="avr-item__actions">
          <input v-model="noteMap[req.id]" type="text" class="avr-note-input" placeholder="Optional note to user…" >
          <button class="avr-btn avr-btn--approve" :disabled="actioning === req.id" @click="approve(req)">Approve</button>
          <button class="avr-btn avr-btn--reject" :disabled="actioning === req.id" @click="reject(req)">Reject</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface VendorRequest {
  id: string
  userId: string
  email: string
  fullName: string
  companyName: string
  websiteUrl: string | null
  reason: string | null
  status: string
  adminNote: string | null
  reviewedAt: string | null
  createdAt: string
}

const tabs = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

const activeTab = ref('pending')
const requests = ref<VendorRequest[]>([])
const loading = ref(false)
const actioning = ref<string | null>(null)
const noteMap = ref<Record<string, string>>({})
const pending = ref(0)

onMounted(() => { load(); loadPendingCount() })

async function load() {
  loading.value = true
  try {
    const data = await $fetch<{ requests: VendorRequest[] }>('/api/admin/vendor-requests', {
      params: { status: activeTab.value },
    })
    requests.value = data.requests
  } catch (_err) {
    console.error('[AdminVendorRequests] load failed:', err)
  } finally {
    loading.value = false
  }
}

async function loadPendingCount() {
  try {
    const data = await $fetch<{ requests: VendorRequest[] }>('/api/admin/vendor-requests', { params: { status: 'pending' } })
    pending.value = data.requests.length
  } catch { /* ignore */ }
}

async function approve(req: VendorRequest) {
  await action(req, 'approved')
}
async function reject(req: VendorRequest) {
  await action(req, 'rejected')
}

async function action(req: VendorRequest, status: 'approved' | 'rejected') {
  actioning.value = req.id
  try {
    await $fetch(`/api/admin/vendor-requests/${req.id}`, {
      method: 'PATCH',
      body: { status, adminNote: noteMap.value[req.id]?.trim() || undefined },
    })
    requests.value = requests.value.filter(r => r.id !== req.id)
    if (status === 'approved') pending.value = Math.max(0, pending.value - 1)
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Action failed')
  } finally {
    actioning.value = null
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.avr { padding: 1.5rem; }
.avr-head { margin-bottom: 1.5rem; }
.avr-head__title { font-size: 1.2rem; font-weight: 700; margin: 0 0 0.25rem; }
.avr-head__sub { font-size: 0.85rem; color: #64748b; margin: 0 0 1rem; }
.avr-tabs { display: flex; gap: 0.25rem; background: #f1f5f9; border-radius: 8px; padding: 3px; width: fit-content; }
.avr-tab { padding: 0.35rem 0.9rem; border: none; background: transparent; border-radius: 6px; font-size: 0.82rem; font-weight: 500; cursor: pointer; color: #64748b; display: inline-flex; align-items: center; gap: 0.4rem; }
.avr-tab--active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.avr-badge { background: #ef4444; color: #fff; border-radius: 99px; font-size: 0.7rem; font-weight: 700; padding: 0 5px; min-width: 16px; text-align: center; }

.avr-loading, .avr-empty { color: #64748b; font-size: 0.9rem; padding: 2rem 0; text-align: center; }

.avr-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.avr-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.25rem; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.avr-item__company { font-weight: 600; font-size: 0.95rem; color: #0f172a; margin-bottom: 3px; }
.avr-item__meta { font-size: 0.8rem; color: #64748b; display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem; margin-bottom: 0.4rem; }
.avr-dot { color: #cbd5e1; }
.avr-link { color: #2563eb; text-decoration: none; }
.avr-link:hover { text-decoration: underline; }
.avr-item__reason { font-size: 0.85rem; color: #475569; margin: 0.3rem 0 0; font-style: italic; }
.avr-item__note { font-size: 0.82rem; color: #92400e; background: #fef3c7; border-radius: 6px; padding: 4px 8px; margin: 0.4rem 0 0; }
.avr-status { display: inline-flex; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.06em; }
.avr-status--approved { background: #dcfce7; color: #166534; }
.avr-status--rejected { background: #fee2e2; color: #991b1b; }

.avr-item__actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; flex-shrink: 0; }
.avr-note-input { padding: 0.35rem 0.6rem; border: 1.5px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; outline: none; width: 180px; }
.avr-note-input:focus { border-color: #2563eb; }
.avr-btn { padding: 0.35rem 0.85rem; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none; }
.avr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.avr-btn--approve { background: #22c55e; color: #fff; }
.avr-btn--approve:hover:not(:disabled) { background: #16a34a; }
.avr-btn--reject { background: #f1f5f9; color: #64748b; }
.avr-btn--reject:hover:not(:disabled) { background: #fee2e2; color: #dc2626; }
</style>
