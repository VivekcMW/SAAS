<template>
  <div class="contracts-page">
    <div class="contracts-page__hero">
      <div class="container">
        <h1>Contracts</h1>
        <p>Track your SaaS contracts, renewal dates, and total spend.</p>
      </div>
    </div>

    <div class="container contracts-page__body">
      <!-- Summary bar -->
      <div class="contracts-summary" v-if="data">
        <div class="summary-pill">
          <span class="summary-pill__label">Contracts</span>
          <span class="summary-pill__value">{{ data.contracts?.length ?? 0 }}</span>
        </div>
        <div class="summary-pill">
          <span class="summary-pill__label">Total annual spend</span>
          <span class="summary-pill__value">${{ fmtMoney(data.total_annual_usd ?? 0) }}</span>
        </div>
        <div class="summary-pill">
          <span class="summary-pill__label">Renewing in 30 days</span>
          <span class="summary-pill__value alert">{{ renewingSoon }}</span>
        </div>
      </div>

      <div class="contracts-header">
        <h2>Your contracts</h2>
        <button class="btn-add" @click="showAdd = true">+ Add contract</button>
      </div>

      <p v-if="pending" class="muted">Loading…</p>
      <p v-else-if="!data?.contracts?.length" class="muted empty">No contracts tracked yet. Add your first contract to monitor renewals.</p>

      <div v-else class="contracts-table-wrap">
        <table class="contracts-table">
          <thead>
            <tr>
              <th>App</th>
              <th>Vendor</th>
              <th>Price</th>
              <th>Seats</th>
              <th>Renews</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in data.contracts" :key="c.id" :class="{ 'row--expiring': isExpiringSoon(c.end_date) }">
              <td class="td-app">
                <NuxtLink v-if="c.app_id" :to="`/app/${c.app_id}`" class="app-link">{{ c.app_name }}</NuxtLink>
                <span v-else>{{ c.app_name }}</span>
              </td>
              <td class="muted-cell">{{ c.vendor_name || '—' }}</td>
              <td>
                <span v-if="c.price_usd">${{ fmtMoney(c.price_usd) }}<small>/{{ c.billing_period }}</small></span>
                <span v-else class="muted-cell">—</span>
              </td>
              <td class="muted-cell">{{ c.seats ?? '—' }}</td>
              <td>
                <span v-if="c.end_date" :class="['date-cell', isExpiringSoon(c.end_date) ? 'date-cell--alert' : '']">
                  {{ fmtDate(c.end_date) }}
                  <span v-if="isExpiringSoon(c.end_date)" class="expiry-tag">Renewing soon</span>
                </span>
                <span v-else class="muted-cell">—</span>
              </td>
              <td><span :class="['status-badge', `status-badge--${c.status}`]">{{ c.status }}</span></td>
              <td class="td-actions">
                <button class="icon-btn" title="Edit" @click="editContract(c)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn icon-btn--danger" title="Delete" @click="deleteContract(c.id)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit modal -->
    <div v-if="showAdd || editingId" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h4>{{ editingId ? 'Edit contract' : 'Add contract' }}</h4>
        <form @submit.prevent="saveContract">
          <div class="form-row">
            <div class="form-group">
              <label>App name <span class="req">*</span></label>
              <input v-model="form.app_name" type="text" placeholder="e.g. Salesforce" required />
            </div>
            <div class="form-group">
              <label>Vendor</label>
              <input v-model="form.vendor_name" type="text" placeholder="e.g. Salesforce Inc." />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Price (USD)</label>
              <input v-model.number="form.price_usd" type="number" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label>Billing period</label>
              <select v-model="form.billing_period">
                <option value="">Select</option>
                <option value="month">Monthly</option>
                <option value="year">Annual</option>
                <option value="user/month">Per user / month</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Seats</label>
              <input v-model.number="form.seats" type="number" min="1" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start date</label>
              <input v-model="form.start_date" type="date" />
            </div>
            <div class="form-group">
              <label>End / renewal date</label>
              <input v-model="form.end_date" type="date" />
            </div>
          </div>
          <div class="form-group form-group--check">
            <label><input v-model="form.auto_renews" type="checkbox" /> Auto-renews</label>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="form.notes" rows="2" placeholder="Payment method, contract terms, contact info…"></textarea>
          </div>
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <div class="modal__actions">
            <button type="submit" :disabled="saving">{{ saving ? 'Saving…' : editingId ? 'Update' : 'Add contract' }}</button>
            <button type="button" @click="closeModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Contracts — SaasWorld', description: 'Track your SaaS contracts, renewal dates, and total annual spend.' })

const { data, pending, refresh } = await useAsyncData('contracts', () => $fetch('/api/contracts'))

const renewingSoon = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + 30)
  return (data.value as any)?.contracts?.filter((c: any) => c.end_date && new Date(c.end_date) <= cutoff && new Date(c.end_date) >= new Date()).length ?? 0
})

function fmtMoney(n: number) { return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
function isExpiringSoon(d?: string) {
  if (!d) return false
  const diff = new Date(d).getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
}

const showAdd = ref(false)
const editingId = ref('')
const saving = ref(false)
const formError = ref('')
const form = reactive({ app_name: '', vendor_name: '', price_usd: null as number | null, billing_period: '', seats: null as number | null, start_date: '', end_date: '', auto_renews: false, notes: '', status: 'active' })

function editContract(c: any) {
  Object.assign(form, { ...c, auto_renews: !!c.auto_renews, start_date: c.start_date?.slice(0,10) || '', end_date: c.end_date?.slice(0,10) || '' })
  editingId.value = c.id
}

function closeModal() { showAdd.value = false; editingId.value = ''; formError.value = '' }

async function saveContract() {
  formError.value = ''
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/contracts/${editingId.value}`, { method: 'PATCH', body: form })
    } else {
      await $fetch('/api/contracts', { method: 'POST', body: form })
    }
    closeModal()
    await refresh()
    Object.assign(form, { app_name: '', vendor_name: '', price_usd: null, billing_period: '', seats: null, start_date: '', end_date: '', auto_renews: false, notes: '', status: 'active' })
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Failed to save contract.'
  } finally {
    saving.value = false
  }
}

async function deleteContract(id: string) {
  if (!confirm('Delete this contract?')) return
  await $fetch(`/api/contracts/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.contracts-page__hero { background: #0f172a; color: #fff; padding: 2.5rem 1.5rem; }
.contracts-page__hero h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
.contracts-page__hero p { opacity: 0.75; font-size: 0.95rem; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
.contracts-page__body { padding-top: 2rem; padding-bottom: 3rem; }
.contracts-summary { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.summary-pill { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.875rem 1.25rem; min-width: 140px; }
.summary-pill__label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 2px; }
.summary-pill__value { font-size: 1.4rem; font-weight: 800; }
.summary-pill__value.alert { color: #d97706; }
.contracts-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.contracts-header h2 { font-size: 1.1rem; font-weight: 700; }
.btn-add { background: #6366f1; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.btn-add:hover { background: #4f46e5; }
.empty { font-size: 0.875rem; color: #6b7280; }
.contracts-table-wrap { overflow-x: auto; }
.contracts-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.contracts-table th { text-align: left; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #9ca3af; padding: 0 0.75rem 0.5rem; border-bottom: 1px solid #f3f4f6; }
.contracts-table td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.contracts-table tr.row--expiring td { background: #fffbeb; }
.td-app { font-weight: 600; }
.app-link { color: #4f46e5; text-decoration: none; }
.app-link:hover { text-decoration: underline; }
.muted-cell { color: #9ca3af; }
.date-cell { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.date-cell--alert { color: #d97706; font-weight: 600; }
.expiry-tag { background: #fef3c7; color: #92400e; font-size: 0.68rem; padding: 1px 7px; border-radius: 20px; font-weight: 600; }
.status-badge { font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: capitalize; }
.status-badge--active { background: #d1fae5; color: #065f46; }
.status-badge--pending { background: #eff6ff; color: #1d4ed8; }
.status-badge--cancelled { background: #fef2f2; color: #b91c1c; }
.status-badge--expired { background: #f3f4f6; color: #6b7280; }
.td-actions { display: flex; gap: 6px; }
.icon-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px 7px; cursor: pointer; color: #6b7280; display: flex; }
.icon-btn:hover { color: #4f46e5; border-color: #a5b4fc; }
.icon-btn--danger:hover { color: #dc2626; border-color: #fca5a5; }
.muted { color: #9ca3af; font-size: 0.875rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal { background: #fff; border-radius: 14px; padding: 1.5rem; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; }
.modal h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem; }
@media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 0.75rem; }
.form-group label { font-size: 0.82rem; font-weight: 600; }
.req { color: #ef4444; }
.form-group input, .form-group select, .form-group textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 7px 10px; font-size: 0.875rem; font-family: inherit; }
.form-group--check label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.form-group--check input { width: auto; }
.form-error { color: #dc2626; font-size: 0.82rem; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 7px 10px; margin-bottom: 0.75rem; }
.modal__actions { display: flex; gap: 8px; }
.modal__actions button { border-radius: 7px; padding: 8px 18px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
.modal__actions button[type=submit] { background: #6366f1; color: #fff; border: none; }
.modal__actions button[type=button] { background: none; border: 1px solid #e5e7eb; }
</style>
