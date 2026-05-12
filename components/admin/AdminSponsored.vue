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

    <!-- Table -->
    <p v-if="loading" style="padding:24px; color:var(--bw-text-muted);">Loading sponsorships…</p>

    <AdminGridTable
      v-else
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
const loading   = ref(false)
const saving    = ref(false)
const showModal = ref(false)
const editId    = ref<string | null>(null)
const formError = ref('')
const filterStatus = ref('')
const filterSlot   = ref('')

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
})
</script>

<style scoped>
/* ── KPI strip ── */
.sp-kpis { margin-bottom: 20px; }

/* ── Filter selects inside AdminGridTable toolbar ── */
.sp-filter-select { width: auto; min-width: 130px; max-width: 175px; }

/* ── Expiring badge ── */
.sp-expiring { color: var(--bw-danger, #EF4444); font-weight: 600; }

/* ── Modal sizing ── */
.sp-modal { max-width: 620px; width: 100%; }
.sp-modal-body { display: flex; flex-direction: column; gap: 4px; }

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
