<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Your listings</h1>
        <p class="bw-head__sub">Health score, traffic, and one-click AI improvements.</p>
      </div>
      <div class="bw-head__actions">
        <NuxtLink to="/dashboard/content-assistant" class="bw-btn bw-btn--ghost">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
          Draft new with AI
        </NuxtLink>
        <button type="button" class="bw-btn bw-btn--primary" @click="create">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New listing
        </button>
      </div>
    </header>

    <div class="bw-toolbar">
      <input v-model="q" class="bw-input" placeholder="Search listings…" style="max-width: 320px;" />
      <select v-model="filter" class="bw-select" style="max-width: 180px;">
        <option value="all">All statuses</option>
        <option value="live">Live</option>
        <option value="draft">Draft</option>
        <option value="paused">Paused</option>
        <option value="pending">Pending review</option>
      </select>
    </div>

    <div v-if="toast" class="bw-toast">{{ toast }}</div>

    <div v-if="filtered.length === 0" class="bw-empty">
      <p>No listings match your filter.</p>
    </div>

    <ul v-else class="list-grid">
      <li v-for="l in filtered" :key="l.id" class="bw-card list-card">
        <div class="list-head">
          <div class="list-logo" :style="{ background: l.color }">{{ l.logo }}</div>
          <div class="list-meta">
            <div class="list-name">{{ l.name }}</div>
            <div class="list-sub">{{ l.category }} · from ${{ l.priceFrom }}/mo</div>
          </div>
          <span class="bw-chip" :class="statusChip(l.status)">{{ l.status }}</span>
        </div>

        <div class="list-health">
          <div class="list-health__row">
            <span class="list-health__label">Health score</span>
            <span class="vw-health" :class="healthClass(l.healthScore)">
              <span class="vw-health__dot" /> {{ l.healthScore }}/100
            </span>
          </div>
          <div class="vw-health-bar">
            <div class="vw-health-bar__fill" :class="healthBar(l.healthScore)" :style="{ width: l.healthScore + '%' }" />
          </div>
        </div>

        <div class="list-stats">
          <div class="list-stat"><span class="list-stat__n">{{ fmt(l.views30d) }}</span><span class="list-stat__l">Views (30d)</span></div>
          <div class="list-stat"><span class="list-stat__n">{{ l.savesPct }}%</span><span class="list-stat__l">Save rate</span></div>
          <div class="list-stat"><span class="list-stat__n">{{ l.leads30d }}</span><span class="list-stat__l">Leads</span></div>
          <div class="list-stat"><span class="list-stat__n">{{ l.rating ? '★ ' + l.rating : '—' }}</span><span class="list-stat__l">{{ l.reviewsCount }} reviews</span></div>
        </div>

        <div v-if="l.aiIssues.length" class="vw-ai-card list-ai">
          <div class="vw-ai-card__title">
            <span class="vw-ai-chip">AI</span>
            {{ l.aiIssues.length }} improvements to boost this listing
          </div>
          <ul class="list-ai__list">
            <li v-for="(fix, i) in l.aiIssues" :key="i">{{ fix }}</li>
          </ul>
          <div class="list-ai__actions">
            <NuxtLink to="/dashboard/content-assistant" class="bw-btn bw-btn--primary bw-btn--sm">Fix with AI</NuxtLink>
          </div>
        </div>

        <div class="list-actions">
          <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="toggleStatus(l.id, l.status)">
            {{ l.status === 'live' ? 'Pause' : l.status === 'paused' ? 'Resume' : 'Publish' }}
          </button>
          <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="startEdit(l)">Edit</button>
          <button class="bw-btn bw-btn--subtle bw-btn--sm">View public page</button>
          <button class="bw-btn bw-btn--danger bw-btn--sm" @click="deleteListing(l.id)">Delete</button>
        </div>
      </li>
    </ul>

    <!-- Edit modal -->
    <div v-if="editTarget" class="vl-modal-overlay" @click.self="editTarget = null">
      <div class="vl-modal">
        <h2 class="vl-modal__title">Edit listing</h2>
        <form class="vl-modal__form" @submit.prevent="saveEdit">
          <label>Name<input v-model="editForm.name" required /></label>
          <label>Short description<textarea v-model="editForm.description" rows="2" /></label>
          <label>Category<input v-model="editForm.category" /></label>
          <label>Pricing type
            <select v-model="editForm.pricingType">
              <option value="free">Free</option>
              <option value="trial">Free trial</option>
              <option value="paid">Paid</option>
              <option value="contact">Contact us</option>
            </select>
          </label>
          <label v-if="editForm.pricingType === 'paid'">Price (USD/mo)<input v-model.number="editForm.pricingValue" type="number" min="0" /></label>
          <div class="vl-modal__actions">
            <button type="button" class="bw-btn bw-btn--ghost bw-btn--sm" @click="editTarget = null">Cancel</button>
            <button type="submit" class="bw-btn bw-btn--primary bw-btn--sm" :disabled="saving">{{ saving ? 'Saving…' : 'Save changes' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
const { listings, updateListingStatus } = useVendorData()

const q = ref('')
const filter = ref('all')
const toast = ref('')

const editTarget = ref<string | null>(null)
const saving = ref(false)
const editForm = reactive({ name: '', description: '', category: '', pricingType: 'contact', pricingValue: null as number | null })

const filtered = computed(() => listings.value.filter(l => {
  if (filter.value !== 'all' && l.status !== filter.value) return false
  if (q.value && !l.name.toLowerCase().includes(q.value.toLowerCase())) return false
  return true
}))

function fmt(n: number) { return n.toLocaleString() }
function statusChip(s: string) {
  if (s === 'live') return 'bw-chip--success'
  if (s === 'draft') return 'bw-chip--neutral'
  if (s === 'paused') return 'bw-chip--warning'
  return 'bw-chip--info'
}
function healthClass(s: number) {
  if (s >= 75) return 'vw-health--good'
  if (s >= 50) return 'vw-health--fair'
  return 'vw-health--poor'
}
function healthBar(s: number) {
  if (s >= 75) return 'vw-health-bar__fill--good'
  if (s >= 50) return 'vw-health-bar__fill--fair'
  return 'vw-health-bar__fill--poor'
}
function toggleStatus(id: string, s: string) {
  const next = s === 'live' ? 'paused' : s === 'paused' ? 'live' : 'live'
  updateListingStatus(id, next as any)
  toast.value = `Listing ${next === 'live' ? 'published' : next}`
  setTimeout(() => (toast.value = ''), 2200)
}
function create() {
  toast.value = 'New draft created — head to Content assistant to fill it.'
  setTimeout(() => (toast.value = ''), 2600)
}

function startEdit(l: any) {
  editTarget.value = l.id
  editForm.name = l.name
  editForm.description = l.description || ''
  editForm.category = l.category || ''
  editForm.pricingType = l.pricing?.type || 'contact'
  editForm.pricingValue = l.pricing?.value ?? null
}

async function saveEdit() {
  if (!editTarget.value) return
  saving.value = true
  try {
    await $fetch(`/api/vendor/apps/${editTarget.value}`, {
      method: 'PUT',
      body: {
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        pricingType: editForm.pricingType,
        pricingValue: editForm.pricingValue
      }
    })
    toast.value = 'Listing updated'
    editTarget.value = null
  } catch {
    toast.value = 'Failed to save — please try again'
  } finally {
    saving.value = false
    setTimeout(() => (toast.value = ''), 2500)
  }
}

async function deleteListing(id: string) {
  if (!confirm('Delete this listing? This cannot be undone.')) return
  try {
    await $fetch(`/api/vendor/apps/${id}`, { method: 'DELETE' })
    toast.value = 'Listing deleted'
    listings.value = listings.value.filter((l: any) => l.id !== id)
  } catch {
    toast.value = 'Failed to delete — please try again'
  } finally {
    setTimeout(() => (toast.value = ''), 2500)
  }
}
</script>

<style scoped>
.bw-toast { background: #111827; color: white; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 14px; display: inline-block; }

.list-grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }

.list-card { display: flex; flex-direction: column; gap: 14px; }
.list-head { display: flex; align-items: center; gap: 12px; }
.list-logo {
  width: 40px; height: 40px; border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; flex-shrink: 0;
}
.list-meta { flex: 1; min-width: 0; }
.list-name { font-weight: 700; font-size: 1rem; font-family: var(--f-ui); }
.list-sub { font-size: 0.82rem; color: var(--vw-text-muted); }

.list-health__row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.82rem; color: var(--vw-text-muted); font-weight: 500; }
.list-health__label { color: var(--vw-text-subtle); }

.list-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px; background: var(--vw-surface-2); border-radius: 10px; }
.list-stat { display: flex; flex-direction: column; text-align: center; }
.list-stat__n { font-weight: 700; font-size: 0.95rem; }
.list-stat__l { font-size: 0.7rem; color: var(--vw-text-subtle); margin-top: 2px; }

.list-ai__list { margin: 8px 0 10px; padding-left: 18px; font-size: 0.82rem; color: var(--vw-text); }
.list-ai__list li { margin-bottom: 2px; }
.list-ai__actions { display: flex; justify-content: flex-end; }

.list-actions { display: flex; gap: 8px; flex-wrap: wrap; padding-top: 6px; border-top: 1px solid var(--vw-border); margin-top: auto; padding-top: 12px; }

.bw-btn--danger { background: rgba(220,38,38,0.12); color: #f87171; border: 0.5px solid rgba(220,38,38,0.3); }
.bw-btn--danger:hover { background: rgba(220,38,38,0.22); }

/* Edit modal */
.vl-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.vl-modal { background: var(--mm-s1); border: 0.5px solid var(--b2); border-radius: var(--r-xl); padding: 2rem; width: 100%; max-width: 520px; }
.vl-modal__title { font-size: 1.15rem; font-weight: 700; color: var(--mm-pearl); margin: 0 0 1.25rem; font-family: var(--f-display); }
.vl-modal__form { display: flex; flex-direction: column; gap: 0.85rem; }
.vl-modal__form label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.85rem; color: var(--mm-silver); font-weight: 500; }
.vl-modal__form input, .vl-modal__form textarea, .vl-modal__form select {
  padding: 0.65rem 0.85rem; border: 0.5px solid var(--b2); border-radius: var(--r-md);
  background: var(--mm-s2); color: var(--mm-pearl); font-size: 0.9rem; font-family: inherit; outline: none;
}
.vl-modal__form input:focus, .vl-modal__form textarea:focus, .vl-modal__form select:focus { border-color: var(--mm-gold); }
.vl-modal__form textarea { resize: vertical; min-height: 64px; }
.vl-modal__actions { display: flex; justify-content: flex-end; gap: 0.5rem; padding-top: 0.5rem; }
</style>
