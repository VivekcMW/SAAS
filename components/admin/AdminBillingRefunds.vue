<template>
  <div>
    <!-- Status filter -->
    <div style="display:flex; gap:10px; margin-bottom:16px;">
      <button
        v-for="s in ['all','pending','approved','rejected']"
        :key="s"
        class="bw-btn bw-btn--sm"
        :class="activeStatus === s ? 'bw-btn--primary' : 'bw-btn--ghost'"
        @click="setStatus(s)"
      >
        {{ s === 'all' ? 'All' : capitalise(s) }}
        <span v-if="s === 'pending' && pendingCount" class="abr-badge">{{ pendingCount }}</span>
      </button>
    </div>

    <section class="bw-card">
      <div class="bw-card__head">
        <h2 class="bw-card__title">Refund Requests</h2>
        <span style="color: var(--bw-text-muted); font-size: 0.875rem;">{{ filtered.length }} shown</span>
      </div>

      <div v-if="loading" class="abr-empty">Loading…</div>
      <div v-else-if="!filtered.length" class="abr-empty">No refund requests found.</div>
      <table v-else class="bw-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Plan</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Requested</th>
            <th style="width:160px;"/>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in filtered" :key="req.id">
            <td><code class="abr-id">{{ req.id }}</code></td>
            <td>
              <strong>{{ req.email }}</strong>
              <div v-if="req.orderId" style="font-size: 0.75rem; color: var(--bw-text-muted); font-family: monospace;">{{ req.orderId }}</div>
            </td>
            <td>{{ req.plan ?? '—' }}</td>
            <td>
              <span class="abr-reason">{{ req.reason }}</span>
              <div v-if="req.message" class="abr-msg">{{ req.message }}</div>
            </td>
            <td><span class="bw-chip" :class="statusChip(req.status)">{{ req.status }}</span></td>
            <td style="font-size: 0.82rem; color: var(--bw-text-muted);">{{ fmt(req.createdAt) }}</td>
            <td>
              <div v-if="req.status === 'pending'" style="display:flex; gap:6px;">
                <button class="bw-btn bw-btn--primary bw-btn--sm" :disabled="acting === req.id" @click="approve(req)">Approve</button>
                <button class="bw-btn bw-btn--subtle bw-btn--sm" :disabled="acting === req.id" @click="openReject(req)">Reject</button>
              </div>
              <div v-else-if="req.approvedAt || req.rejectedAt" style="font-size: 0.78rem; color: var(--bw-text-muted);">
                {{ req.approvedAt ? `Approved ${fmt(req.approvedAt)}` : `Rejected ${fmt(req.rejectedAt)}` }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Reject modal -->
    <div v-if="rejectModal.open" class="abr-backdrop" @click.self="rejectModal.open = false">
      <div class="abr-modal">
        <h3 class="abr-modal__title">Reject refund request</h3>
        <p style="font-size: 0.875rem; color: var(--bw-text-muted); margin-bottom: 14px;">
          Request <code>{{ rejectModal.id }}</code> from <strong>{{ rejectModal.email }}</strong>
        </p>
        <label style="display:flex; flex-direction:column; gap:6px; margin-bottom:16px;">
          <span style="font-size: 0.875rem;">Rejection reason (optional)</span>
          <textarea v-model="rejectModal.reason" class="bw-input" rows="3" placeholder="Explain why the request was rejected…" style="resize:vertical;" />
        </label>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="bw-btn bw-btn--ghost" @click="rejectModal.open = false">Cancel</button>
          <button class="bw-btn bw-btn--subtle" :disabled="acting === rejectModal.id" @click="confirmReject">
            {{ acting === rejectModal.id ? 'Rejecting…' : 'Confirm reject' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'

interface RefundReq {
  id: string; userId: string; email: string; reason: string; message: string
  orderId: string; plan: string | null; status: 'pending' | 'approved' | 'rejected'
  createdAt: string; approvedAt?: string; rejectedAt?: string
  approvedBy?: string; rejectedBy?: string; rejectionReason?: string; stripeRefundId?: string | null
}

const emit = defineEmits<{ (e: 'pending-count', n: number): void }>()

const loading = ref(true)
const acting = ref('')
const activeStatus = ref('all')
const requests = ref<RefundReq[]>([])

const filtered = computed(() =>
  activeStatus.value === 'all' ? requests.value : requests.value.filter(r => r.status === activeStatus.value)
)
const pendingCount = computed(() => requests.value.filter(r => r.status === 'pending').length)

const rejectModal = reactive({ open: false, id: '', email: '', reason: '' })

async function load() {
  loading.value = true
  const data = await $fetch<{ requests: RefundReq[] }>('/api/admin/billing/refunds')
  requests.value = data.requests
  emit('pending-count', pendingCount.value)
  loading.value = false
}
onMounted(() => { load() })

function setStatus(s: string) { activeStatus.value = s }
function capitalise(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function fmt(v: string | null) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusChip(s: string) {
  if (s === 'approved') return 'bw-chip--green'
  if (s === 'pending') return 'bw-chip--orange'
  return 'bw-chip--red'
}

async function approve(req: RefundReq) {
  if (!confirm(`Approve refund for ${req.email}? This will attempt a Stripe refund if a subscription ID exists.`)) return
  acting.value = req.id
  try {
    await $fetch(`/api/admin/billing/refunds/${req.id}/approve`, { method: 'POST' })
    await load()
  } finally { acting.value = '' }
}

function openReject(req: RefundReq) {
  rejectModal.id = req.id
  rejectModal.email = req.email
  rejectModal.reason = ''
  rejectModal.open = true
}

async function confirmReject() {
  acting.value = rejectModal.id
  try {
    await $fetch(`/api/admin/billing/refunds/${rejectModal.id}/reject`, {
      method: 'POST',
      body: { reason: rejectModal.reason }
    })
    rejectModal.open = false
    await load()
  } finally { acting.value = '' }
}
</script>

<style scoped>
.abr-badge {
  background: var(--mm-warn, #f59e0b); color: #000;
  border-radius: 999px; font-size: 0.7rem; font-weight: 700;
  padding: 1px 5px; margin-left: 4px;
}
.abr-empty { padding: 24px; text-align: center; color: var(--bw-text-muted); }
.abr-id { font-size: 0.75rem; color: var(--bw-text-muted); }
.abr-reason { font-size: 0.875rem; }
.abr-msg { font-size: 0.78rem; color: var(--bw-text-muted); margin-top: 2px; max-width: 280px; white-space: pre-wrap; }

.abr-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.abr-modal {
  background: var(--bw-surface); border-radius: 8px; padding: 28px;
  width: 100%; max-width: 480px;
}
.abr-modal__title { font-size: 1.05rem; font-weight: 600; margin-bottom: 12px; }
</style>
