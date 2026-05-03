<template>
  <div class="rfp-detail">
    <div class="container rfp-detail__body" v-if="rfpData">
      <NuxtLink to="/rfp" class="back-link">← Back to RFPs</NuxtLink>

      <!-- RFP header -->
      <div class="rfp-header">
        <div class="rfp-header__meta">
          <span :class="['rfp-badge', `rfp-badge--${rfpData.rfp.status}`]">{{ rfpData.rfp.status }}</span>
          <span v-if="rfpData.rfp.category" class="rfp-category">{{ rfpData.rfp.category }}</span>
        </div>
        <h1>{{ rfpData.rfp.title }}</h1>
        <div class="rfp-header__details">
          <span v-if="rfpData.rfp.budget_min || rfpData.rfp.budget_max">
            Budget: ${{ rfpData.rfp.budget_min ?? '–' }} – ${{ rfpData.rfp.budget_max ?? '–' }} / yr
          </span>
          <span v-if="rfpData.rfp.seats">{{ rfpData.rfp.seats }} seats</span>
          <span v-if="rfpData.rfp.deadline">Deadline: {{ fmtDate(rfpData.rfp.deadline) }}</span>
          <span>{{ rfpData.rfp.response_count }} response{{ rfpData.rfp.response_count !== 1 ? 's' : '' }}</span>
        </div>
        <div v-if="rfpData.rfp.requirements" class="rfp-requirements">
          <h3>Requirements</h3>
          <p>{{ rfpData.rfp.requirements }}</p>
        </div>
      </div>

      <!-- Vendor respond form -->
      <div v-if="!rfpData.is_owner && rfpData.rfp.status === 'open'" class="rfp-respond-card">
        <h3>Submit your response</h3>
        <form @submit.prevent="submitResponse">
          <div class="form-group">
            <label>Message <span class="req">*</span></label>
            <textarea v-model="responseForm.message" rows="4" placeholder="Describe how your solution meets their requirements…" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Price (USD)</label>
              <input v-model.number="responseForm.price_usd" type="number" min="0" placeholder="0" />
            </div>
            <div class="form-group">
              <label>Billing period</label>
              <select v-model="responseForm.billing_period">
                <option value="">Select</option>
                <option value="month">Monthly</option>
                <option value="year">Annual</option>
                <option value="user/month">Per user / month</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>
          <p v-if="responseError" class="form-error">{{ responseError }}</p>
          <button type="submit" class="btn-submit" :disabled="responseLoading">
            {{ responseLoading ? 'Submitting…' : 'Submit response' }}
          </button>
          <p v-if="responseSuccess" class="form-success">{{ responseSuccess }}</p>
        </form>
      </div>

      <!-- Owner: responses list -->
      <div v-if="rfpData.is_owner" class="rfp-responses">
        <h3>Responses ({{ rfpData.rfp.response_count }})</h3>
        <p v-if="!rfpData.responses?.length" class="muted">No responses yet. Share this RFP with vendors to get proposals.</p>
        <div v-else class="response-list">
          <div v-for="r in rfpData.responses" :key="r.id" class="response-card">
            <div class="response-card__header">
              <span class="response-card__vendor">{{ r.company_name || r.app_name || 'Vendor' }}</span>
              <span v-if="r.price_usd" class="response-card__price">${{ r.price_usd }}<small>/{{ r.billing_period }}</small></span>
              <span class="response-card__date">{{ fmtDate(r.created_at) }}</span>
            </div>
            <p class="response-card__body">{{ r.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container" v-else>
      <p class="muted" style="padding:2rem 0">Loading…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: rfpData, refresh } = await useAsyncData<{ rfp: { id: string; title: string; description?: string; status: string; deadline?: string; budget_min?: number; budget_max?: number; seats?: number; created_at: string; requirements?: string; tags?: string[]; category?: string; response_count?: number }; responses: { id: string; company_name: string; app_name: string; price_usd?: number; billing_period?: string; message?: string; created_at: string }[]; is_owner: boolean }>(`rfp-${slug.value}`, () => $fetch(`/api/rfp/${slug.value}`))
useSeoMeta({ title: computed(() => rfpData.value ? `${(rfpData.value as any).rfp.title} — RFP` : 'RFP') })

const responseForm = reactive({ message: '', price_usd: null as number | null, billing_period: '' })
const responseLoading = ref(false)
const responseError = ref('')
const responseSuccess = ref('')

async function submitResponse() {
  responseError.value = ''
  responseSuccess.value = ''
  responseLoading.value = true
  try {
    await $fetch(`/api/rfp/${slug.value}/respond`, { method: 'POST', body: responseForm })
    responseSuccess.value = 'Response submitted!'
    responseForm.message = ''
    responseForm.price_usd = null
    responseForm.billing_period = ''
    await refresh()
  } catch (e: any) {
    responseError.value = e?.data?.statusMessage || 'Failed to submit. Please sign in as a vendor.'
  } finally {
    responseLoading.value = false
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.rfp-detail { padding-bottom: 3rem; }
.container { max-width: 860px; margin: 0 auto; padding: 0 1.5rem; }
.back-link { display: inline-block; color: #6366f1; text-decoration: none; font-size: 0.875rem; margin: 1.5rem 0 1rem; }
.rfp-header { border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.75rem; margin-bottom: 1.5rem; }
.rfp-header__meta { display: flex; gap: 8px; align-items: center; margin-bottom: 0.75rem; }
.rfp-badge { font-size: 0.72rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; text-transform: uppercase; }
.rfp-badge--open { background: #d1fae5; color: #065f46; }
.rfp-badge--closed { background: #f3f4f6; color: #6b7280; }
.rfp-category { font-size: 0.78rem; background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; }
.rfp-header h1 { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.75rem; }
.rfp-header__details { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.82rem; color: #6b7280; margin-bottom: 1rem; }
.rfp-requirements h3 { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.4rem; }
.rfp-requirements p { font-size: 0.875rem; line-height: 1.6; color: #374151; white-space: pre-wrap; }
.rfp-respond-card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.5rem; margin-bottom: 1.5rem; }
.rfp-respond-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; }
.rfp-responses h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
.response-list { display: flex; flex-direction: column; gap: 12px; }
.response-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem; }
.response-card__header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
.response-card__vendor { font-weight: 700; font-size: 0.9rem; }
.response-card__price { font-size: 0.875rem; font-weight: 600; color: #4f46e5; }
.response-card__price small { font-size: 0.72rem; font-weight: 400; color: #9ca3af; }
.response-card__date { margin-left: auto; font-size: 0.75rem; color: #9ca3af; }
.response-card__body { font-size: 0.875rem; line-height: 1.6; color: #374151; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.75rem; }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-top: 0.75rem; }
.form-group label { font-size: 0.85rem; font-weight: 600; }
.req { color: #ef4444; }
.form-group input, .form-group select, .form-group textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 0.875rem; font-family: inherit; }
.form-group textarea { resize: vertical; min-height: 100px; }
.form-error { color: #dc2626; font-size: 0.875rem; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 8px 12px; margin-top: 0.75rem; }
.form-success { color: #065f46; font-size: 0.875rem; background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 6px; padding: 8px 12px; margin-top: 0.75rem; }
.btn-submit { margin-top: 1rem; background: #6366f1; color: #fff; border: none; border-radius: 9px; padding: 10px 24px; font-size: 0.9rem; font-weight: 700; cursor: pointer; }
.btn-submit:hover { background: #4f46e5; }
.btn-submit:disabled { background: #a5b4fc; cursor: not-allowed; }
.muted { color: #9ca3af; font-size: 0.875rem; }
</style>
