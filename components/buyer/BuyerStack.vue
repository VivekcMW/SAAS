<template>
  <div class="bs-wrap">
    <!-- Header -->
    <div class="bs-head">
      <div class="bs-head__left">
        <h1 class="bs-head__title">My Stack</h1>
        <p class="bs-head__sub">Track tools, spend, renewals and overlaps in one place.</p>
      </div>
      <button class="bs-btn bs-btn--primary" @click="openAdd">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add tool
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bs-skel-wrap">
      <div v-for="i in 4" :key="i" class="bs-skel" />
    </div>

    <!-- Error -->
    <div v-else-if="err" class="bs-err">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ err }}
      <button class="bs-retry" @click="fetchStack">Retry</button>
    </div>

    <template v-else>
      <!-- KPI row -->
      <div class="bs-kpis">
        <div class="bs-kpi">
          <span class="bs-kpi__val">${{ fmt(totalMonthly) }}</span>
          <span class="bs-kpi__lbl">Monthly spend</span>
        </div>
        <div class="bs-kpi">
          <span class="bs-kpi__val">${{ fmt(totalMonthly * 12) }}</span>
          <span class="bs-kpi__lbl">Annual spend</span>
        </div>
        <div class="bs-kpi">
          <span class="bs-kpi__val">{{ tools.length }}</span>
          <span class="bs-kpi__lbl">Tools tracked</span>
        </div>
        <div class="bs-kpi bs-kpi--warn">
          <span class="bs-kpi__val">{{ overlapAlerts.length }}</span>
          <span class="bs-kpi__lbl">Overlap alerts</span>
        </div>
      </div>

      <!-- Overlap alerts -->
      <div v-if="overlapAlerts.length" class="bs-alerts">
        <h3 class="bs-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Potential overlaps
        </h3>
        <ul class="bs-alerts-list">
          <li v-for="(a, i) in overlapAlerts" :key="i" class="bs-alert-item">
            <span class="bs-alert-dot" />
            {{ a }}
          </li>
        </ul>
      </div>

      <!-- Renewals soon -->
      <div v-if="renewalsSoon.length" class="bs-renewals">
        <h3 class="bs-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Renewals in 30 days
        </h3>
        <ul class="bs-renewal-list">
          <li v-for="t in renewalsSoon" :key="t._localId" class="bs-renewal-item">
            <span class="bs-renewal-name">{{ t.name }}</span>
            <span class="bs-renewal-date">{{ fmtDate(t.renewal_date!) }}</span>
            <span v-if="t.monthly_cost" class="bs-renewal-cost">${{ fmt(t.monthly_cost * 12) }}/yr</span>
          </li>
        </ul>
      </div>

      <!-- Tools list -->
      <div class="bs-tools-section">
        <div class="bs-tools-head">
          <h3 class="bs-section-title" style="margin: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/></svg>
            All tools
          </h3>
          <span class="bs-tools-count">{{ tools.length }}</span>
        </div>

        <div v-if="tools.length === 0" class="bs-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36"><rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/></svg>
          <p>No tools tracked yet.</p>
          <button class="bs-btn bs-btn--primary" @click="openAdd">Add your first tool</button>
        </div>

        <div v-else class="bs-tools-table-wrap">
          <table class="bs-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Category</th>
                <th class="bs-th-right">Monthly cost</th>
                <th>Renewal</th>
                <th>Notes</th>
                <th class="bs-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tool in tools" :key="tool._localId" class="bs-row">
                <td class="bs-cell-name">
                  <div class="bs-tool-logo">{{ tool.name[0]?.toUpperCase() }}</div>
                  <span>{{ tool.name }}</span>
                </td>
                <td>
                  <span class="bs-tag">{{ tool.category }}</span>
                </td>
                <td class="bs-cell-right">{{ tool.monthly_cost != null ? '$' + fmt(tool.monthly_cost) : '—' }}</td>
                <td>{{ tool.renewal_date ? fmtDate(tool.renewal_date) : '—' }}</td>
                <td class="bs-cell-notes">{{ tool.notes || '—' }}</td>
                <td class="bs-cell-right bs-cell-actions">
                  <button class="bs-icon-btn" title="Edit" @click="openEdit(tool)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg>
                  </button>
                  <button class="bs-icon-btn bs-icon-btn--del" title="Remove" @click="remove(tool._localId)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Add / Edit modal -->
    <Teleport to="body">
      <div v-if="showModal" class="bs-overlay" @click.self="closeModal">
        <div class="bs-modal" role="dialog" aria-modal="true">
          <div class="bs-modal-head">
            <h2 class="bs-modal-title">{{ editId ? 'Edit tool' : 'Add tool' }}</h2>
            <button class="bs-close" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="bs-modal-body">
            <div class="bs-mrow">
              <div class="bs-mfield bs-mfield--full">
                <label class="bs-mlabel">Tool name *</label>
                <input v-model="form.name" class="bs-minput" placeholder="e.g. Slack" />
              </div>
            </div>
            <div class="bs-mrow">
              <div class="bs-mfield">
                <label class="bs-mlabel">Category</label>
                <input v-model="form.category" class="bs-minput" placeholder="Communication" />
              </div>
              <div class="bs-mfield">
                <label class="bs-mlabel">Monthly cost (USD)</label>
                <input v-model.number="form.monthly_cost" type="number" min="0" class="bs-minput" placeholder="0" />
              </div>
            </div>
            <div class="bs-mrow">
              <div class="bs-mfield">
                <label class="bs-mlabel">Renewal date</label>
                <input v-model="form.renewal_date" type="date" class="bs-minput" />
              </div>
              <div class="bs-mfield">
                <label class="bs-mlabel">Notes</label>
                <input v-model="form.notes" class="bs-minput" placeholder="Optional" />
              </div>
            </div>
            <p v-if="modalErr" class="bs-modal-err">{{ modalErr }}</p>
          </div>
          <div class="bs-modal-foot">
            <button class="bs-btn bs-btn--primary" :disabled="saving" @click="saveTool">
              {{ saving ? 'Saving…' : (editId ? 'Save changes' : 'Add tool') }}
            </button>
            <button class="bs-btn bs-btn--ghost" @click="closeModal">Cancel</button>
          </div>
        </div>
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
.bs-wrap { padding: 24px; max-width: 1100px; }

/* Head */
.bs-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.bs-head__title { font-size: 1.35rem; font-weight: 800; margin: 0 0 4px; }
.bs-head__sub { font-size: 0.84rem; color: rgba(255,255,255,0.45); margin: 0; }

/* Buttons */
.bs-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 9px; font-size: 0.86rem;
  font-family: var(--f-ui); font-weight: 600; cursor: pointer; border: none; transition: opacity .15s;
}
.bs-btn--primary { background: var(--mm-blue, #4A80D4); color: #fff; }
.bs-btn--primary:hover { opacity: 0.85; }
.bs-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.bs-btn--ghost { background: transparent; border: 0.5px solid var(--b2, rgba(255,255,255,0.1)); color: inherit; }
.bs-btn--ghost:hover { background: rgba(255,255,255,0.04); }

/* Skeleton */
.bs-skel-wrap { display: flex; flex-direction: column; gap: 10px; }
.bs-skel { height: 52px; border-radius: 10px; background: rgba(255,255,255,0.05); animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0%,100% { opacity:.4 } 50% { opacity:.8 } }

/* Error */
.bs-err {
  display: flex; align-items: center; gap: 10px; padding: 14px 16px;
  background: rgba(248,113,113,0.08); border: 0.5px solid rgba(248,113,113,0.25);
  border-radius: 10px; color: #f87171; font-size: 0.88rem;
}
.bs-retry { background: transparent; border: 0.5px solid #f87171; color: #f87171; border-radius: 6px; padding: 3px 10px; font-size: 0.8rem; cursor: pointer; margin-left: 4px; }

/* KPIs */
.bs-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.bs-kpi {
  background: var(--mm-s2, #161B2E); border: 0.5px solid var(--b1, rgba(255,255,255,0.06));
  border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px;
}
.bs-kpi--warn { border-color: rgba(212,168,67,0.25); }
.bs-kpi--warn .bs-kpi__val { color: var(--mm-gold, #D4A843); }
.bs-kpi__val { font-size: 1.5rem; font-weight: 800; color: rgba(255,255,255,0.9); line-height: 1; }
.bs-kpi__lbl { font-size: 0.76rem; color: rgba(255,255,255,0.4); font-weight: 500; }

/* Section title */
.bs-section-title {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.7);
  margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.04em;
}

/* Alerts */
.bs-alerts {
  background: rgba(212,168,67,0.06); border: 0.5px solid rgba(212,168,67,0.2);
  border-radius: 12px; padding: 14px 16px; margin-bottom: 16px;
}
.bs-alerts .bs-section-title { color: var(--mm-gold, #D4A843); }
.bs-alerts-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.bs-alert-item { display: flex; align-items: flex-start; gap: 8px; font-size: 0.84rem; color: rgba(255,255,255,0.7); line-height: 1.5; }
.bs-alert-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mm-gold, #D4A843); flex-shrink: 0; margin-top: 6px; }

/* Renewals */
.bs-renewals {
  background: rgba(42,157,143,0.06); border: 0.5px solid rgba(42,157,143,0.2);
  border-radius: 12px; padding: 14px 16px; margin-bottom: 16px;
}
.bs-renewals .bs-section-title { color: var(--mm-sea, #2A9D8F); }
.bs-renewal-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.bs-renewal-item { display: flex; align-items: center; gap: 12px; font-size: 0.84rem; }
.bs-renewal-name { font-weight: 600; flex: 1; }
.bs-renewal-date { color: rgba(255,255,255,0.5); }
.bs-renewal-cost { color: var(--mm-sea, #2A9D8F); font-weight: 600; }

/* Tools section */
.bs-tools-section {
  background: var(--mm-s1, #0F1220); border: 0.5px solid var(--b1, rgba(255,255,255,0.06));
  border-radius: 14px; padding: 18px;
}
.bs-tools-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.bs-tools-count {
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border-radius: 20px;
  font-size: 0.75rem; font-weight: 700; padding: 1px 8px; color: rgba(255,255,255,0.5);
}
.bs-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px; color: rgba(255,255,255,0.3); text-align: center; }
.bs-empty p { margin: 0; font-size: 0.88rem; }

.bs-tools-table-wrap { overflow-x: auto; }
.bs-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
.bs-table th {
  text-align: left; padding: 8px 12px;
  border-bottom: 0.5px solid rgba(255,255,255,0.06);
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  color: rgba(255,255,255,0.35); white-space: nowrap;
}
.bs-th-right { text-align: right; }
.bs-table td { padding: 10px 12px; border-bottom: 0.5px solid rgba(255,255,255,0.04); vertical-align: middle; }
.bs-row:last-child td { border-bottom: none; }
.bs-row:hover td { background: rgba(255,255,255,0.02); }
.bs-cell-name { display: flex; align-items: center; gap: 9px; font-weight: 600; }
.bs-tool-logo {
  width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
  background: rgba(74,128,212,0.2); color: var(--mm-blue, #4A80D4);
  font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;
}
.bs-tag {
  display: inline-block; background: rgba(255,255,255,0.06); border-radius: 5px;
  font-size: 0.75rem; font-weight: 600; padding: 2px 8px; color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.bs-cell-right { text-align: right; }
.bs-cell-notes { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: rgba(255,255,255,0.4); font-size: 0.8rem; }
.bs-cell-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
.bs-icon-btn {
  width: 28px; height: 28px; border-radius: 7px; border: none;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s;
}
.bs-icon-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
.bs-icon-btn--del:hover { background: rgba(248,113,113,0.1); color: #f87171; }

/* Modal */
.bs-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(7,9,15,0.85); display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(4px);
}
.bs-modal {
  background: var(--mm-s1, #0F1220);
  border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
  border-radius: 14px; width: 100%; max-width: 520px; overflow: hidden;
}
.bs-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 14px; border-bottom: 0.5px solid rgba(255,255,255,0.06);
}
.bs-modal-title { font-size: 1rem; font-weight: 700; margin: 0; }
.bs-close { background: transparent; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 4px; border-radius: 6px; }
.bs-close:hover { color: inherit; }
.bs-modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.bs-mrow { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.bs-mfield { display: flex; flex-direction: column; gap: 4px; }
.bs-mfield--full { grid-column: 1 / -1; }
.bs-mlabel { font-size: 0.77rem; color: rgba(255,255,255,0.4); }
.bs-minput {
  background: var(--mm-s2, #161B2E); border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
  border-radius: 8px; color: inherit; font-family: var(--f-ui); font-size: 0.85rem; padding: 8px 10px;
}
.bs-minput:focus { outline: none; border-color: var(--mm-blue, #4A80D4); }
.bs-modal-err { color: #f87171; font-size: 0.82rem; margin: 0; }
.bs-modal-foot { display: flex; gap: 10px; padding: 14px 20px 16px; border-top: 0.5px solid rgba(255,255,255,0.06); }

@media (max-width: 768px) {
  .bs-kpis { grid-template-columns: 1fr 1fr; }
  .bs-mrow { grid-template-columns: 1fr; }
}
@media (max-width: 480px) { .bs-kpis { grid-template-columns: 1fr; } }
</style>
