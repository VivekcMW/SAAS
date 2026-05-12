<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Sponsored slots</h1>
        <p class="bw-head__sub">Manage vendor sponsorships — select apps, assign placement slots and schedule campaigns.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary" @click="openCreate">+ New sponsorship</button>
      </div>
    </header>

    <!-- KPI strip -->
    <div class="bw-kpis sp-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__value">{{ activeCount }}</div>
        <div class="bw-kpi__label">Active campaigns</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__value">{{ scheduledCount }}</div>
        <div class="bw-kpi__label">Scheduled</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__value">{{ expiredCount }}</div>
        <div class="bw-kpi__label">Expired / ended</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__value">${{ totalRevenue.toLocaleString() }}</div>
        <div class="bw-kpi__label">Sponsorship revenue (30 d)</div>
      </div>
    </div>

    <!-- Tab strip -->
    <div class="sp-tabs">
      <button class="sp-tab" :class="{ active: activeTab === 'campaigns' }" @click="activeTab = 'campaigns'">
        Campaigns
        <span class="sp-tab-count">{{ sponsorships.length }}</span>
      </button>
      <button class="sp-tab" :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
        Vendor requests
        <span class="sp-tab-count sp-tab-count--pending" v-if="pendingCount > 0">{{ pendingCount }}</span>
        <span class="sp-tab-count" v-else>{{ vendorRequests.length }}</span>
      </button>
    </div>

    <!-- ─── Requests tab ─── -->
    <div v-if="activeTab === 'requests'" class="sp-req-section">
      <p v-if="vendorRequests.length === 0" class="sp-req-empty">No vendor requests yet.</p>
      <div v-else class="sp-req-list">
        <div v-for="req in vendorRequests" :key="req.id" class="sp-req-card">
          <div class="sp-req-card__top">
            <div class="sp-req-card__info">
              <strong class="sp-req-card__app">{{ req.appName }}</strong>
              <span class="sp-req-card__vendor">{{ req.vendorName }}</span>
            </div>
            <span class="sp-req-badge" :class="reqBadgeClass(req.status)">{{ reqStatusLabel(req.status) }}</span>
          </div>
          <div class="sp-req-card__meta">
            <div class="sp-req-meta-item">
              <span class="sp-req-meta-label">Slot</span>
              <span>{{ slotLabel(req.slot) }}</span>
            </div>
            <div class="sp-req-meta-item">
              <span class="sp-req-meta-label">Dates</span>
              <span>{{ fmtDate(req.startsAt) }} → {{ fmtDate(req.endsAt) }}</span>
            </div>
            <div class="sp-req-meta-item">
              <span class="sp-req-meta-label">Budget</span>
              <span>${{ req.budget.toLocaleString() }}</span>
            </div>
            <div class="sp-req-meta-item">
              <span class="sp-req-meta-label">Goal</span>
              <span>{{ goalLabel(req.goal) }}</span>
            </div>
            <div class="sp-req-meta-item">
              <span class="sp-req-meta-label">Submitted</span>
              <span>{{ fmtDate(req.submittedAt) }}</span>
            </div>
          </div>
          <div v-if="req.tagline || req.notes" class="sp-req-card__notes">
            <div v-if="req.tagline"><em>"{{ req.tagline }}"</em></div>
            <div v-if="req.notes" style="font-size:0.78rem; color:var(--bw-text-muted); margin-top:4px;">{{ req.notes }}</div>
          </div>
          <div v-if="req.rejectionReason" class="sp-req-reject-reason">
            Rejected: {{ req.rejectionReason }}
          </div>
          <div class="sp-req-card__actions" v-if="req.status === 'pending'">
            <button class="bw-btn bw-btn--primary bw-btn--sm" @click="approveRequest(req)">Approve → create campaign</button>
            <button class="bw-btn bw-btn--ghost bw-btn--sm bw-btn--danger" @click="openReject(req)">Reject</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaigns tab -->
    <p v-if="loading && activeTab === 'campaigns'" style="padding:24px; color:var(--bw-text-muted);">Loading sponsorships…</p>

    <AdminGridTable
      v-if="!loading && activeTab === 'campaigns'"
      :columns="columns"
      :rows="filteredRows"
      row-key="id"
      :selectable="false"
      :exportable="true"
      export-file-name="sponsorships-export"
      search-placeholder="Search vendor or app…"
    >
      <template #toolbar-extra>
        <select v-model="filterStatus" class="bw-select sp-filter-select" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
        </select>
        <select v-model="filterSlot" class="bw-select sp-filter-select" aria-label="Filter by placement">
          <option value="">All placements</option>
          <option v-for="s in SLOT_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </template>
      <template #cell-appName="{ row }">
        <strong style="display:block;">{{ row.appName }}</strong>
        <span style="font-size:0.78rem; color:var(--bw-text-muted);">{{ row.vendorName }}</span>
      </template>

      <template #cell-slot="{ row }">
        <span class="bw-chip" :class="slotChip(row.slot)">{{ slotLabel(row.slot) }}</span>
      </template>

      <template #cell-status="{ row }">
        <span class="bw-chip" :class="statusChip(row.status)">{{ row.status }}</span>
      </template>

      <template #cell-startsAt="{ row }">
        <span style="font-size:0.82rem;">{{ fmtDate(row.startsAt) }}</span>
      </template>

      <template #cell-endsAt="{ row }">
        <span style="font-size:0.82rem;" :class="{ 'sp-expiring': isExpiring(row) }">{{ fmtDate(row.endsAt) }}</span>
      </template>

      <template #cell-budget="{ row }">
        <span style="font-size:0.88rem; font-weight:600;">${{ row.budget.toLocaleString() }}</span>
        <span v-if="row.budgetUsed != null" style="font-size:0.75rem; color:var(--bw-text-muted); display:block;">
          ${{ row.budgetUsed.toLocaleString() }} used
        </span>
      </template>

      <template #cell-_actions="{ row }">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="openEdit(row as SponsoredRow)">Edit</button>
          <button
            v-if="row.status !== 'paused' && row.status !== 'expired'"
            class="bw-btn bw-btn--ghost bw-btn--sm"
            @click="togglePause(row as SponsoredRow)"
          >Pause</button>
          <button
            v-if="row.status === 'paused'"
            class="bw-btn bw-btn--ghost bw-btn--sm"
            style="color:var(--bw-success);"
            @click="togglePause(row as SponsoredRow)"
          >Resume</button>
          <button class="bw-btn bw-btn--ghost bw-btn--sm bw-btn--danger" @click="confirmDelete(row as SponsoredRow)">Delete</button>
        </div>
      </template>
    </AdminGridTable>

    <!-- ─── Reject modal ─── -->
    <div v-if="showReject" class="bw-modal-bg" @click.self="showReject = false">
      <div class="bw-modal sp-modal sp-modal--sm">
        <div class="bw-modal__head">
          <h2 class="bw-modal__title">Reject sponsorship request</h2>
          <button class="bw-modal__close" type="button" aria-label="Close" @click="showReject = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="bw-modal__body">
          <p style="font-size:0.88rem; color:var(--bw-text-muted); margin:0 0 12px;">You are rejecting the request for <strong style="color:var(--bw-text);">{{ rejectTarget?.appName }}</strong> ({{ rejectTarget ? slotLabel(rejectTarget.slot) : '' }}).</p>
          <div class="bw-field">
            <label class="bw-label">Reason for rejection <span class="sp-req">*</span></label>
            <textarea v-model="rejectReason" class="bw-input sp-textarea" rows="3" placeholder="e.g. Budget below minimum, dates conflict with existing campaign…" />
          </div>
          <p v-if="rejectError" class="bw-form-error">{{ rejectError }}</p>
        </div>
        <div class="bw-modal__foot">
          <button class="bw-btn" @click="showReject = false">Cancel</button>
          <button class="bw-btn bw-btn--primary" style="background:var(--bw-danger);" :disabled="saving" @click="submitReject">{{ saving ? 'Saving…' : 'Confirm rejection' }}</button>
        </div>
      </div>
    </div>

    <!-- ─── Create / Edit Modal ─── -->
    <div v-if="showModal" class="bw-modal-bg" @click.self="closeModal">
      <div class="bw-modal sp-modal">
        <div class="bw-modal__head">
          <h2 class="bw-modal__title">{{ editId ? 'Edit sponsorship' : 'New sponsorship' }}</h2>
          <button class="bw-modal__close" type="button" aria-label="Close" @click="closeModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="bw-modal__body sp-modal-body">
          <!-- App selection -->
          <fieldset class="sp-fieldset">
            <legend class="sp-legend">App &amp; vendor</legend>
            <div class="bw-field">
              <label class="bw-label">Vendor name <span class="sp-req">*</span></label>
              <input v-model="form.vendorName" class="bw-input" placeholder="e.g. Acme Corp" />
            </div>
            <div class="bw-field">
              <label class="bw-label">App name <span class="sp-req">*</span></label>
              <input v-model="form.appName" class="bw-input" placeholder="e.g. Acme CRM" />
            </div>
            <div class="bw-field">
              <label class="bw-label">App ID (optional)</label>
              <input v-model="form.appId" class="bw-input" placeholder="app_xxxx" />
            </div>
          </fieldset>

          <!-- Placement -->
          <fieldset class="sp-fieldset">
            <legend class="sp-legend">Placement</legend>
            <div class="bw-field">
              <label class="bw-label">Slot <span class="sp-req">*</span></label>
              <select v-model="form.slot" class="bw-select">
                <option value="">Select a slot</option>
                <option v-for="s in SLOT_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
              <p class="sp-hint">{{ slotHint(form.slot) }}</p>
            </div>
            <div class="bw-field">
              <label class="bw-label">Category (optional)</label>
              <input v-model="form.category" class="bw-input" placeholder="e.g. CRM, Project Management" />
              <p class="sp-hint">Leave blank to show across all categories.</p>
            </div>
          </fieldset>

          <!-- Schedule -->
          <fieldset class="sp-fieldset">
            <legend class="sp-legend">Schedule</legend>
            <div class="sp-date-row">
              <div class="bw-field" style="flex:1;">
                <label class="bw-label">Starts on <span class="sp-req">*</span></label>
                <input v-model="form.startsAt" type="date" class="bw-input" :min="today" />
              </div>
              <div class="bw-field" style="flex:1;">
                <label class="bw-label">Ends on <span class="sp-req">*</span></label>
                <input v-model="form.endsAt" type="date" class="bw-input" :min="form.startsAt || today" />
              </div>
            </div>
            <div class="bw-field">
              <label class="bw-label">Recurrence</label>
              <select v-model="form.recurrence" class="bw-select">
                <option value="once">One-time (no repeat)</option>
                <option value="weekly">Repeat weekly</option>
                <option value="monthly">Repeat monthly</option>
              </select>
            </div>
          </fieldset>

          <!-- Budget -->
          <fieldset class="sp-fieldset">
            <legend class="sp-legend">Budget &amp; pricing</legend>
            <div class="bw-field">
              <label class="bw-label">Total budget (USD) <span class="sp-req">*</span></label>
              <input v-model.number="form.budget" type="number" min="0" step="100" class="bw-input" placeholder="e.g. 2000" />
            </div>
            <div class="bw-field">
              <label class="bw-label">Notes / contract ref (optional)</label>
              <textarea v-model="form.notes" class="bw-input sp-textarea" rows="3" placeholder="Invoice #, contract link, special terms…" />
            </div>
          </fieldset>

          <p v-if="formError" class="bw-form-error">
            {{ formError }}
            <button type="button" style="margin-left:8px;background:none;border:none;cursor:pointer;font-size:0.75rem;color:inherit;text-decoration:underline;" @click="formError = ''">Dismiss</button>
          </p>
        </div>

        <div class="bw-modal__foot">
          <button class="bw-btn" @click="closeModal">Cancel</button>
          <button
            class="bw-btn bw-btn--primary"
            :disabled="saving"
            :aria-busy="saving"
            @click="saveSponsorship"
          >{{ saving ? 'Saving…' : (editId ? 'Save changes' : 'Create sponsorship') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminData } from '~/composables/useAdminData'

const { showAdminToast } = useAdminData()

// ─── Types ───────────────────────────────────────────────────────────────────
interface VendorRequest {
  id: string
  vendorName: string
  appName: string
  slot: string
  startsAt: string
  endsAt: string
  goal: string
  budget: number
  tagline?: string
  notes?: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

interface SponsoredRow {
  id: string
  vendorName: string
  appName: string
  appId?: string
  slot: string
  category?: string
  status: 'active' | 'scheduled' | 'paused' | 'expired'
  startsAt: string
  endsAt: string
  recurrence: 'once' | 'weekly' | 'monthly'
  budget: number
  budgetUsed?: number
  notes?: string
}

// ─── Slot config ─────────────────────────────────────────────────────────────
const SLOT_OPTIONS = [
  { value: 'homepage_hero',     label: 'Homepage hero banner' },
  { value: 'homepage_featured', label: 'Homepage featured strip' },
  { value: 'category_top',      label: 'Category page — top of results' },
  { value: 'category_sidebar',  label: 'Category page — sidebar card' },
  { value: 'search_results',    label: 'Search results — promoted listing' },
  { value: 'app_detail',        label: 'App detail page — related apps' },
  { value: 'newsletter',        label: 'Weekly newsletter slot' },
  { value: 'email_digest',      label: 'Monthly email digest' },
]

const SLOT_HINTS: Record<string, string> = {
  homepage_hero:     'Full-width banner at the top of the homepage. Max 1 active at a time.',
  homepage_featured: 'Horizontal card strip below hero. Up to 4 active simultaneously.',
  category_top:      'Promoted listing pinned above organic results in one category.',
  category_sidebar:  'Sticky sidebar card visible throughout category browsing.',
  search_results:    'Highlighted "Sponsored" card injected above search results.',
  app_detail:        'Appears in the "You might also like" rail on any app detail page.',
  newsletter:        'Single-app feature block in the weekly newsletter (Tuesday edition).',
  email_digest:      'Logo + blurb in the monthly digest sent to all registered buyers.',
}

function slotHint(slot: string) { return SLOT_HINTS[slot] || '' }
function slotLabel(slot: string) { return SLOT_OPTIONS.find(s => s.value === slot)?.label ?? slot }

function slotChip(slot: string) {
  if (slot.startsWith('homepage')) return 'bw-chip--featured'
  if (slot.startsWith('category')) return 'bw-chip--warning'
  if (slot.startsWith('search'))   return 'bw-chip--info'
  return ''
}

// ─── State ───────────────────────────────────────────────────────────────────
const loading    = ref(false)
const saving     = ref(false)
const showModal  = ref(false)
const showReject = ref(false)
const editId     = ref<string | null>(null)
const formError  = ref('')
const filterStatus = ref('')
const filterSlot   = ref('')
const activeTab    = ref<'campaigns' | 'requests'>('campaigns')

// Reject state
const rejectTarget = ref<VendorRequest | null>(null)
const rejectReason = ref('')
const rejectError  = ref('')

const vendorRequests = ref<VendorRequest[]>([
  {
    id: 'vreq_1', vendorName: 'Acme Corp', appName: 'Acme CRM',
    slot: 'category_top', startsAt: '2026-06-01', endsAt: '2026-06-30',
    goal: 'lead_gen', budget: 500, tagline: 'The #1 CRM for growing SaaS teams',
    notes: 'Looking to target the CRM and Sales categories.', submittedAt: '2026-05-10',
    status: 'pending'
  },
  {
    id: 'vreq_2', vendorName: 'FlowDesk', appName: 'FlowDesk Pro',
    slot: 'newsletter', startsAt: '2026-06-07', endsAt: '2026-06-28',
    goal: 'launch', budget: 400, notes: 'New product launch — very time-sensitive.',
    submittedAt: '2026-05-12', status: 'pending'
  },
  {
    id: 'vreq_3', vendorName: 'Prism Cloud', appName: 'PrismDB',
    slot: 'homepage_hero', startsAt: '2026-07-01', endsAt: '2026-07-31',
    goal: 'brand_awareness', budget: 2000, submittedAt: '2026-05-05',
    status: 'rejected', rejectionReason: 'Homepage hero slot already booked for that period.'
  },
])

const sponsorships = ref<SponsoredRow[]>([
  {
    id: 'sp_1', vendorName: 'Acme Corp', appName: 'Acme CRM', appId: 'app_acme',
    slot: 'homepage_hero', category: '',
    status: 'active', startsAt: '2026-05-01', endsAt: '2026-05-31',
    recurrence: 'monthly', budget: 4500, budgetUsed: 1200,
    notes: 'Invoice #INV-2026-001'
  },
  {
    id: 'sp_2', vendorName: 'Nebula SaaS', appName: 'Nebula Analytics', appId: 'app_nebula',
    slot: 'category_top', category: 'Analytics',
    status: 'active', startsAt: '2026-05-10', endsAt: '2026-06-10',
    recurrence: 'once', budget: 2000, budgetUsed: 450,
    notes: ''
  },
  {
    id: 'sp_3', vendorName: 'FlowDesk', appName: 'FlowDesk Pro', appId: 'app_flowdesk',
    slot: 'search_results', category: 'Productivity',
    status: 'scheduled', startsAt: '2026-06-01', endsAt: '2026-06-30',
    recurrence: 'once', budget: 1500, budgetUsed: 0,
    notes: 'To start June 1st — confirmed with VP Sales'
  },
  {
    id: 'sp_4', vendorName: 'Wolfsoft', appName: 'WolfDeploy', appId: 'app_wolfsoft',
    slot: 'newsletter', category: '',
    status: 'paused', startsAt: '2026-04-01', endsAt: '2026-07-31',
    recurrence: 'weekly', budget: 3000, budgetUsed: 900,
    notes: 'On hold — pending creative assets'
  },
  {
    id: 'sp_5', vendorName: 'Prism Cloud', appName: 'PrismDB', appId: 'app_prism',
    slot: 'homepage_featured', category: '',
    status: 'expired', startsAt: '2026-03-01', endsAt: '2026-04-30',
    recurrence: 'once', budget: 2800, budgetUsed: 2800,
    notes: ''
  },
])

const defaultForm = (): Omit<SponsoredRow, 'id' | 'status' | 'budgetUsed'> => ({
  vendorName: '', appName: '', appId: '', slot: '', category: '',
  startsAt: '', endsAt: '', recurrence: 'once', budget: 0, notes: ''
})
const form = ref(defaultForm())

// ─── Computed ─────────────────────────────────────────────────────────────────
const activeCount    = computed(() => sponsorships.value.filter(s => s.status === 'active').length)
const scheduledCount = computed(() => sponsorships.value.filter(s => s.status === 'scheduled').length)
const expiredCount   = computed(() => sponsorships.value.filter(s => s.status === 'expired').length)
const totalRevenue   = computed(() => sponsorships.value.filter(s => s.status !== 'expired').reduce((a, s) => a + (s.budgetUsed ?? 0), 0))
const pendingCount   = computed(() => vendorRequests.value.filter(r => r.status === 'pending').length)

const filteredRows = computed(() => {
  let rows = sponsorships.value
  if (filterStatus.value) rows = rows.filter(r => r.status === filterStatus.value)
  if (filterSlot.value)   rows = rows.filter(r => r.slot === filterSlot.value)
  return rows
})

const today = computed(() => new Date().toISOString().slice(0, 10))

// ─── Table columns ────────────────────────────────────────────────────────────
const columns = [
  { key: 'appName',   label: 'App / Vendor',  sortable: true,  hideable: false, minWidth: '160px' },
  { key: 'slot',      label: 'Placement',     sortable: true,  hideable: false, width: '195px' },
  { key: 'status',    label: 'Status',        sortable: true,  hideable: true,  width: '110px' },
  { key: 'startsAt',  label: 'Starts',        sortable: true,  hideable: true,  width: '115px' },
  { key: 'endsAt',    label: 'Ends',          sortable: true,  hideable: true,  width: '115px' },
  { key: 'budget',    label: 'Budget',        sortable: true,  hideable: true,  width: '130px' },
  { key: '_actions',  label: '',              sortable: false, hideable: false, width: '195px', align: 'right' as const },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isExpiring(row: SponsoredRow) {
  if (row.status !== 'active') return false
  const daysLeft = (new Date(row.endsAt).getTime() - Date.now()) / 86_400_000
  return daysLeft >= 0 && daysLeft <= 7
}

function statusChip(status: string) {
  if (status === 'active')    return 'bw-chip--success'
  if (status === 'scheduled') return 'bw-chip--info'
  if (status === 'paused')    return 'bw-chip--warning'
  return ''   // expired — default grey
}

function goalLabel(g: string) {
  const m: Record<string, string> = { brand_awareness: 'Brand awareness', lead_gen: 'Lead generation', launch: 'Product launch', category_dominance: 'Category dominance' }
  return m[g] ?? g
}

function reqStatusLabel(s: string) {
  const m: Record<string, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
  return m[s] ?? s
}

function reqBadgeClass(s: string) {
  if (s === 'pending')  return 'sp-req-badge--pending'
  if (s === 'approved') return 'sp-req-badge--approved'
  if (s === 'rejected') return 'sp-req-badge--rejected'
  return ''
}

function makeId() { return 'sp_' + Math.random().toString(36).slice(2, 9) }

function deriveStatus(startsAt: string, endsAt: string): 'active' | 'scheduled' {
  const now  = new Date()
  const start = new Date(startsAt)
  const end   = new Date(endsAt)
  if (now >= start && now <= end) return 'active'
  return 'scheduled'
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openCreate() {
  editId.value  = null
  form.value    = defaultForm()
  formError.value = ''
  showModal.value = true
}

function openEdit(row: SponsoredRow) {
  editId.value = row.id
  form.value = {
    vendorName: row.vendorName, appName: row.appName, appId: row.appId ?? '',
    slot: row.slot, category: row.category ?? '',
    startsAt: row.startsAt, endsAt: row.endsAt,
    recurrence: row.recurrence, budget: row.budget, notes: row.notes ?? ''
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

// ─── Validate ─────────────────────────────────────────────────────────────────
function validate() {
  if (!form.value.vendorName.trim()) return 'Vendor name is required.'
  if (!form.value.appName.trim())    return 'App name is required.'
  if (!form.value.slot)              return 'Please select a placement slot.'
  if (!form.value.startsAt)          return 'Start date is required.'
  if (!form.value.endsAt)            return 'End date is required.'
  if (form.value.endsAt < form.value.startsAt) return 'End date must be on or after start date.'
  if (!form.value.budget || form.value.budget <= 0) return 'Budget must be greater than 0.'
  return null
}

// ─── Save ─────────────────────────────────────────────────────────────────────
async function saveSponsorship() {
  const err = validate()
  if (err) { formError.value = err; return }

  saving.value = true
  formError.value = ''
  try {
    if (editId.value) {
      await $fetch(`/api/admin/sponsored/${editId.value}`, {
        method: 'PUT',
        body: { ...form.value }
      })
      const idx = sponsorships.value.findIndex(s => s.id === editId.value)
      if (idx !== -1) {
        sponsorships.value[idx] = {
          ...sponsorships.value[idx],
          ...form.value,
          status: deriveStatus(form.value.startsAt, form.value.endsAt)
        }
      }
      showAdminToast('Sponsorship updated.', 'success')
    } else {
      await $fetch('/api/admin/sponsored', {
        method: 'POST',
        body: { ...form.value }
      })
      sponsorships.value.unshift({
        id: makeId(),
        ...form.value,
        status: deriveStatus(form.value.startsAt, form.value.endsAt),
        budgetUsed: 0
      })
      showAdminToast('Sponsorship created.', 'success')
    }
    closeModal()
  } catch {
    formError.value = 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}

// ─── Pause / resume ───────────────────────────────────────────────────────────
async function togglePause(row: SponsoredRow) {
  const next = row.status === 'paused' ? deriveStatus(row.startsAt, row.endsAt) : 'paused'
  try {
    await $fetch(`/api/admin/sponsored/${row.id}`, { method: 'PATCH', body: { status: next } })
    row.status = next
    showAdminToast(next === 'paused' ? 'Campaign paused.' : 'Campaign resumed.', 'success')
  } catch {
    showAdminToast('Action failed. Please try again.', 'error')
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
async function confirmDelete(row: SponsoredRow) {
  if (!confirm(`Delete the sponsorship for "${row.appName}" by ${row.vendorName}? This cannot be undone.`)) return
  try {
    await $fetch(`/api/admin/sponsored/${row.id}`, { method: 'DELETE' })
    sponsorships.value = sponsorships.value.filter(s => s.id !== row.id)
    showAdminToast('Sponsorship deleted.', 'success')
  } catch {
    showAdminToast('Delete failed. Please try again.', 'error')
  }
}

// ─── Approve vendor request ────────────────────────────────────────────────
function approveRequest(req: VendorRequest) {
  // Pre-fill the create campaign modal from vendor request data
  editId.value = null
  form.value = {
    vendorName: req.vendorName,
    appName: req.appName,
    appId: '',
    slot: req.slot,
    category: '',
    startsAt: req.startsAt,
    endsAt: req.endsAt,
    recurrence: 'once',
    budget: req.budget,
    notes: req.notes ?? ''
  }
  formError.value = ''
  showModal.value = true

  // Mark as approved in the queue
  req.status = 'approved'
  showAdminToast(`Request approved — complete the campaign form.`, 'success')
  activeTab.value = 'campaigns'
}

// ─── Reject vendor request ─────────────────────────────────────────────────
function openReject(req: VendorRequest) {
  rejectTarget.value = req
  rejectReason.value = ''
  rejectError.value  = ''
  showReject.value   = true
}

async function submitReject() {
  if (!rejectReason.value.trim()) { rejectError.value = 'A rejection reason is required.'; return }
  if (!rejectTarget.value) return
  saving.value = true
  rejectError.value = ''
  try {
    await $fetch(`/api/admin/sponsored/requests/${rejectTarget.value.id}`, {
      method: 'POST',
      body: { action: 'reject', reason: rejectReason.value }
    })
    rejectTarget.value.status = 'rejected'
    rejectTarget.value.rejectionReason = rejectReason.value
    showReject.value = false
    showAdminToast('Request rejected — vendor will be notified.', 'success')
  } catch {
    rejectError.value = 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await $fetch<SponsoredRow[]>('/api/admin/sponsored')
    if (Array.isArray(data) && data.length) sponsorships.value = data
  } catch {
    // API not yet wired — demo data is already loaded above
  } finally {
    loading.value = false
  }

  try {
    const reqs = await $fetch<VendorRequest[]>('/api/admin/sponsored/requests')
    if (Array.isArray(reqs) && reqs.length) vendorRequests.value = reqs
  } catch {
    // demo data is pre-loaded
  }
})
</script>

<style scoped>
/* ── KPI strip ── */
.sp-kpis { margin-bottom: 20px; }

/* ── Tabs ── */
.sp-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1.5px solid var(--bw-border);
  margin-bottom: 20px;
}
.sp-tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  font-size: 0.88rem; font-weight: 600; font-family: var(--f-ui);
  background: none; border: none; cursor: pointer;
  color: var(--bw-text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1.5px;
  transition: color .15s, border-color .15s;
}
.sp-tab:hover { color: var(--bw-text); }
.sp-tab.active { color: var(--bw-primary); border-bottom-color: var(--bw-primary); }
.sp-tab-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--bw-surface-2); border-radius: 9px;
  font-size: 0.72rem; font-weight: 700; color: var(--bw-text-muted);
}
.sp-tab-count--pending {
  background: rgba(239,68,68,.12); color: #EF4444;
}

/* ── Requests section ── */
.sp-req-section { margin-bottom: 24px; }
.sp-req-empty { font-size: 0.88rem; color: var(--bw-text-muted); padding: 24px 0; }
.sp-req-list { display: flex; flex-direction: column; gap: 12px; }
.sp-req-card {
  background: var(--bw-surface);
  border: 1px solid var(--bw-border);
  border-radius: 12px;
  padding: 16px 18px;
}
.sp-req-card__top {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 10px; gap: 10px;
}
.sp-req-card__app    { display: block; font-size: 0.95rem; font-weight: 700; }
.sp-req-card__vendor { font-size: 0.78rem; color: var(--bw-text-muted); }
.sp-req-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px;
  font-size: 0.72rem; font-weight: 700; white-space: nowrap; flex-shrink: 0;
  background: var(--bw-surface-2); color: var(--bw-text-muted);
}
.sp-req-badge--pending  { background: rgba(240,201,106,.12); color: #D4A843; }
.sp-req-badge--approved { background: rgba(42,157,143,.12);  color: #2A9D8F; }
.sp-req-badge--rejected { background: rgba(239,68,68,.12);   color: #EF4444; }
.sp-req-card__meta {
  display: flex; flex-wrap: wrap; gap: 14px;
  font-size: 0.82rem; margin-bottom: 10px;
}
.sp-req-meta-item  { display: flex; flex-direction: column; gap: 2px; }
.sp-req-meta-label { font-size: 0.70rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--bw-text-subtle); }
.sp-req-card__notes { font-size: 0.82rem; color: var(--bw-text-muted); margin-bottom: 10px; }
.sp-req-reject-reason {
  font-size: 0.80rem; color: #EF4444;
  background: rgba(239,68,68,.08); border-radius: 6px;
  padding: 6px 10px; margin-bottom: 8px;
}
.sp-req-card__actions { display: flex; gap: 8px; }
.sp-modal--sm { max-width: 460px; }

/* ── Filter selects inside AdminGridTable toolbar ── */
.sp-filter-select { width: auto; min-width: 130px; max-width: 175px; }

/* ── Expiring badge ── */
.sp-expiring { color: var(--bw-danger, #EF4444); font-weight: 600; }

/* ── Modal backdrop ── */
.bw-modal-bg {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}

/* ── Modal panel ── */
.bw-modal {
  background: var(--bw-surface, #0F1220);
  border: 1px solid var(--bw-border-strong, rgba(168,180,204,.2));
  border-radius: 14px;
  width: 100%;
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
}
.bw-modal__head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--bw-border, rgba(168,180,204,.1));
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
}
.bw-modal__title { font-family: var(--f-ui); font-weight: 700; font-size: 1rem; margin: 0; color: var(--bw-text, #F0F3F8); }
.bw-modal__close {
  background: none; border: none; cursor: pointer;
  color: var(--bw-text-muted, #A8B4CC);
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
  transition: background .15s;
}
.bw-modal__close:hover { background: var(--bw-surface-2, #161B2E); }
.bw-modal__body {
  padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
  overflow-y: auto;
}
.bw-modal__foot {
  padding: 14px 20px;
  border-top: 1px solid var(--bw-border, rgba(168,180,204,.1));
  display: flex; justify-content: flex-end; gap: 8px;
  flex-shrink: 0;
}

/* ── Form primitives (scoped to this modal) ── */
.bw-field { display: flex; flex-direction: column; gap: 4px; }
.bw-label { font-size: 0.83rem; font-weight: 600; color: var(--bw-text-muted, #A8B4CC); }

/* ── Modal sizing ── */
.sp-modal { max-width: 620px; }
.sp-modal-body { gap: 0; }

/* ── Fieldsets inside modal ── */
.sp-fieldset {
  border: 1px solid var(--bw-border);
  border-radius: 8px;
  padding: 14px 16px 10px;
  margin: 0 0 12px;
}
.sp-legend {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bw-text-muted);
  padding: 0 4px;
}
.sp-req { color: var(--bw-danger, #EF4444); margin-left: 2px; }
.sp-hint { font-size: 0.75rem; color: var(--bw-text-muted); margin: 4px 0 0; }

/* ── Date row ── */
.sp-date-row { display: flex; gap: 12px; }
@media (max-width: 480px) { .sp-date-row { flex-direction: column; } }

/* ── Textarea ── */
.sp-textarea { resize: vertical; min-height: 72px; }
</style>
