<template>
  <div class="vw">
    <!-- Header -->
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Sponsorships</h1>
        <p class="bw-head__sub">Boost your app's visibility with a paid sponsored placement across the marketplace.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary" @click="openForm = true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Request a slot
        </button>
      </div>
    </header>

    <!-- How it works strip -->
    <div class="sp-how">
      <div v-for="(step, i) in HOW_STEPS" :key="i" class="sp-how__step">
        <div class="sp-how__num">{{ i + 1 }}</div>
        <div class="sp-how__body">
          <strong class="sp-how__title">{{ step.title }}</strong>
          <p class="sp-how__desc">{{ step.desc }}</p>
        </div>
      </div>
    </div>

    <!-- KPI strip (only if user has requests) -->
    <div v-if="requests.length > 0" class="bw-kpis sp-kpis">
      <div class="bw-kpi">
        <div class="bw-kpi__label">Total requests</div>
        <div class="bw-kpi__value">{{ requests.length }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Active campaigns</div>
        <div class="bw-kpi__value">{{ requests.filter(r => r.status === 'active').length }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Pending review</div>
        <div class="bw-kpi__value">{{ requests.filter(r => r.status === 'pending').length }}</div>
      </div>
      <div class="bw-kpi">
        <div class="bw-kpi__label">Total budget committed</div>
        <div class="bw-kpi__value">${{ totalBudget.toLocaleString() }}</div>
      </div>
    </div>

    <!-- Request history -->
    <div v-if="loading" class="sp-loading">Loading your sponsorship requests…</div>

    <div v-else-if="requests.length === 0" class="sp-empty">
      <div class="sp-empty__icon">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 11v2M20 4v16"/><path d="M20 4L5 9v6l15 5V4z"/><path d="M5 15l-2 5"/></svg>
      </div>
      <h3 class="sp-empty__title">No sponsorship requests yet</h3>
      <p class="sp-empty__desc">Request a placement slot to get your app in front of high-intent buyers on the homepage, category pages, and search results.</p>
      <button class="bw-btn bw-btn--primary" @click="openForm = true">Request a slot</button>
    </div>

    <div v-else class="sp-list">
      <div v-for="req in requests" :key="req.id" class="sp-card">
        <div class="sp-card__head">
          <div class="sp-card__app">
            <div class="sp-card__app-name">{{ req.appName }}</div>
            <div class="sp-card__app-sub">{{ slotLabel(req.slot) }}</div>
          </div>
          <span class="sp-badge" :class="statusClass(req.status)">{{ statusLabel(req.status) }}</span>
        </div>

        <!-- Status timeline -->
        <div class="sp-timeline">
          <div class="sp-tl-step" :class="{ done: true }">
            <div class="sp-tl-dot" />
            <span>Submitted {{ fmtDate(req.submittedAt) }}</span>
          </div>
          <div class="sp-tl-step" :class="{ done: req.status !== 'pending', active: req.status === 'pending' }">
            <div class="sp-tl-dot" />
            <span>Admin review</span>
          </div>
          <div class="sp-tl-step" :class="{ done: ['active','expired'].includes(req.status), active: req.status === 'scheduled', skipped: req.status === 'rejected' }">
            <div class="sp-tl-dot" />
            <span>{{ req.status === 'rejected' ? 'Rejected' : 'Scheduled' }}</span>
          </div>
          <div class="sp-tl-step" :class="{ done: req.status === 'expired', active: req.status === 'active', skipped: req.status === 'rejected' }">
            <div class="sp-tl-dot" />
            <span>Live</span>
          </div>
        </div>

        <div class="sp-card__meta">
          <div class="sp-meta-item">
            <span class="sp-meta-label">Dates</span>
            <span>{{ fmtDate(req.startsAt) }} → {{ fmtDate(req.endsAt) }}</span>
          </div>
          <div class="sp-meta-item">
            <span class="sp-meta-label">Budget</span>
            <span>${{ req.budget.toLocaleString() }}</span>
          </div>
          <div v-if="req.goal" class="sp-meta-item">
            <span class="sp-meta-label">Goal</span>
            <span>{{ goalLabel(req.goal) }}</span>
          </div>
        </div>

        <!-- Stats (only for active/expired) -->
        <div v-if="req.status === 'active' || req.status === 'expired'" class="sp-stats">
          <div class="sp-stat">
            <span class="sp-stat__n">{{ (req.impressions ?? 0).toLocaleString() }}</span>
            <span class="sp-stat__l">Impressions</span>
          </div>
          <div class="sp-stat">
            <span class="sp-stat__n">{{ (req.clicks ?? 0).toLocaleString() }}</span>
            <span class="sp-stat__l">Clicks</span>
          </div>
          <div class="sp-stat">
            <span class="sp-stat__n">{{ req.clicks && req.impressions ? ((req.clicks / req.impressions) * 100).toFixed(1) + '%' : '—' }}</span>
            <span class="sp-stat__l">CTR</span>
          </div>
          <div class="sp-stat">
            <span class="sp-stat__n">{{ (req.leadsAttributed ?? 0) }}</span>
            <span class="sp-stat__l">Leads</span>
          </div>
        </div>

        <!-- Rejection reason -->
        <div v-if="req.status === 'rejected' && req.rejectionReason" class="sp-reject-note">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ req.rejectionReason }}
        </div>

        <!-- Info needed -->
        <div v-if="req.status === 'info-needed' && req.adminNote" class="sp-info-note">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Admin needs more info: {{ req.adminNote }}
        </div>

        <div class="sp-card__foot">
          <button
            v-if="req.status === 'expired'"
            class="bw-btn bw-btn--ghost bw-btn--sm"
            @click="renewRequest(req)"
          >Renew campaign</button>
          <button
            v-if="req.status === 'rejected'"
            class="bw-btn bw-btn--ghost bw-btn--sm"
            @click="reapplyRequest(req)"
          >Re-apply</button>
        </div>
      </div>
    </div>

    <!-- ─── Slot availability guide ─── -->
    <div class="sp-slots-guide">
      <h2 class="sp-slots-guide__title">Placement slots</h2>
      <div class="sp-slots-grid">
        <div v-for="slot in SLOT_OPTIONS" :key="slot.value" class="sp-slot-card">
          <div class="sp-slot-card__top">
            <span class="sp-slot-name">{{ slot.label }}</span>
            <span class="sp-slot-price">From ${{ slot.minBudget }}/mo</span>
          </div>
          <p class="sp-slot-desc">{{ slot.desc }}</p>
          <div class="sp-slot-reach">
            <span class="sp-slot-reach__bar"><span :style="{ width: slot.reach + '%' }" class="sp-slot-reach__fill" /></span>
            <span class="sp-slot-reach__label">{{ slot.reach }}% reach</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Request form modal ─── -->
    <div v-if="openForm" class="sp-modal-bg" @click.self="openForm = false">
      <div class="sp-modal">
        <div class="sp-modal__head">
          <h2 class="sp-modal__title">Request a sponsorship slot</h2>
          <button class="sp-modal__close" type="button" aria-label="Close" @click="openForm = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="sp-modal__body">
          <!-- Step indicator -->
          <div class="sp-steps">
            <div v-for="(s, i) in FORM_STEPS" :key="i" class="sp-step" :class="{ active: formStep === i, done: formStep > i }">
              <div class="sp-step__dot">{{ formStep > i ? '✓' : i + 1 }}</div>
              <span class="sp-step__label">{{ s }}</span>
            </div>
          </div>

          <!-- Step 0: App & Slot -->
          <div v-if="formStep === 0" class="sp-form-section">
            <div class="sp-field">
              <label class="sp-label">Which listing do you want to promote? <span class="sp-req">*</span></label>
              <select v-model="form.appName" class="sp-select">
                <option value="">Select a listing</option>
                <option v-for="l in myListings" :key="l.id" :value="l.name">{{ l.name }}</option>
              </select>
            </div>
            <div class="sp-field">
              <label class="sp-label">Placement slot <span class="sp-req">*</span></label>
              <div class="sp-slot-picker">
                <label
                  v-for="slot in SLOT_OPTIONS"
                  :key="slot.value"
                  class="sp-slot-option"
                  :class="{ selected: form.slot === slot.value }"
                >
                  <input v-model="form.slot" type="radio" :value="slot.value" class="sp-slot-radio" >
                  <div class="sp-slot-option__body">
                    <strong class="sp-slot-option__name">{{ slot.label }}</strong>
                    <span class="sp-slot-option__price">From ${{ slot.minBudget }}/mo</span>
                    <p class="sp-slot-option__desc">{{ slot.desc }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 1: Schedule & Budget -->
          <div v-if="formStep === 1" class="sp-form-section">
            <div class="sp-date-row">
              <div class="sp-field" style="flex:1;">
                <label class="sp-label">Start date <span class="sp-req">*</span></label>
                <input v-model="form.startsAt" type="date" class="sp-input" :min="today" >
              </div>
              <div class="sp-field" style="flex:1;">
                <label class="sp-label">End date <span class="sp-req">*</span></label>
                <input v-model="form.endsAt" type="date" class="sp-input" :min="form.startsAt || today" >
              </div>
            </div>
            <div class="sp-field">
              <label class="sp-label">Campaign goal <span class="sp-req">*</span></label>
              <select v-model="form.goal" class="sp-select">
                <option value="">Select a goal</option>
                <option value="brand_awareness">Brand awareness</option>
                <option value="lead_gen">Lead generation</option>
                <option value="launch">Product launch</option>
                <option value="category_dominance">Category dominance</option>
              </select>
            </div>
            <div class="sp-field">
              <label class="sp-label">Total budget (USD) <span class="sp-req">*</span></label>
              <div class="sp-budget-wrap">
                <input v-model.number="form.budget" type="number" :min="selectedSlot?.minBudget ?? 100" step="100" class="sp-input" :placeholder="`Min. $${selectedSlot?.minBudget ?? 100}`" >
                <span v-if="selectedSlot" class="sp-budget-hint">Min. ${{ selectedSlot.minBudget }} for this slot</span>
              </div>
            </div>
            <!-- AI budget suggestion -->
            <div v-if="form.budget > 0" class="sp-ai-tip">
              <span class="sp-ai-chip">AI</span>
              <p>For a {{ campaignDays }}-day {{ goalLabel(form.goal) }} campaign, a budget of <strong>${{ suggestedBudget.toLocaleString() }}</strong> typically yields 2–3× ROI in your category based on similar campaigns.</p>
            </div>
          </div>

          <!-- Step 2: Notes & Submit -->
          <div v-if="formStep === 2" class="sp-form-section">
            <div class="sp-field">
              <label class="sp-label">Key message / tagline (optional)</label>
              <input v-model="form.tagline" class="sp-input" placeholder="e.g. The #1 CRM for growing SaaS teams" >
            </div>
            <div class="sp-field">
              <label class="sp-label">Notes for admin (optional)</label>
              <textarea v-model="form.notes" class="sp-textarea" rows="3" placeholder="Any special requirements, target audience, or context that helps us approve faster…" />
            </div>
            <!-- Summary -->
            <div class="sp-summary">
              <h4 class="sp-summary__title">Request summary</h4>
              <div class="sp-summary__row"><span>App</span><strong>{{ form.appName }}</strong></div>
              <div class="sp-summary__row"><span>Placement</span><strong>{{ slotLabel(form.slot) }}</strong></div>
              <div class="sp-summary__row"><span>Dates</span><strong>{{ fmtDate(form.startsAt) }} → {{ fmtDate(form.endsAt) }}</strong></div>
              <div class="sp-summary__row"><span>Budget</span><strong>${{ form.budget.toLocaleString() }}</strong></div>
              <div class="sp-summary__row"><span>Goal</span><strong>{{ goalLabel(form.goal) }}</strong></div>
            </div>
          </div>

          <p v-if="formError" class="sp-error">{{ formError }}</p>
        </div>

        <div class="sp-modal__foot">
          <button v-if="formStep > 0" class="bw-btn bw-btn--ghost" @click="formStep--">Back</button>
          <button v-else class="bw-btn bw-btn--ghost" @click="openForm = false">Cancel</button>
          <button v-if="formStep < 2" class="bw-btn bw-btn--primary" @click="nextStep">Next</button>
          <button v-else class="bw-btn bw-btn--primary" :disabled="saving" @click="submitRequest">
            {{ saving ? 'Submitting…' : 'Submit request' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success toast -->
    <Transition name="sp-toast">
      <div v-if="successMsg" class="sp-toast" role="status">{{ successMsg }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────
interface SponsorRequest {
  id: string
  appName: string
  slot: string
  status: 'pending' | 'approved' | 'scheduled' | 'active' | 'expired' | 'rejected' | 'info-needed'
  startsAt: string
  endsAt: string
  goal: string
  budget: number
  tagline?: string
  notes?: string
  submittedAt: string
  rejectionReason?: string
  adminNote?: string
  impressions?: number
  clicks?: number
  leadsAttributed?: number
}

interface MyListing { id: string; name: string }

// ─── Static config ────────────────────────────────────────────────────────────
const SLOT_OPTIONS = [
  { value: 'homepage_hero',     label: 'Homepage hero',       desc: 'Full-width banner at top of homepage. Maximum visibility.',            minBudget: 2000, reach: 95 },
  { value: 'homepage_featured', label: 'Homepage featured',   desc: 'Horizontal card strip below hero. Up to 4 active simultaneously.',     minBudget: 800,  reach: 80 },
  { value: 'category_top',      label: 'Category — top',      desc: 'Pinned above organic results in your chosen category.',                minBudget: 500,  reach: 60 },
  { value: 'search_results',    label: 'Search — promoted',   desc: '"Sponsored" card injected above organic search results.',             minBudget: 600,  reach: 70 },
  { value: 'newsletter',        label: 'Newsletter slot',     desc: 'Featured in the weekly newsletter sent to all buyers (Tuesdays).',    minBudget: 400,  reach: 50 },
  { value: 'email_digest',      label: 'Monthly digest',      desc: 'Logo + blurb in the monthly email digest to registered buyers.',      minBudget: 300,  reach: 40 },
]

const HOW_STEPS = [
  { title: 'Submit a request',    desc: 'Choose your listing, placement slot, schedule, and budget. We review within 1–2 business days.' },
  { title: 'Admin approval',      desc: 'Our team reviews your request and may ask follow-up questions before approving.' },
  { title: 'Campaign goes live',  desc: 'Once approved, your app is promoted on the marketplace on your chosen dates.' },
  { title: 'Track performance',   desc: 'Monitor impressions, clicks, CTR, and leads attributed to your campaign right here.' },
]

const FORM_STEPS = ['App & placement', 'Schedule & budget', 'Review & submit']

// ─── State ────────────────────────────────────────────────────────────────────
const loading    = ref(false)
const saving     = ref(false)
const openForm   = ref(false)
const formStep   = ref(0)
const formError  = ref('')
const successMsg = ref('')

const requests = ref<SponsorRequest[]>([
  {
    id: 'req_1', appName: 'Acme CRM', slot: 'homepage_hero',
    status: 'active', startsAt: '2026-05-01', endsAt: '2026-05-31',
    goal: 'lead_gen', budget: 2000, submittedAt: '2026-04-22',
    impressions: 14200, clicks: 312, leadsAttributed: 18
  },
  {
    id: 'req_2', appName: 'Acme CRM', slot: 'category_top',
    status: 'pending', startsAt: '2026-06-01', endsAt: '2026-06-30',
    goal: 'brand_awareness', budget: 500, submittedAt: '2026-05-10',
  },
])

const myListings = ref<MyListing[]>([
  { id: 'app_1', name: 'Acme CRM' },
  { id: 'app_2', name: 'Acme Analytics' },
])

const defaultForm = () => ({
  appName: '', slot: '', startsAt: '', endsAt: '',
  goal: '', budget: 0, tagline: '', notes: ''
})
const form = ref(defaultForm())

// ─── Computed ─────────────────────────────────────────────────────────────────
const today         = computed(() => new Date().toISOString().slice(0, 10))
const totalBudget   = computed(() => requests.value.reduce((s, r) => s + r.budget, 0))
const selectedSlot  = computed(() => SLOT_OPTIONS.find(s => s.value === form.value.slot))
const campaignDays  = computed(() => {
  if (!form.value.startsAt || !form.value.endsAt) return 30
  return Math.max(1, Math.ceil((new Date(form.value.endsAt).getTime() - new Date(form.value.startsAt).getTime()) / 86_400_000))
})
const suggestedBudget = computed(() => Math.round(campaignDays.value * (selectedSlot.value?.minBudget ?? 200) / 30 * 1.2 / 100) * 100)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slotLabel(val: string) { return SLOT_OPTIONS.find(s => s.value === val)?.label ?? val }
function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function statusLabel(s: string) {
  const m: Record<string, string> = { pending: 'Pending review', approved: 'Approved', scheduled: 'Scheduled', active: 'Live', expired: 'Ended', rejected: 'Rejected', 'info-needed': 'Info needed' }
  return m[s] ?? s
}
function statusClass(s: string) {
  const m: Record<string, string> = { pending: 'sp-badge--pending', approved: 'sp-badge--success', scheduled: 'sp-badge--info', active: 'sp-badge--active', expired: '', rejected: 'sp-badge--danger', 'info-needed': 'sp-badge--warning' }
  return m[s] ?? ''
}
function goalLabel(g: string) {
  const m: Record<string, string> = { brand_awareness: 'Brand awareness', lead_gen: 'Lead generation', launch: 'Product launch', category_dominance: 'Category dominance' }
  return m[g] ?? g
}

// ─── Multi-step validation ────────────────────────────────────────────────────
function validateStep(step: number): string | null {
  if (step === 0) {
    if (!form.value.appName) return 'Please select a listing.'
    if (!form.value.slot)    return 'Please select a placement slot.'
  }
  if (step === 1) {
    if (!form.value.startsAt) return 'Please pick a start date.'
    if (!form.value.endsAt)   return 'Please pick an end date.'
    if (form.value.endsAt < form.value.startsAt) return 'End date must be after start date.'
    if (!form.value.goal)     return 'Please select a campaign goal.'
    if (!form.value.budget || form.value.budget <= 0) return 'Please enter a budget.'
    if (selectedSlot.value && form.value.budget < selectedSlot.value.minBudget)
      return `Minimum budget for this slot is $${selectedSlot.value.minBudget}.`
  }
  return null
}

function nextStep() {
  const err = validateStep(formStep.value)
  if (err) { formError.value = err; return }
  formError.value = ''
  formStep.value++
}

// ─── Submit ───────────────────────────────────────────────────────────────────
async function submitRequest() {
  const err = validateStep(2)
  if (err) { formError.value = err; return }
  saving.value = true
  formError.value = ''
  try {
    await $fetch('/api/vendor/sponsorships', {
      method: 'POST',
      body: { ...form.value }
    })
    requests.value.unshift({
      id: 'req_' + Math.random().toString(36).slice(2, 7),
      ...form.value,
      status: 'pending',
      submittedAt: new Date().toISOString()
    })
    openForm.value = false
    formStep.value = 0
    form.value = defaultForm()
    successMsg.value = 'Request submitted! Our team will review within 1–2 business days.'
    setTimeout(() => { successMsg.value = '' }, 5000)
  } catch {
    formError.value = 'Failed to submit. Please try again.'
  } finally {
    saving.value = false
  }
}

function renewRequest(req: SponsorRequest) {
  form.value = { appName: req.appName, slot: req.slot, startsAt: '', endsAt: '', goal: req.goal, budget: req.budget, tagline: '', notes: '' }
  formStep.value = 0
  formError.value = ''
  openForm.value = true
}

function reapplyRequest(req: SponsorRequest) {
  form.value = { appName: req.appName, slot: req.slot, startsAt: '', endsAt: '', goal: req.goal, budget: req.budget, tagline: '', notes: '' }
  formStep.value = 0
  formError.value = ''
  openForm.value = true
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await $fetch<SponsorRequest[]>('/api/vendor/sponsorships')
    if (Array.isArray(data) && data.length) requests.value = data
  } catch { /* use demo data */ }
  finally { loading.value = false }

  try {
    const data = await $fetch<{ listings: MyListing[] }>('/api/vendor/listings')
    if (Array.isArray(data?.listings) && data.listings.length) myListings.value = data.listings
  } catch { /* use demo data */ }
})
</script>

<style scoped>
/* ── How it works ── */
.sp-how {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.sp-how__step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: var(--vw-surface, var(--bw-surface));
  border: 1px solid var(--vw-border, var(--bw-border));
  border-radius: 10px;
  padding: 14px;
}
.sp-how__num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--vw-primary, var(--bw-primary));
  color: #07090F;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sp-how__title { font-size: 0.88rem; font-weight: 700; display: block; margin-bottom: 2px; }
.sp-how__desc  { font-size: 0.78rem; color: var(--vw-text-muted, var(--bw-text-muted)); margin: 0; }

/* ── KPIs ── */
.sp-kpis { margin-bottom: 24px; }

/* ── Loading ── */
.sp-loading { padding: 24px; color: var(--bw-text-muted); font-size: 0.9rem; }

/* ── Empty state ── */
.sp-empty {
  text-align: center;
  padding: 48px 24px;
  background: var(--bw-surface);
  border: 1px dashed var(--bw-border-strong);
  border-radius: 12px;
  margin-bottom: 32px;
}
.sp-empty__icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: var(--bw-surface-2);
  border: 1px solid var(--bw-border);
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--bw-text-subtle);
  margin-bottom: 14px;
}
.sp-empty__title { font-size: 1rem; font-weight: 700; margin: 0 0 8px; }
.sp-empty__desc  { color: var(--bw-text-muted); font-size: 0.88rem; max-width: 400px; margin: 0 auto 16px; }

/* ── Request cards ── */
.sp-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }
.sp-card {
  background: var(--bw-surface);
  border: 1px solid var(--bw-border);
  border-radius: 12px;
  padding: 18px 20px;
}
.sp-card__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; gap: 12px; }
.sp-card__app-name { font-weight: 700; font-size: 0.95rem; }
.sp-card__app-sub  { font-size: 0.78rem; color: var(--bw-text-muted); margin-top: 2px; }

/* ── Status badge ── */
.sp-badge {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 20px;
  font-size: 0.75rem; font-weight: 700;
  background: var(--bw-surface-2); color: var(--bw-text-muted);
  white-space: nowrap; flex-shrink: 0;
}
.sp-badge--pending  { background: rgba(240,201,106,.12); color: #D4A843; }
.sp-badge--success  { background: rgba(42,157,143,.12);  color: #2A9D8F; }
.sp-badge--info     { background: rgba(74,127,212,.12);  color: #4A7FD4; }
.sp-badge--active   { background: rgba(42,157,143,.12);  color: #2A9D8F; }
.sp-badge--danger   { background: rgba(239,68,68,.12);   color: #EF4444; }
.sp-badge--warning  { background: rgba(240,201,106,.12); color: #D4A843; }

/* ── Timeline ── */
.sp-timeline {
  display: flex;
  gap: 0;
  margin-bottom: 14px;
  position: relative;
}
.sp-timeline::before {
  content: '';
  position: absolute;
  top: 8px; left: 8px; right: 8px;
  height: 2px;
  background: var(--bw-border);
}
.sp-tl-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--bw-text-subtle);
  position: relative;
  text-align: center;
}
.sp-tl-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid var(--bw-border);
  background: var(--bw-surface);
  position: relative;
  z-index: 1;
}
.sp-tl-step.done .sp-tl-dot { background: var(--bw-success, #2A9D8F); border-color: var(--bw-success, #2A9D8F); }
.sp-tl-step.done { color: var(--bw-text-muted); }
.sp-tl-step.active .sp-tl-dot { border-color: var(--bw-primary, #D4A843); background: var(--bw-primary-50); }
.sp-tl-step.active { color: var(--bw-primary, #D4A843); font-weight: 600; }
.sp-tl-step.skipped .sp-tl-dot { border-color: var(--bw-danger); background: rgba(239,68,68,.15); }
.sp-tl-step.skipped { color: var(--bw-danger); }

/* ── Meta row ── */
.sp-card__meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 12px; }
.sp-meta-item  { display: flex; flex-direction: column; gap: 2px; font-size: 0.82rem; }
.sp-meta-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--bw-text-subtle); }

/* ── Stats ── */
.sp-stats { display: flex; gap: 20px; background: var(--bw-surface-2); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; }
.sp-stat { display: flex; flex-direction: column; gap: 2px; }
.sp-stat__n { font-size: 1rem; font-weight: 700; }
.sp-stat__l { font-size: 0.72rem; color: var(--bw-text-subtle); text-transform: uppercase; letter-spacing: 0.05em; }

/* ── Rejection / info notes ── */
.sp-reject-note, .sp-info-note {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 0.82rem; padding: 10px 12px; border-radius: 8px; margin-bottom: 10px;
}
.sp-reject-note { background: rgba(239,68,68,.08); color: #EF4444; }
.sp-info-note   { background: rgba(240,201,106,.08); color: #D4A843; }

.sp-card__foot { display: flex; justify-content: flex-end; gap: 8px; }

/* ── Slot availability guide ── */
.sp-slots-guide { margin-top: 32px; }
.sp-slots-guide__title { font-family: var(--f-ui); font-size: 1rem; font-weight: 700; margin: 0 0 14px; }
.sp-slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.sp-slot-card {
  background: var(--bw-surface);
  border: 1px solid var(--bw-border);
  border-radius: 10px;
  padding: 14px;
}
.sp-slot-card__top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.sp-slot-name  { font-weight: 700; font-size: 0.88rem; }
.sp-slot-price { font-size: 0.78rem; color: var(--bw-primary, #D4A843); font-weight: 600; }
.sp-slot-desc  { font-size: 0.78rem; color: var(--bw-text-muted); margin: 0 0 10px; }
.sp-slot-reach { display: flex; align-items: center; gap: 8px; }
.sp-slot-reach__bar  { flex: 1; height: 4px; background: var(--bw-border); border-radius: 4px; overflow: hidden; }
.sp-slot-reach__fill { display: block; height: 100%; background: var(--bw-primary, #D4A843); border-radius: 4px; }
.sp-slot-reach__label { font-size: 0.72rem; color: var(--bw-text-subtle); white-space: nowrap; }

/* ── Modal ── */
.sp-modal-bg {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.sp-modal {
  background: var(--bw-surface, #0F1220);
  border: 1px solid var(--bw-border-strong, rgba(168,180,204,.2));
  border-radius: 14px;
  width: 100%; max-width: 640px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  overflow: hidden;
  display: flex; flex-direction: column;
  max-height: calc(100vh - 48px);
}
.sp-modal__head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--bw-border);
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
}
.sp-modal__title { font-family: var(--f-ui); font-weight: 700; font-size: 1rem; margin: 0; color: var(--bw-text, #F0F3F8); }
.sp-modal__close {
  background: none; border: none; cursor: pointer;
  color: var(--bw-text-muted); display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
}
.sp-modal__close:hover { background: var(--bw-surface-2); }
.sp-modal__body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; }
.sp-modal__foot {
  padding: 14px 20px;
  border-top: 1px solid var(--bw-border);
  display: flex; justify-content: flex-end; gap: 8px;
  flex-shrink: 0;
}

/* ── Step indicator ── */
.sp-steps { display: flex; gap: 0; margin-bottom: 4px; }
.sp-step  { flex: 1; display: flex; align-items: center; gap: 8px; position: relative; }
.sp-step:not(:last-child)::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--bw-border);
  margin: 0 4px;
}
.sp-step__dot {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid var(--bw-border);
  background: var(--bw-surface);
  font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  color: var(--bw-text-subtle);
  flex-shrink: 0;
}
.sp-step.active .sp-step__dot { border-color: var(--bw-primary); background: var(--bw-primary-50); color: var(--bw-primary); }
.sp-step.done .sp-step__dot   { border-color: var(--bw-success); background: var(--bw-success); color: #fff; }
.sp-step__label { font-size: 0.75rem; color: var(--bw-text-muted); white-space: nowrap; }
.sp-step.active .sp-step__label { color: var(--bw-primary); font-weight: 600; }
.sp-step.done .sp-step__label   { color: var(--bw-text-muted); }

/* ── Form section ── */
.sp-form-section { display: flex; flex-direction: column; gap: 14px; }
.sp-field { display: flex; flex-direction: column; gap: 5px; }
.sp-label { font-size: 0.83rem; font-weight: 600; color: var(--bw-text-muted); }
.sp-req   { color: var(--bw-danger, #EF4444); margin-left: 2px; }
.sp-input, .sp-select, .sp-textarea {
  width: 100%; padding: 10px 12px;
  border: 1px solid var(--bw-border-strong);
  border-radius: 10px;
  font-size: 0.9rem; font-family: inherit;
  background: var(--bw-surface); color: var(--bw-text);
  transition: border-color .15s, box-shadow .15s;
}
.sp-input:focus, .sp-select:focus, .sp-textarea:focus {
  outline: none;
  border-color: var(--bw-primary);
  box-shadow: 0 0 0 3px var(--bw-primary-50);
}
.sp-select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235b6472' stroke-width='2.25'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}
.sp-textarea { resize: vertical; min-height: 80px; }

/* ── Slot picker ── */
.sp-slot-picker { display: flex; flex-direction: column; gap: 8px; }
.sp-slot-radio  { position: absolute; opacity: 0; width: 0; height: 0; }
.sp-slot-option {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid var(--bw-border);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.sp-slot-option:hover  { border-color: var(--bw-border-strong); background: var(--bw-surface-2); }
.sp-slot-option.selected { border-color: var(--bw-primary); background: var(--bw-primary-50); }
.sp-slot-option__name  { font-weight: 700; font-size: 0.88rem; display: block; }
.sp-slot-option__price { font-size: 0.75rem; color: var(--bw-primary); font-weight: 600; margin-left: 8px; }
.sp-slot-option__desc  { font-size: 0.78rem; color: var(--bw-text-muted); margin: 3px 0 0; }

/* ── Date row ── */
.sp-date-row { display: flex; gap: 12px; }
@media (max-width: 480px) { .sp-date-row { flex-direction: column; } }

/* ── Budget ── */
.sp-budget-wrap { display: flex; align-items: center; gap: 10px; }
.sp-budget-hint { font-size: 0.78rem; color: var(--bw-text-subtle); white-space: nowrap; }

/* ── AI tip ── */
.sp-ai-tip {
  display: flex; gap: 10px; align-items: flex-start;
  background: rgba(74,127,212,.07);
  border: 1px solid rgba(74,127,212,.2);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.82rem;
  color: var(--bw-text);
}
.sp-ai-chip {
  background: var(--bw-info, #4A7FD4); color: #fff;
  font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;
  white-space: nowrap; flex-shrink: 0;
}

/* ── Summary ── */
.sp-summary {
  background: var(--bw-surface-2);
  border: 1px solid var(--bw-border);
  border-radius: 10px;
  padding: 14px;
}
.sp-summary__title { font-family: var(--f-ui); font-size: 0.85rem; font-weight: 700; margin: 0 0 10px; color: var(--bw-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.sp-summary__row {
  display: flex; justify-content: space-between; gap: 12px;
  font-size: 0.85rem; padding: 6px 0;
  border-bottom: 1px solid var(--bw-border);
  color: var(--bw-text-muted);
}
.sp-summary__row:last-child { border-bottom: none; }
.sp-summary__row strong { color: var(--bw-text); }

/* ── Error ── */
.sp-error { font-size: 0.82rem; color: var(--bw-danger, #EF4444); padding: 8px 12px; background: rgba(239,68,68,.08); border-radius: 8px; }

/* ── Toast ── */
.sp-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9000;
  background: var(--bw-surface); border: 1.5px solid #bbf7d0; color: #047857;
  padding: 12px 20px; border-radius: 10px;
  font-size: 0.88rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.sp-toast-enter-active, .sp-toast-leave-active { transition: all .3s ease; }
.sp-toast-enter-from, .sp-toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>
