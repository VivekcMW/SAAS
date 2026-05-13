<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Deals</h1>
        <p class="bw-head__sub">Create time-limited offers and promo codes for buyers.</p>
      </div>
      <button class="bw-btn bw-btn--primary" @click="openCreate">+ New deal</button>
    </header>

    <div v-if="pending" class="bw-card" style="padding: 2rem; color: var(--vw-text-muted);">Loading deals…</div>
    <div v-else-if="!deals.length" class="bw-card bw-empty">
      <h3 class="bw-empty__title">No deals yet</h3>
      <p class="bw-empty__desc">Create a deal to offer buyers a discount or promo code on your products.</p>
      <button class="bw-btn bw-btn--primary" @click="openCreate">Create your first deal</button>
    </div>
    <div v-else class="bw-card" style="overflow: auto;">
      <table class="bw-table">
        <thead>
          <tr><th>Title</th><th>App</th><th>Type</th><th>Discount</th><th>Expires</th><th>Claims</th><th>Status</th><th/></tr>
        </thead>
        <tbody>
          <tr v-for="d in deals" :key="d.id">
            <td>{{ d.title }}</td>
            <td>{{ d.app_name ?? '—' }}</td>
            <td class="deal-type">{{ d.deal_type }}</td>
            <td>{{ d.discount_pct ? d.discount_pct + '%' : '—' }}{{ d.promo_code ? ` (${d.promo_code})` : '' }}</td>
            <td>{{ fmtDate(d.expires_at) }}</td>
            <td>{{ d.claim_count }}{{ d.max_claims ? ` / ${d.max_claims}` : '' }}</td>
            <td>
              <span class="bw-chip" :class="isActive(d) ? 'bw-chip--success' : 'bw-chip--muted'">
                {{ isActive(d) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="openEdit(d)">Edit</button>
                <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="deleteDeal(d.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit modal -->
    <div v-if="modal" class="deal-modal-overlay" @click.self="modal = false">
      <div class="deal-modal">
        <h2 class="deal-modal__title">{{ editing ? 'Edit deal' : 'New deal' }}</h2>
        <div class="deal-modal__form">
          <label class="bw-label">Title *</label>
          <input v-model="form.title" class="bw-input" placeholder="e.g. Summer sale — 30% off" >

          <label class="bw-label">App (optional)</label>
          <select v-model="form.app_id" class="bw-select">
            <option value="">All products</option>
            <option v-for="a in apps" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="bw-label">Deal type</label>
              <select v-model="form.deal_type" class="bw-select">
                <option value="percent">Percent off</option>
                <option value="flat">Flat discount</option>
                <option value="trial">Extended trial</option>
                <option value="free">Free tier</option>
              </select>
            </div>
            <div>
              <label class="bw-label">Discount %</label>
              <input v-model.number="form.discount_pct" class="bw-input" type="number" min="1" max="100" placeholder="30" >
            </div>
          </div>

          <label class="bw-label">Promo code (optional)</label>
          <input v-model="form.promo_code" class="bw-input" placeholder="SUMMER30" style="text-transform: uppercase;" >

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="bw-label">Starts at *</label>
              <input v-model="form.starts_at" class="bw-input" type="date" >
            </div>
            <div>
              <label class="bw-label">Expires at *</label>
              <input v-model="form.expires_at" class="bw-input" type="date" >
            </div>
          </div>

          <label class="bw-label">Max claims (optional)</label>
          <input v-model.number="form.max_claims" class="bw-input" type="number" min="1" placeholder="Unlimited" >

          <label class="bw-label">Description (optional)</label>
          <textarea v-model="form.description" class="bw-input" rows="3" style="resize: vertical;" />
        </div>
        <p v-if="formError" class="deal-error">{{ formError }}</p>
        <div class="deal-modal__actions">
          <button class="bw-btn bw-btn--ghost" @click="modal = false">Cancel</button>
          <button class="bw-btn bw-btn--primary" :disabled="saving" @click="submit">
            {{ saving ? 'Saving…' : editing ? 'Save changes' : 'Create deal' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Deal {
  id: string; vendor_id: string; app_id: string | null; app_name: string | null
  title: string; description: string | null; discount_pct: number | null
  promo_code: string | null; deal_type: string; starts_at: string; expires_at: string
  max_claims: number | null; claim_count: number; active: number; created_at: string
}

const { data: rawDeals, pending, refresh } = await useFetch<Deal[]>('/api/vendor/deals')
const deals = computed(() => rawDeals.value ?? [])

const { data: rawApps } = await useFetch<{ id: string; name: string }[]>('/api/vendor/apps')
const apps = computed(() => rawApps.value ?? [])

const modal = ref(false)
const editing = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')

const emptyForm = () => ({
  title: '', app_id: '', deal_type: 'percent', discount_pct: null as number | null,
  promo_code: '', starts_at: '', expires_at: '', max_claims: null as number | null, description: ''
})
const form = reactive(emptyForm())

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function isActive(d: Deal) {
  const now = Date.now()
  return d.active && new Date(d.starts_at).getTime() <= now && new Date(d.expires_at).getTime() > now
}

function openCreate() {
  Object.assign(form, emptyForm())
  editing.value = null
  formError.value = ''
  modal.value = true
}

function openEdit(d: Deal) {
  Object.assign(form, {
    title: d.title, app_id: d.app_id ?? '', deal_type: d.deal_type,
    discount_pct: d.discount_pct, promo_code: d.promo_code ?? '',
    starts_at: d.starts_at.slice(0, 10), expires_at: d.expires_at.slice(0, 10),
    max_claims: d.max_claims, description: d.description ?? ''
  })
  editing.value = d.id
  formError.value = ''
  modal.value = true
}

async function submit() {
  if (!form.title.trim()) { formError.value = 'Title is required'; return }
  if (!form.starts_at || !form.expires_at) { formError.value = 'Start and expiry dates are required'; return }
  saving.value = true
  formError.value = ''
  try {
    const body = { ...form, app_id: form.app_id || undefined, promo_code: form.promo_code || undefined }
    if (editing.value) {
      await $fetch(`/api/vendor/deals/${editing.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/vendor/deals', { method: 'POST', body })
    }
    modal.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || 'Could not save deal.'
  } finally {
    saving.value = false
  }
}

async function deleteDeal(id: string) {
  if (!confirm('Delete this deal permanently?')) return
  await $fetch(`/api/vendor/deals/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.deal-type { text-transform: capitalize; }
.deal-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 200; display: flex; align-items: center; justify-content: center; }
.deal-modal { background: var(--vw-surface, #1a2035); border: 1px solid var(--vw-border, #2a3347); border-radius: 14px; padding: 1.75rem; width: 540px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
.deal-modal__title { font-size: 1.1rem; font-weight: 700; margin: 0 0 1.25rem; }
.deal-modal__form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1rem; }
.deal-modal__actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
.deal-error { color: #fca5a5; font-size: 0.82rem; margin: 4px 0 0; }
</style>
