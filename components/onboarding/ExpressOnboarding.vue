<template>
  <div class="express-onboarding">
    <!-- Step 1: URL paste -->
    <div v-if="phase === 'paste'" class="step paste-step">
      <button v-if="canGoBack" class="back-link" type="button" @click="$emit('go-back')">
        <Icon name="heroicons:arrow-left" /> Back to options
      </button>

      <header class="step-header">
        <span class="badge">Express · 60 seconds</span>
        <h2 class="step-title">Paste your product URL</h2>
        <p class="step-sub">We'll auto-fill your listing from your website. You can edit anything before publishing.</p>
      </header>

      <form class="url-form" @submit.prevent="runScrape">
        <div class="url-row">
          <Icon name="heroicons:globe-alt" class="url-icon" />
          <input
            ref="urlInputRef"
            v-model.trim="rawUrl"
            type="url"
            class="url-input"
            placeholder="https://yourapp.com"
            autocomplete="url"
            spellcheck="false"
            aria-label="Product website URL"
            :disabled="loading"
            required
          >
          <button type="submit" class="primary-btn" :disabled="loading || !rawUrl">
            <Icon v-if="loading" name="heroicons:arrow-path" class="spin" />
            <span v-if="!loading">Continue</span>
            <span v-else>Reading site…</span>
          </button>
        </div>
        <p v-if="errorMsg" class="form-error">
          <Icon name="heroicons:exclamation-circle" /> {{ errorMsg }}
        </p>
        <p class="form-hint">
          <Icon name="heroicons:lock-closed" /> We only read public metadata (title, description, logo).
        </p>
      </form>

      <div class="trust-row">
        <div class="trust-item"><Icon name="heroicons:bolt" /> No account required</div>
        <div class="trust-item"><Icon name="heroicons:document-text" /> Publish or save as draft</div>
        <div class="trust-item"><Icon name="heroicons:pencil-square" /> Edit anytime</div>
      </div>
    </div>

    <!-- Step 2: Review & publish -->
    <div v-else-if="phase === 'review'" class="step review-step">
      <header class="step-header">
        <span class="badge ok"><Icon name="heroicons:check-circle" /> Found it — review and publish</span>
        <h2 class="step-title">{{ form.name }}</h2>
        <p class="step-sub">{{ form.url }}</p>
      </header>

      <div v-if="scrapeNotice" class="notice">
        <Icon name="heroicons:information-circle" /> {{ scrapeNotice }}
      </div>

      <div class="review-grid">
        <!-- Logo + name + tagline -->
        <div class="review-card">
          <div class="logo-row">
            <div class="logo-wrap">
              <img v-if="form.logo" :src="form.logo" :alt="form.name" @error="onLogoError">
              <div v-else class="logo-fallback">{{ initial }}</div>
            </div>
            <div class="logo-meta">
              <label for="ex-name" class="micro">Display name</label>
              <input id="ex-name" v-model="form.name" class="text-input" maxlength="80">
              <label for="ex-provider" class="micro">By</label>
              <input id="ex-provider" v-model="form.provider" class="text-input subtle" placeholder="Your company name">
            </div>
          </div>

          <label for="ex-tagline" class="micro">One-line tagline</label>
          <textarea
            id="ex-tagline"
            v-model="form.tagline"
            class="text-input"
            rows="2"
            maxlength="200"
            placeholder="What does your product do?"
          />
          <div class="char-count">{{ form.tagline.length }}/200</div>
        </div>

        <!-- Category + pricing -->
        <div class="review-card">
          <span class="micro">Categories <span class="muted">(pick one or more)</span></span>
          <fieldset class="pricing-row fieldset-reset">
            <legend class="sr-only">Categories</legend>
            <button
              v-for="c in categories"
              :key="c.value"
              type="button"
              class="price-pill"
              :class="{ active: form.categories.includes(c.value) }"
              @click="toggleCategory(c.value)"
            >
              {{ c.label }}
            </button>
          </fieldset>

          <span class="micro pricing-label">Pricing model</span>
          <div class="pricing-row" role="radiogroup" aria-label="Pricing model">
            <button
              v-for="p in pricingOptions"
              :key="p.value"
              type="button"
              class="price-pill"
              :class="{ active: form.pricingType === p.value }"
              @click="form.pricingType = p.value"
            >
              {{ p.label }}
            </button>
          </div>

          <div v-if="form.pricingType === 'paid'" class="price-input-row">
            <span class="price-prefix">$</span>
            <input id="ex-price" v-model.number="form.pricingValue" type="number" min="0" class="text-input price-input" aria-label="Starting monthly price">
            <span class="price-suffix">/month (starting)</span>
          </div>

          <div v-if="form.pricingType === 'contact'" class="contact-row">
            <label for="ex-contact-email" class="micro">Sales contact email</label>
            <input
              id="ex-contact-email"
              v-model.trim="form.contactEmail"
              type="email"
              class="text-input"
              placeholder="sales@yourcompany.com"
              autocomplete="email"
            >
            <p v-if="contactEmailInvalid" class="form-error">
              <Icon name="heroicons:exclamation-circle" /> Enter a valid email so buyers can reach you.
            </p>
          </div>
        </div>

        <!-- Tags / keywords -->
        <div class="review-card span-2">
          <span class="micro">Tags <span class="muted">(tap to remove, or add your own)</span></span>
          <div class="tag-row">
            <button
              v-for="(tag, idx) in form.keywords"
              :key="tag"
              type="button"
              class="tag-pill"
              @click="form.keywords.splice(idx, 1)"
            >
              {{ tag }} <Icon name="heroicons:x-mark" />
            </button>
            <input
              v-model.trim="tagDraft"
              type="text"
              class="tag-input"
              placeholder="Add a tag and press Enter"
              maxlength="32"
              @keydown.enter.prevent="addTag"
              @keydown="onTagKey"
              @blur="addTag"
            >
          </div>
        </div>
      </div>

      <p v-if="publishError" class="form-error span-2">
        <Icon name="heroicons:exclamation-circle" /> {{ publishError }}
      </p>

      <div class="review-actions">
        <button type="button" class="ghost-btn" :disabled="publishing" @click="phase = 'paste'">
          <Icon name="heroicons:arrow-left" /> Edit URL
        </button>
        <button type="button" class="ghost-btn" :disabled="publishing" @click="submitListing(false)">
          Save as draft
        </button>
        <button type="button" class="primary-btn big" :disabled="publishing || !canPublish" @click="submitListing(true)">
          <Icon v-if="publishing" name="heroicons:arrow-path" class="spin" />
          <span v-if="!publishing">Publish listing</span>
          <span v-else>Publishing…</span>
        </button>
      </div>
    </div>

    <!-- Step 3: Success -->
    <div v-else-if="phase === 'done'" class="step done-step">
      <div class="done-card">
        <div class="check-circle">
          <Icon name="heroicons:check" />
        </div>
        <h2 class="done-title">{{ publishedAsDraft ? 'Saved as draft' : 'Listing published' }}</h2>
        <p class="done-sub">
          <span v-if="publishedAsDraft">Your listing is saved. Publish anytime from your dashboard.</span>
          <span v-else>{{ form.name }} is now live on the SaaSWorld marketplace.</span>
        </p>

        <div class="done-actions">
          <NuxtLink v-if="!publishedAsDraft && publishedUrl" :to="publishedUrl" class="primary-btn big">
            <Icon name="heroicons:eye" /> View listing
          </NuxtLink>
          <button type="button" class="ghost-btn" @click="resetFlow">
            <Icon name="heroicons:plus" /> List another
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, defineEmits } from 'vue'

defineEmits(['go-back'])

defineProps({
  canGoBack: { type: Boolean, default: true }
})

interface ScrapeResponse {
  ok: boolean
  url: string
  domain: string
  name?: string
  tagline?: string
  description?: string
  logo?: string
  screenshot?: string
  category?: string
  pricingType?: 'free' | 'freemium' | 'paid' | 'contact'
  detectedKeywords?: string[]
  error?: string
}

const phase = ref<'paste' | 'review' | 'done'>('paste')
const rawUrl = ref('')
const loading = ref(false)
const errorMsg = ref('')
const scrapeNotice = ref('')

const publishing = ref(false)
const publishError = ref('')
const publishedAsDraft = ref(false)
const publishedUrl = ref('')

const urlInputRef = ref<HTMLInputElement | null>(null)

const form = ref({
  url: '',
  name: '',
  provider: '',
  tagline: '',
  categories: [] as string[],
  pricingType: 'freemium' as 'free' | 'freemium' | 'paid' | 'contact',
  pricingValue: null as number | null,
  contactEmail: '',
  logo: '',
  keywords: [] as string[]
})

const tagDraft = ref('')

const categories = [
  { value: 'crm', label: 'CRM' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Customer Support' },
  { value: 'payments', label: 'Payments' },
  { value: 'developer', label: 'Developer Tools' },
  { value: 'design', label: 'Design' },
  { value: 'integration', label: 'Integrations' },
  { value: 'hr', label: 'HR & People' },
  { value: 'ai', label: 'AI & ML' },
  { value: 'other', label: 'Other' }
]

const pricingOptions = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'contact', label: 'Contact us' }
] as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initial = computed(() => (form.value.name || '?').charAt(0).toUpperCase())
const contactEmailInvalid = computed(() =>
  form.value.pricingType === 'contact'
  && form.value.contactEmail.length > 0
  && !EMAIL_RE.test(form.value.contactEmail)
)
const canPublish = computed(() => {
  if (form.value.name.trim().length <= 1) return false
  if (form.value.tagline.trim().length <= 5) return false
  if (form.value.categories.length === 0) return false
  if (form.value.pricingType === 'contact' && !EMAIL_RE.test(form.value.contactEmail)) return false
  return true
})

const toggleCategory = (value: string) => {
  const i = form.value.categories.indexOf(value)
  if (i === -1) form.value.categories.push(value)
  else form.value.categories.splice(i, 1)
}

const addTag = () => {
  const raw = tagDraft.value.trim().toLowerCase().replaceAll(/[^a-z0-9 -]/g, '')
  if (!raw) { tagDraft.value = ''; return }
  if (!form.value.keywords.includes(raw) && form.value.keywords.length < 12) {
    form.value.keywords.push(raw)
  }
  tagDraft.value = ''
}

const onTagKey = (e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !tagDraft.value && form.value.keywords.length) {
    form.value.keywords.pop()
  } else if (e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

onMounted(() => {
  nextTick(() => urlInputRef.value?.focus())
})

const onLogoError = () => {
  form.value.logo = ''
}

const runScrape = async () => {
  errorMsg.value = ''
  scrapeNotice.value = ''
  if (!rawUrl.value) return

  loading.value = true
  try {
    const data = await $fetch<ScrapeResponse>('/api/listings/scrape', {
      method: 'POST',
      body: { url: rawUrl.value }
    })

    if (!data.ok) {
      errorMsg.value = data.error || 'Could not read that URL.'
      return
    }

    form.value.url = data.url
    form.value.name = data.name || ''
    form.value.provider = data.name || data.domain
    form.value.tagline = data.tagline || ''
    form.value.categories = data.category ? [data.category] : ['other']
    form.value.pricingType = data.pricingType || 'freemium'
    form.value.contactEmail = ''
    form.value.logo = data.logo || ''
    form.value.keywords = data.detectedKeywords || []

    if (data.error) scrapeNotice.value = data.error
    phase.value = 'review'
  } catch (err) {
    errorMsg.value = (err as Error).message || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

const submitListing = async (publish: boolean) => {
  publishError.value = ''
  if (publish && !canPublish.value) {
    if (form.value.pricingType === 'contact' && !EMAIL_RE.test(form.value.contactEmail)) {
      publishError.value = 'Add a valid sales contact email so buyers can reach you.'
    } else {
      publishError.value = 'Add a name, a tagline (min 5 chars), and pick at least one category.'
    }
    return
  }

  publishing.value = true
  try {
    const data = await $fetch<{ ok: boolean; url: string; status: string }>('/api/listings/express', {
      method: 'POST',
      body: {
        url: form.value.url,
        name: form.value.name,
        provider: form.value.provider,
        tagline: form.value.tagline,
        categories: form.value.categories,
        category: form.value.categories[0],
        pricingType: form.value.pricingType,
        pricingValue: form.value.pricingValue,
        contactEmail: form.value.pricingType === 'contact' ? form.value.contactEmail : undefined,
        logo: form.value.logo,
        keywords: form.value.keywords,
        publish
      }
    })

    publishedAsDraft.value = data.status !== 'published'
    publishedUrl.value = data.url
    phase.value = 'done'
  } catch (err) {
    publishError.value = (err as Error).message || 'Could not save listing.'
  } finally {
    publishing.value = false
  }
}

const resetFlow = () => {
  rawUrl.value = ''
  publishedUrl.value = ''
  publishedAsDraft.value = false
  errorMsg.value = ''
  scrapeNotice.value = ''
  publishError.value = ''
  form.value = {
    url: '',
    name: '',
    provider: '',
    tagline: '',
    categories: [],
    pricingType: 'freemium',
    pricingValue: null,
    contactEmail: '',
    logo: '',
    keywords: []
  }
  tagDraft.value = ''
  phase.value = 'paste'
  nextTick(() => urlInputRef.value?.focus())
}
</script>

<style scoped>
.express-onboarding {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 0 60px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 0;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 16px;
  padding: 0;
}
.back-link:hover { color: #ff8838; }

.step-header { text-align: center; margin-bottom: 24px; }
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff3e6;
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 999px;
  border: 0.5px solid #fde68a;
}
.badge.ok { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.step-title { margin: 12px 0 4px; font-size: 28px; font-weight: 700; color: #111827; }
.step-sub { margin: 0; font-size: 14px; color: #6b7280; }

/* Paste step */
.url-form {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  margin-top: 8px;
}
.url-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  border: 0.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 4px 4px 4px 12px;
  transition: border-color 150ms ease;
}
.url-row:focus-within { border-color: #ff8838; background: #ffffff; }
.url-icon { width: 18px; height: 18px; color: #9ca3af; flex-shrink: 0; }
.url-input {
  flex: 1;
  border: 0;
  background: transparent;
  font-size: 15px;
  padding: 10px 4px;
  outline: 0;
  color: #111827;
}
.form-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 12px 0 0;
  font-size: 12px;
  color: #6b7280;
}
.form-hint :deep(svg) { width: 12px; height: 12px; }
.form-error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 10px 0 0;
  font-size: 13px;
  color: #b91c1c;
}
.form-error :deep(svg) { width: 14px; height: 14px; }

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ff8838;
  color: #ffffff;
  border: 0;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease;
}
.primary-btn:hover:not(:disabled) { background: #e57320; }
.primary-btn:disabled { background: #d1d5db; cursor: not-allowed; }
.primary-btn.big { padding: 12px 20px; font-size: 15px; }
.primary-btn :deep(svg) { width: 16px; height: 16px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.trust-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}
.trust-item :deep(svg) { width: 14px; height: 14px; color: #ff8838; }

/* Review step */
.notice {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fffbeb;
  color: #92400e;
  border: 0.5px solid #fde68a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 16px;
}
.notice :deep(svg) { width: 14px; height: 14px; }

.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.review-card {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.review-card.span-2 { grid-column: span 2; }

.logo-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 4px;
}
.logo-wrap {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-wrap img { width: 100%; height: 100%; object-fit: cover; }
.logo-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff8838;
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
}
.logo-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }

.micro {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 4px;
}
.text-input {
  width: 100%;
  background: #f9fafb;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  color: #111827;
  font-family: inherit;
  transition: border-color 150ms ease, background 150ms ease;
}
.text-input:focus { outline: 0; border-color: #ff8838; background: #ffffff; }
.text-input.subtle { font-size: 13px; color: #4b5563; }
textarea.text-input { resize: vertical; line-height: 1.4; }
.char-count { font-size: 11px; color: #9ca3af; text-align: right; margin-top: 2px; }

.pricing-label { margin-top: 12px; }
.pricing-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.price-pill {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  transition: all 150ms ease;
}
.price-pill:hover { border-color: #ff8838; color: #ff8838; }
.price-pill.active { background: #fff3e6; border-color: #ff8838; color: #b45309; font-weight: 600; }

.price-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}
.price-prefix, .price-suffix { font-size: 13px; color: #6b7280; }
.price-input { max-width: 90px; }

.tag-row { display: flex; gap: 6px; flex-wrap: wrap; }
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f3f4f6;
  color: #374151;
  border: 0;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background 150ms ease;
}
.tag-pill:hover { background: #fee2e2; color: #b91c1c; }
.tag-pill :deep(svg) { width: 10px; height: 10px; }
.tag-input {
  flex: 1;
  min-width: 160px;
  background: #ffffff;
  border: 0.5px dashed #e5e7eb;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  color: #111827;
  outline: 0;
  transition: border-color 150ms ease;
}
.tag-input:focus { border-color: #ff8838; border-style: solid; }
.muted { color: #9ca3af; font-weight: 400; text-transform: none; letter-spacing: 0; }

.contact-row { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }
.contact-row .form-error { margin: 4px 0 0; }

.fieldset-reset {
  border: 0;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.review-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  color: #374151;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}
.ghost-btn:hover:not(:disabled) { border-color: #ff8838; color: #ff8838; }
.ghost-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ghost-btn :deep(svg) { width: 14px; height: 14px; }

/* Done step */
.done-step { padding-top: 40px; }
.done-card {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
}
.check-circle {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.check-circle :deep(svg) { width: 32px; height: 32px; }
.done-title { margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827; }
.done-sub { margin: 0 0 24px; color: #6b7280; }
.done-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }

@media (max-width: 720px) {
  .review-grid { grid-template-columns: 1fr; }
  .review-card.span-2 { grid-column: auto; }
  .url-row { flex-wrap: wrap; }
  .url-input { min-width: 200px; }
}
</style>
