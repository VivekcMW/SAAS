<template>
  <div class="bw">
    <!-- Header -->
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">My Stack</h1>
        <p class="bw-head__sub">Track tools, spend, renewals and overlaps in one place.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary" @click="openAdd">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add tool
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="bw-empty">
      <div class="bw-empty__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
      <p class="bw-empty__desc">Loading your stack…</p>
    </div>

    <!-- Error -->
    <div v-else-if="err" class="bw-empty" style="border-color: var(--bw-danger);">
      <div class="bw-empty__icon" style="color: var(--bw-danger); border-color: var(--bw-danger-50);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3 class="bw-empty__title">Failed to load stack</h3>
      <p class="bw-empty__desc">{{ err }}</p>
      <button class="bw-btn bw-btn--ghost" @click="fetchStack">Retry</button>
    </div>

    <template v-else>
      <!-- KPI row -->
      <div class="bw-kpis">
        <div class="bw-kpi">
          <div class="bw-kpi__label">Monthly spend</div>
          <div class="bw-kpi__value">${{ fmt(totalMonthly) }}</div>
        </div>
        <div class="bw-kpi">
          <div class="bw-kpi__label">Annual spend</div>
          <div class="bw-kpi__value">${{ fmt(totalMonthly * 12) }}</div>
        </div>
        <div class="bw-kpi">
          <div class="bw-kpi__label">Tools tracked</div>
          <div class="bw-kpi__value">{{ tools.length }}</div>
        </div>
        <div class="bw-kpi stack-kpi--alert">
          <div class="bw-kpi__label">Overlap alerts</div>
          <div class="bw-kpi__value stack-kpi__alert-val">{{ overlapAlerts.length }}</div>
        </div>
      </div>

      <!-- Overlap alerts -->
      <section v-if="overlapAlerts.length" class="bw-card stack-alerts bw-section">
        <div class="bw-card__head">
          <h2 class="bw-card__title stack-alerts__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Potential overlaps
          </h2>
        </div>
        <ul class="stack-alerts__list">
          <li v-for="(a, i) in overlapAlerts" :key="i" class="stack-alerts__item">
            <span class="stack-alerts__dot" />
            {{ a }}
          </li>
        </ul>
      </section>

      <!-- Renewals soon -->
      <section v-if="renewalsSoon.length" class="bw-card stack-renewals bw-section">
        <div class="bw-card__head">
          <h2 class="bw-card__title stack-renewals__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Renewals in 30 days
          </h2>
        </div>
        <ul class="stack-renewals__list">
          <li v-for="t in renewalsSoon" :key="t._localId" class="stack-renewals__item">
            <span class="stack-renewals__name">{{ t.name }}</span>
            <span class="stack-renewals__date">{{ fmtDate(t.renewal_date!) }}</span>
            <span v-if="t.monthly_cost" class="stack-renewals__cost">${{ fmt(t.monthly_cost * 12) }}/yr</span>
          </li>
        </ul>
      </section>

      <!-- Tools list -->
      <section class="bw-card bw-section">
        <div class="bw-card__head">
          <h2 class="bw-card__title stack-table__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/></svg>
            All tools
          </h2>
          <span class="bw-chip bw-chip--neutral">{{ tools.length }}</span>
        </div>

        <div v-if="tools.length === 0" class="bw-empty" style="border: 0; padding: 32px 0 8px;">
          <div class="bw-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/></svg>
          </div>
          <h3 class="bw-empty__title">No tools tracked yet</h3>
          <p class="bw-empty__desc">Add the tools your team uses to track spend, renewals and overlaps.</p>
          <button class="bw-btn bw-btn--primary" @click="openAdd">Add your first tool</button>
        </div>

        <div v-else class="stack-table-wrap">
          <table class="bw-table">
            <thead>
              <tr>
                <th scope="col">Tool</th>
                <th scope="col">Category</th>
                <th scope="col" class="stack-th-right">Monthly cost</th>
                <th scope="col">Renewal</th>
                <th scope="col">Notes</th>
                <th scope="col" class="stack-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tool in tools" :key="tool._localId">
                <td class="stack-cell-name">
                  <div class="stack-tool-logo">{{ tool.name[0]?.toUpperCase() }}</div>
                  <span>{{ tool.name }}</span>
                </td>
                <td><span class="bw-chip bw-chip--neutral">{{ tool.category }}</span></td>
                <td class="stack-th-right">{{ tool.monthly_cost != null ? '$' + fmt(tool.monthly_cost) : '—' }}</td>
                <td>{{ tool.renewal_date ? fmtDate(tool.renewal_date) : '—' }}</td>
                <td class="stack-cell-notes">{{ tool.notes || '—' }}</td>
                <td class="stack-th-right stack-cell-actions">
                  <button class="bw-icon-btn" title="Edit" @click="openEdit(tool)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg>
                  </button>
                  <button class="bw-icon-btn stack-icon-del" title="Remove" @click="remove(tool._localId)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- Add / Edit modal -->
    <Teleport to="body">
      <div v-if="showModal" class="stack-overlay" @click.self="closeModal">
        <dialog class="stack-modal bw-card" open aria-modal="true" :aria-label="editId ? 'Edit tool' : 'Add tool'">
          <div class="stack-modal__head">
            <h2 class="stack-modal__title">{{ editId ? 'Edit tool' : 'Add tool' }}</h2>
            <button class="bw-icon-btn" aria-label="Close dialog" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="stack-modal__body">
            <div class="stack-mrow">
              <div style="grid-column: 1 / -1;">
                <label class="bw-label" for="st-name">Tool name *</label>
                <input id="st-name" v-model="form.name" class="bw-input" placeholder="e.g. Slack" >
              </div>
            </div>
            <div class="stack-mrow">
              <div>
                <label class="bw-label" for="st-category">Category</label>
                <input id="st-category" v-model="form.category" class="bw-input" placeholder="Communication" >
              </div>
              <div>
                <label class="bw-label" for="st-cost">Monthly cost (USD)</label>
                <input id="st-cost" v-model.number="form.monthly_cost" type="number" min="0" class="bw-input" placeholder="0" >
              </div>
            </div>
            <div class="stack-mrow">
              <div>
                <label class="bw-label" for="st-renewal">Renewal date</label>
                <input id="st-renewal" v-model="form.renewal_date" type="date" class="bw-input" >
              </div>
              <div>
                <label class="bw-label" for="st-notes">Notes</label>
                <input id="st-notes" v-model="form.notes" class="bw-input" placeholder="Optional" >
              </div>
            </div>
            <p v-if="modalErr" class="stack-modal__err">{{ modalErr }}</p>
          </div>
          <div class="stack-modal__foot">
            <button class="bw-btn bw-btn--primary" :disabled="saving" @click="saveTool">
              {{ saving ? 'Saving…' : (editId ? 'Save changes' : 'Add tool') }}
            </button>
            <button class="bw-btn bw-btn--ghost" @click="closeModal">Cancel</button>
          </div>
        </dialog>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface StackTool {
  _localId: string
  app_id?: string
  name: string
  category: string
  monthly_cost?: number | null
  renewal_date?: string | null
  notes?: string | null
}

interface StackResponse {
  tools: Omit<StackTool, '_localId'>[]
  totalSpend: number
  overlapAlerts: string[]
  updatedAt: string | null
}

let localId = 0
function makeId() { return String(++localId) }

const loading = ref(true)
const err = ref('')
const saving = ref(false)
const showModal = ref(false)
const editId = ref<string | null>(null)
const modalErr = ref('')

const tools = ref<StackTool[]>([])
const overlapAlerts = ref<string[]>([])

const form = ref({ name: '', category: '', monthly_cost: null as number | null, renewal_date: '', notes: '' })

const totalMonthly = computed(() => tools.value.reduce((s, t) => s + (t.monthly_cost ?? 0), 0))

const renewalsSoon = computed(() => {
  const cutoff = Date.now() + 30 * 24 * 60 * 60 * 1000
  return tools.value.filter(t => {
    if (!t.renewal_date) return false
    const d = new Date(t.renewal_date).getTime()
    return d > Date.now() && d <= cutoff
  })
})

const { fmtNumber, fmtDate: fmtDateIntl } = useFmt()
function fmt(n: number) { return fmtNumber(Math.round(n)) }
function fmtDate(iso: string) { return fmtDateIntl(iso, { month: 'short', day: 'numeric', year: 'numeric' }) }

async function fetchStack() {
  loading.value = true
  err.value = ''
  try {
    const data = await $fetch<StackResponse>('/api/buyer/stack')
    tools.value = (data.tools ?? []).map(t => ({ ...t, _localId: makeId() }))
    overlapAlerts.value = data.overlapAlerts ?? []
  } catch {
    err.value = 'Failed to load stack data. Please try again.'
  } finally {
    loading.value = false
  }
}

async function pushStack() {
  saving.value = true
  try {
    const data = await $fetch<StackResponse>('/api/buyer/stack', {
      method: 'PUT',
      body: { tools: tools.value.map(({ _localId: _l, ...rest }) => rest) }
    })
    tools.value = (data.tools ?? []).map(t => ({ ...t, _localId: makeId() }))
    overlapAlerts.value = data.overlapAlerts ?? []
  } finally {
    saving.value = false
  }
}

function openAdd() {
  editId.value = null
  form.value = { name: '', category: '', monthly_cost: null, renewal_date: '', notes: '' }
  modalErr.value = ''
  showModal.value = true
}

function openEdit(tool: StackTool) {
  editId.value = tool._localId
  form.value = {
    name: tool.name,
    category: tool.category,
    monthly_cost: tool.monthly_cost ?? null,
    renewal_date: tool.renewal_date ?? '',
    notes: tool.notes ?? ''
  }
  modalErr.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function saveTool() {
  if (!form.value.name.trim()) { modalErr.value = 'Tool name is required.'; return }
  if (editId.value) {
    const idx = tools.value.findIndex(t => t._localId === editId.value)
    if (idx >= 0) {
      tools.value[idx] = {
        ...tools.value[idx],
        name: form.value.name.trim(),
        category: form.value.category.trim(),
        monthly_cost: form.value.monthly_cost,
        renewal_date: form.value.renewal_date || null,
        notes: form.value.notes.trim() || null
      }
    }
  } else {
    tools.value.push({
      _localId: makeId(),
      name: form.value.name.trim(),
      category: form.value.category.trim(),
      monthly_cost: form.value.monthly_cost,
      renewal_date: form.value.renewal_date || null,
      notes: form.value.notes.trim() || null
    })
  }
  showModal.value = false
  await pushStack()
}

async function remove(id: string) {
  tools.value = tools.value.filter(t => t._localId !== id)
  await pushStack()
}

onMounted(fetchStack)
</script>

<style scoped>
/* ── KPI accent (overlap alert tile) ─────────────────────────────── */
.stack-kpi--alert { border-color: rgba(212,168,67,0.3); }
.stack-kpi__alert-val { color: var(--bw-primary) !important; }

/* ── Overlap alerts card ─────────────────────────────────────────── */
.stack-alerts { border-color: rgba(212,168,67,0.25); background: rgba(212,168,67,0.04); }
.stack-alerts__title { color: var(--bw-primary); display: flex; align-items: center; gap: 7px; }
.stack-alerts__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.stack-alerts__item { display: flex; align-items: flex-start; gap: 8px; font-size: 0.88rem; color: var(--bw-text-muted); line-height: 1.5; }
.stack-alerts__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bw-primary); flex-shrink: 0; margin-top: 7px; }

/* ── Renewals card ────────────────────────────────────────────────── */
.stack-renewals { border-color: rgba(42,157,143,0.25); background: rgba(42,157,143,0.04); }
.stack-renewals__title { color: var(--bw-success); display: flex; align-items: center; gap: 7px; }
.stack-renewals__list { list-style: none; padding: 0; margin: 0; }
.stack-renewals__item { display: flex; align-items: center; gap: 12px; font-size: 0.88rem; padding: 10px 0; border-bottom: 1px solid var(--bw-border); }
.stack-renewals__item:last-child { border-bottom: none; }
.stack-renewals__name { font-weight: 600; flex: 1; color: var(--bw-text); }
.stack-renewals__date { color: var(--bw-text-subtle); font-size: 0.84rem; }
.stack-renewals__cost { color: var(--bw-success); font-weight: 600; margin-left: auto; }

/* ── Tools table ─────────────────────────────────────────────────── */
.stack-table__title { display: flex; align-items: center; gap: 7px; }
.stack-table-wrap { overflow-x: auto; margin: 0 -16px; padding: 0 16px; }
.stack-th-right { text-align: right; }
.stack-cell-name { display: flex; align-items: center; gap: 10px; font-weight: 600; white-space: nowrap; }
.stack-tool-logo {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: var(--bw-info-50); color: var(--bw-info);
  font-weight: 700; font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center;
}
.stack-cell-notes { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--bw-text-subtle); font-size: 0.82rem; }
.stack-cell-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
.stack-icon-del:hover { background: var(--bw-danger-50); color: var(--bw-danger); border-color: var(--bw-danger-50); }

/* ── Modal overlay ────────────────────────────────────────────────── */
.stack-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(7,9,15,0.85); display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(4px);
}
.stack-modal { width: 100%; max-width: 520px; padding: 0; overflow: hidden; border: none; }
.stack-modal__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 14px; border-bottom: 1px solid var(--bw-border);
}
.stack-modal__title { font-family: var(--f-ui); font-size: 1rem; font-weight: 700; margin: 0; color: var(--bw-text); }
.stack-modal__body { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.stack-mrow { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stack-modal__err { color: var(--bw-danger); font-size: 0.82rem; margin: 0; }
.stack-modal__foot { display: flex; gap: 10px; padding: 14px 20px 16px; border-top: 1px solid var(--bw-border); }

@media (max-width: 768px) {
  .stack-mrow { grid-template-columns: 1fr; }
}
</style>
