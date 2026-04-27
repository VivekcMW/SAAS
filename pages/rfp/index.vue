<template>
  <div class="rfp-page">
    <div class="rfp-page__hero">
      <div class="container">
        <h1>Request for Proposal</h1>
        <p>Describe your requirements and get responses from verified SaaS vendors.</p>
      </div>
    </div>

    <div class="container rfp-page__body">
      <div class="rfp-page__layout">
        <!-- My RFPs list -->
        <aside class="rfp-sidebar">
          <h3>My RFPs</h3>
          <p v-if="rfpPending" class="muted">Loading…</p>
          <p v-else-if="!rfpList?.rfps?.length" class="muted">No RFPs yet.</p>
          <ul v-else class="rfp-list">
            <li v-for="rfp in rfpList.rfps" :key="rfp.id">
              <NuxtLink :to="`/rfp/${rfp.slug}`" class="rfp-list-item">
                <span class="rfp-list-item__title">{{ rfp.title }}</span>
                <span :class="['rfp-badge', `rfp-badge--${rfp.status}`]">{{ rfp.status }}</span>
                <span class="rfp-list-item__responses">{{ rfp.response_count }} response{{ rfp.response_count !== 1 ? 's' : '' }}</span>
              </NuxtLink>
            </li>
          </ul>
        </aside>

        <!-- Builder form -->
        <main class="rfp-builder">
          <h2>Create a new RFP</h2>

          <form class="rfp-form" @submit.prevent="submitRfp">
            <div class="form-group">
              <label>Title <span class="req">*</span></label>
              <input v-model="form.title" type="text" placeholder="e.g. Looking for a CRM for 50-seat sales team" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select v-model="form.category">
                  <option value="">Any category</option>
                  <option>CRM</option>
                  <option>Project Management</option>
                  <option>HR & Payroll</option>
                  <option>Analytics</option>
                  <option>Customer Support</option>
                  <option>Marketing Automation</option>
                  <option>Finance & Accounting</option>
                  <option>DevOps</option>
                  <option>Security</option>
                  <option>Communication</option>
                  <option>Design</option>
                  <option>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Seats</label>
                <input v-model.number="form.seats" type="number" min="1" placeholder="Number of seats" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Budget min (USD/yr)</label>
                <input v-model.number="form.budget_min" type="number" min="0" placeholder="e.g. 500" />
              </div>
              <div class="form-group">
                <label>Budget max (USD/yr)</label>
                <input v-model.number="form.budget_max" type="number" min="0" placeholder="e.g. 5000" />
              </div>
            </div>

            <div class="form-group">
              <label>Requirements <span class="req">*</span></label>
              <textarea v-model="form.requirements" rows="5" placeholder="Describe your must-haves, integrations needed, compliance requirements, etc." required></textarea>
            </div>

            <div class="form-group">
              <label>Response deadline</label>
              <input v-model="form.deadline" type="date" :min="today" />
            </div>

            <p v-if="error" class="form-error">{{ error }}</p>
            <p v-if="success" class="form-success">{{ success }}</p>

            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? 'Publishing…' : 'Publish RFP' }}
            </button>
          </form>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'RFP Builder — SaasWorld', description: 'Post a request for proposal and receive responses from qualified SaaS vendors.' })

const { data: rfpList, pending: rfpPending, refresh: refreshRfps } = await useAsyncData('my-rfps', () => $fetch('/api/rfp'))

const today = new Date().toISOString().slice(0, 10)
const form = reactive({ title: '', category: '', seats: null as number | null, budget_min: null as number | null, budget_max: null as number | null, requirements: '', deadline: '' })
const loading = ref(false)
const error = ref('')
const success = ref('')

async function submitRfp() {
  error.value = ''
  success.value = ''
  if (form.title.trim().length < 10) { error.value = 'Title must be at least 10 characters.'; return }
  loading.value = true
  try {
    const result: any = await $fetch('/api/rfp', { method: 'POST', body: form })
    success.value = 'RFP published!'
    await refreshRfps()
    await navigateTo(`/rfp/${result.slug}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Failed to publish RFP. Are you signed in?'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.rfp-page__hero { background: #0f172a; color: #fff; padding: 2.5rem 1.5rem; }
.rfp-page__hero h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
.rfp-page__hero p { opacity: 0.75; font-size: 0.95rem; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
.rfp-page__body { padding-top: 2rem; padding-bottom: 3rem; }
.rfp-page__layout { display: grid; grid-template-columns: 260px 1fr; gap: 2.5rem; }
@media (max-width: 768px) { .rfp-page__layout { grid-template-columns: 1fr; } }
.rfp-sidebar h3 { font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 0.75rem; }
.rfp-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.rfp-list-item { display: flex; flex-direction: column; gap: 2px; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: inherit; transition: border-color 0.15s; }
.rfp-list-item:hover { border-color: #6366f1; }
.rfp-list-item__title { font-size: 0.85rem; font-weight: 600; }
.rfp-list-item__responses { font-size: 0.75rem; color: #9ca3af; }
.rfp-badge { font-size: 0.7rem; font-weight: 600; padding: 2px 7px; border-radius: 20px; align-self: flex-start; text-transform: capitalize; }
.rfp-badge--open { background: #d1fae5; color: #065f46; }
.rfp-badge--closed { background: #f3f4f6; color: #6b7280; }
.rfp-builder h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem; }
.rfp-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
.req { color: #ef4444; }
.form-group input, .form-group select, .form-group textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 0.875rem; font-family: inherit; transition: border-color 0.15s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.form-group textarea { resize: vertical; min-height: 120px; }
.form-error { color: #dc2626; font-size: 0.875rem; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 8px 12px; }
.form-success { color: #065f46; font-size: 0.875rem; background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 6px; padding: 8px 12px; }
.btn-submit { background: #6366f1; color: #fff; border: none; border-radius: 9px; padding: 10px 24px; font-size: 0.9rem; font-weight: 700; cursor: pointer; align-self: flex-start; transition: background 0.15s; }
.btn-submit:hover { background: #4f46e5; }
.btn-submit:disabled { background: #a5b4fc; cursor: not-allowed; }
.muted { color: #9ca3af; font-size: 0.875rem; }
</style>
