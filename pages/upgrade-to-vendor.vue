<template>
  <div class="upv">
    <div class="upv-wrap">
      <!-- Back link -->
      <NuxtLink to="/dashboard/overview" class="upv-back">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to dashboard
      </NuxtLink>

      <header class="upv-head">
        <div class="upv-head__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1 class="upv-head__title">Become a vendor on Moonmart</h1>
        <p class="upv-head__sub">Reach thousands of buyers actively comparing software in your category. Fill out the form below — our team reviews requests within 1–2 business days.</p>
      </header>

      <!-- Benefits strip -->
      <ul class="upv-benefits">
        <li v-for="b in benefits" :key="b.title" class="upv-benefit">
          <span class="upv-benefit__icon" aria-hidden="true" v-html="b.icon"/>
          <div>
            <strong class="upv-benefit__title">{{ b.title }}</strong>
            <span class="upv-benefit__desc">{{ b.desc }}</span>
          </div>
        </li>
      </ul>

      <!-- Success state -->
      <div v-if="submitted" class="upv-success">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="upv-success__icon">
          <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
        </svg>
        <h2 class="upv-success__title">Request submitted!</h2>
        <p class="upv-success__desc">We'll review your application and email you at <strong>{{ currentUser?.email }}</strong> within 1–2 business days.</p>
        <NuxtLink to="/dashboard/overview" class="upv-btn upv-btn--primary">Return to dashboard</NuxtLink>
      </div>

      <!-- Already a vendor -->
      <div v-else-if="alreadyVendor" class="upv-success">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="upv-success__icon upv-success__icon--info">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2 class="upv-success__title">You're already a vendor</h2>
        <p class="upv-success__desc">Your account has vendor access. Head to your vendor dashboard to manage your listings.</p>
        <NuxtLink to="/dashboard/overview" class="upv-btn upv-btn--primary">Go to vendor dashboard</NuxtLink>
      </div>

      <!-- Pending state -->
      <div v-else-if="pendingRequest" class="upv-pending">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <div>
          <strong>Request pending review</strong>
          <span>We received your application and will email you once it's reviewed.</span>
        </div>
      </div>

      <!-- Form -->
      <form v-else class="upv-form" @submit.prevent="submit">
        <div class="upv-field">
          <label for="upv-company" class="upv-label">Company / product name <span aria-hidden="true">*</span></label>
          <input
            id="upv-company"
            v-model="form.companyName"
            type="text"
            class="upv-input"
            placeholder="Acme Inc."
            required
            maxlength="120"
          >
        </div>

        <div class="upv-field">
          <label for="upv-website" class="upv-label">Product website</label>
          <input
            id="upv-website"
            v-model="form.websiteUrl"
            type="url"
            class="upv-input"
            placeholder="https://yourproduct.com"
            maxlength="300"
          >
        </div>

        <div class="upv-field">
          <label for="upv-reason" class="upv-label">Tell us about your product</label>
          <textarea
            id="upv-reason"
            v-model="form.reason"
            class="upv-input upv-textarea"
            placeholder="What does your product do? Who is it for? What makes it stand out?"
            rows="4"
            maxlength="1000"
          />
          <span class="upv-hint">{{ form.reason.length }}/1000</span>
        </div>

        <p v-if="error" class="upv-error" role="alert">{{ error }}</p>

        <button type="submit" class="upv-btn upv-btn--primary" :disabled="loading">
          <span v-if="loading" class="upv-btn__spinner" aria-hidden="true"/>
          {{ loading ? 'Submitting…' : 'Submit vendor request' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { currentUser } = useAuth()
const router = useRouter()

useHead({ title: 'Become a Vendor · Moonmart' })

const alreadyVendor = computed(() => currentUser.value?.role === 'vendor' || currentUser.value?.role === 'admin')
const pendingRequest = ref(false)
const submitted = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
  companyName: '',
  websiteUrl: '',
  reason: '',
})

const benefits = [
  {
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    title: 'Reach active buyers',
    desc: 'Thousands of professionals comparing software in your category every month.',
  },
  {
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    title: 'Qualified leads',
    desc: 'Pay only for leads you accept — no upfront commitment.',
  },
  {
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    title: 'Vendor dashboard',
    desc: 'Analytics, review management, lead pipeline, and AI-powered listing tools.',
  },
  {
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    title: 'Trust & credibility',
    desc: 'Verified listing badges, review replies, and category rankings.',
  },
]

onMounted(async () => {
  if (!currentUser.value) {
    router.replace('/login?next=/upgrade-to-vendor')
    return
  }
  if (alreadyVendor.value) return

  // Check if there's already a pending request
  try {
    const _res = await $fetch<{ requests: { status: string }[] }>('/api/admin/vendor-requests', {
      params: { status: 'all' },
    }).catch(() => null)
    // Only accessible to admins — regular buyers can't read this.
    // Instead call a user-scoped endpoint
    const meRes = await $fetch<{ status: string | null }>('/api/user/vendor-request-status').catch(() => null)
    if (meRes?.status === 'pending') pendingRequest.value = true
  } catch {
    // ignore
  }
})

async function submit() {
  error.value = ''
  if (!form.companyName.trim()) { error.value = 'Company name is required.'; return }

  loading.value = true
  try {
    await $fetch('/api/user/request-vendor', {
      method: 'POST',
      body: {
        companyName: form.companyName.trim(),
        websiteUrl: form.websiteUrl.trim() || undefined,
        reason: form.reason.trim() || undefined,
      },
    })
    submitted.value = true
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.message || 'Submission failed. Please try again.'
    if (msg.includes('pending')) { pendingRequest.value = true } else { error.value = msg }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.upv { min-height: 100vh; background: var(--mm-surface, #f8fafc); padding: 2.5rem 1rem 4rem; }
.upv-wrap { max-width: 640px; margin: 0 auto; }
.upv-back { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--mm-text-muted, #64748b); text-decoration: none; margin-bottom: 1.75rem; }
.upv-back:hover { color: var(--mm-pearl, #0f172a); }

.upv-head { text-align: center; margin-bottom: 2rem; }
.upv-head__icon { width: 60px; height: 60px; border-radius: 16px; background: var(--mm-brand-50, #eff6ff); color: var(--mm-brand, #2563eb); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
.upv-head__title { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.6rem; color: var(--mm-pearl, #0f172a); line-height: 1.2; }
.upv-head__sub { font-size: 0.95rem; color: var(--mm-text-muted, #64748b); margin: 0; line-height: 1.55; }

.upv-benefits { list-style: none; padding: 0; margin: 0 0 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.upv-benefit { display: flex; align-items: flex-start; gap: 0.7rem; background: #fff; border: 1px solid var(--mm-border, #e2e8f0); border-radius: 10px; padding: 0.9rem 1rem; }
.upv-benefit__icon { width: 32px; height: 32px; flex-shrink: 0; background: var(--mm-brand-50, #eff6ff); color: var(--mm-brand, #2563eb); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.upv-benefit__title { display: block; font-size: 0.82rem; font-weight: 600; color: var(--mm-pearl, #0f172a); }
.upv-benefit__desc { display: block; font-size: 0.78rem; color: var(--mm-text-muted, #64748b); line-height: 1.35; margin-top: 2px; }
@media (max-width: 480px) { .upv-benefits { grid-template-columns: 1fr; } }

.upv-form { background: #fff; border: 1px solid var(--mm-border, #e2e8f0); border-radius: 14px; padding: 1.75rem; }
.upv-field { margin-bottom: 1.25rem; }
.upv-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--mm-pearl, #0f172a); margin-bottom: 0.4rem; }
.upv-input { width: 100%; padding: 0.55rem 0.75rem; border: 1.5px solid var(--mm-border, #e2e8f0); border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
.upv-input:focus { border-color: var(--mm-brand, #2563eb); }
.upv-textarea { resize: vertical; min-height: 90px; }
.upv-hint { display: block; font-size: 0.75rem; color: var(--mm-text-muted, #64748b); text-align: right; margin-top: 3px; }
.upv-error { color: #dc2626; font-size: 0.85rem; margin: 0 0 1rem; }

.upv-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem 1.5rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; border: none; text-decoration: none; }
.upv-btn--primary { background: var(--mm-brand, #2563eb); color: #fff; width: 100%; }
.upv-btn--primary:hover:not(:disabled) { background: var(--mm-brand-700, #1d4ed8); }
.upv-btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
.upv-btn__spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.upv-success { background: #fff; border: 1px solid var(--mm-border, #e2e8f0); border-radius: 14px; padding: 2.5rem 2rem; text-align: center; }
.upv-success__icon { color: #16a34a; margin: 0 auto 1rem; display: block; }
.upv-success__icon--info { color: var(--mm-brand, #2563eb); }
.upv-success__title { font-size: 1.2rem; font-weight: 700; margin: 0 0 0.5rem; }
.upv-success__desc { font-size: 0.9rem; color: var(--mm-text-muted, #64748b); margin: 0 0 1.5rem; line-height: 1.5; }

.upv-pending { display: flex; align-items: flex-start; gap: 0.75rem; background: #fefce8; border: 1px solid #fde047; border-radius: 10px; padding: 1rem 1.25rem; font-size: 0.88rem; color: #713f12; margin-bottom: 1.5rem; }
.upv-pending strong { display: block; font-weight: 600; margin-bottom: 2px; }
</style>
