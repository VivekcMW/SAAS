<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Profile</h1>
        <p class="bw-head__sub">Manage your personal details, preferences, and notifications.</p>
      </div>
    </header>

    <nav class="bw-tabs">
      <button v-for="t in tabs" :key="t.id" class="bw-tab" :class="{ 'is-active': tab === t.id }" @click="tab = t.id">{{ t.label }}</button>
    </nav>

    <!-- Personal -->
    <section v-if="tab === 'personal'" class="bw-card">
      <div class="bw-grid bw-grid--2">
        <div>
          <label class="bw-label" for="bp-firstName">First name</label>
          <input id="bp-firstName" v-model="form.firstName" class="bw-input" />
        </div>
        <div>
          <label class="bw-label" for="bp-lastName">Last name</label>
          <input id="bp-lastName" v-model="form.lastName" class="bw-input" />
        </div>
        <div>
          <label class="bw-label" for="bp-email">Email</label>
          <input id="bp-email" v-model="form.email" type="email" class="bw-input" disabled style="opacity:0.6; cursor:not-allowed;" title="Email cannot be changed here" />
        </div>
        <div>
          <label class="bw-label" for="bp-jobTitle">Job title</label>
          <input id="bp-jobTitle" v-model="form.jobTitle" class="bw-input" placeholder="e.g. Head of Ops" />
        </div>
        <div>
          <label class="bw-label" for="bp-company">Company</label>
          <input id="bp-company" v-model="form.company" class="bw-input" />
        </div>
        <div>
          <label class="bw-label" for="bp-companySize">Company size</label>
          <select id="bp-companySize" v-model="form.companySize" class="bw-select">
            <option>1–10</option><option>11–50</option><option>51–200</option><option>201–1000</option><option>1000+</option>
          </select>
        </div>
      </div>
      <hr class="bw-divider" />
      <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span v-if="saveSuccess" style="font-size:0.85rem; color: var(--bw-success);">Changes saved.</span>
        <span v-if="saveError" style="font-size:0.85rem; color: var(--bw-danger, #e53e3e);">{{ saveError }}</span>
        <button class="bw-btn bw-btn--primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save changes' }}</button>
      </div>
    </section>

    <!-- Preferences -->
    <section v-if="tab === 'preferences'" class="bw-card">
      <div class="bw-grid bw-grid--3">
        <div>
          <label class="bw-label" for="bp-language">Language</label>
          <select id="bp-language" v-model="form.language" class="bw-select">
            <option>English</option><option>Deutsch</option><option>Español</option><option>Français</option>
          </select>
        </div>
        <div>
          <label class="bw-label" for="bp-timezone">Timezone</label>
          <select id="bp-timezone" v-model="form.timezone" class="bw-select">
            <option>UTC</option><option>America/New_York</option><option>Europe/London</option><option>Asia/Tokyo</option>
          </select>
        </div>
        <div>
          <label class="bw-label" for="bp-currency">Currency</label>
          <select id="bp-currency" v-model="form.currency" class="bw-select">
            <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
          </select>
        </div>
      </div>
      <hr class="bw-divider" />
      <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px;">
        <span v-if="saveSuccess" style="font-size:0.85rem; color: var(--bw-success);">Preferences saved.</span>
        <span v-if="saveError" style="font-size:0.85rem; color: var(--bw-danger, #e53e3e);">{{ saveError }}</span>
        <button class="bw-btn bw-btn--primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save preferences' }}</button>
      </div>
    </section>

    <!-- Notifications -->
    <section v-if="tab === 'notifications'" class="bw-card">
      <div v-for="n in notifs" :key="n.key" class="notif-row">
        <div>
          <div class="notif-row__title">{{ n.title }}</div>
          <div class="notif-row__desc">{{ n.desc }}</div>
        </div>
        <label class="switch" :aria-label="n.title">
          <input type="checkbox" v-model="form.notifications[n.key]" :aria-label="n.title" />
          <span class="switch__slider"></span>
        </label>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { currentUser } = useAuth()
const route = useRoute()

const tabs = [
  { id: 'personal', label: 'Personal' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'notifications', label: 'Notifications' }
] as const

// Sync tab with ?tab= query parameter so external links work (e.g. ?tab=notifications)
const validTabs = ['personal', 'preferences', 'notifications'] as const
type TabId = typeof validTabs[number]
const initialTab = validTabs.includes(route.query.tab as TabId) ? (route.query.tab as TabId) : 'personal'
const tab = ref<TabId>(initialTab)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  jobTitle: '',
  company: '',
  companySize: '51–200',
  language: 'English',
  timezone: 'UTC',
  currency: 'USD',
  notifications: {
    enquiryReplies: true,
    priceDrops: true,
    weeklyDigest: true,
    newDeals: false,
    productUpdates: true
  } as Record<string, boolean>
})

// Pre-fill from auth session once loaded
watch(currentUser, u => {
  if (!u) return
  form.firstName   = u.firstName || ''
  form.lastName    = u.lastName  || ''
  form.email       = u.email     || ''
  form.jobTitle    = (u as any).jobTitle    || ''
  form.company     = (u as any).company     || ''
  form.companySize = (u as any).companySize || '51–200'
  form.language    = (u as any).language    || 'English'
  form.timezone    = (u as any).timezone    || 'UTC'
  form.currency    = (u as any).currency    || 'USD'
  const prefs = (u as any).notificationPrefs
  if (prefs && typeof prefs === 'object') Object.assign(form.notifications, prefs)
}, { immediate: true })

const notifs = [
  { key: 'enquiryReplies', title: 'Vendor replies', desc: 'Email me when a vendor replies to one of my enquiries.' },
  { key: 'priceDrops', title: 'Price drops', desc: 'Alert me when any of my saved apps change pricing.' },
  { key: 'weeklyDigest', title: 'Weekly digest', desc: 'A Monday email with what\'s new across my saved apps.' },
  { key: 'newDeals', title: 'New deals', desc: 'Notify me when exclusive deals land in my categories.' },
  { key: 'productUpdates', title: 'Product updates', desc: 'Feature releases and changelog from saved apps.' }
]

const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

async function save() {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
  try {
    await $fetch('/api/user/me', {
      method: 'PATCH',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        jobTitle: form.jobTitle,
        company: form.company,
        companySize: form.companySize,
        language: form.language,
        timezone: form.timezone,
        currency: form.currency,
        notifications: form.notifications,
      },
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.statusMessage || 'Could not save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.notif-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--bw-border); }
.notif-row:last-child { border-bottom: none; }
.notif-row__title { font-weight: 600; font-size: 0.92rem; color: var(--bw-text); }
.notif-row__desc { color: var(--bw-text-muted); font-size: 0.82rem; margin-top: 2px; max-width: 520px; }
.switch { position: relative; width: 42px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch__slider { position: absolute; inset: 0; background: var(--bw-border-strong); border-radius: 999px; cursor: pointer; transition: .2s; }
.switch__slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: .2s; }
.switch input:checked + .switch__slider { background: var(--bw-primary); }
.switch input:checked + .switch__slider::before { transform: translateX(18px); }
</style>
