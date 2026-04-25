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
          <label class="bw-label">First name</label>
          <input v-model="form.firstName" class="bw-input" />
        </div>
        <div>
          <label class="bw-label">Last name</label>
          <input v-model="form.lastName" class="bw-input" />
        </div>
        <div>
          <label class="bw-label">Email</label>
          <input v-model="form.email" type="email" class="bw-input" />
        </div>
        <div>
          <label class="bw-label">Job title</label>
          <input v-model="form.jobTitle" class="bw-input" placeholder="e.g. Head of Ops" />
        </div>
        <div>
          <label class="bw-label">Company</label>
          <input v-model="form.company" class="bw-input" />
        </div>
        <div>
          <label class="bw-label">Company size</label>
          <select v-model="form.companySize" class="bw-select">
            <option>1–10</option><option>11–50</option><option>51–200</option><option>201–1000</option><option>1000+</option>
          </select>
        </div>
      </div>
      <hr class="bw-divider" />
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button class="bw-btn bw-btn--ghost">Cancel</button>
        <button class="bw-btn bw-btn--primary" @click="save">Save changes</button>
      </div>
    </section>

    <!-- Preferences -->
    <section v-if="tab === 'preferences'" class="bw-card">
      <div class="bw-grid bw-grid--3">
        <div>
          <label class="bw-label">Language</label>
          <select v-model="form.language" class="bw-select">
            <option>English</option><option>Deutsch</option><option>Español</option><option>Français</option>
          </select>
        </div>
        <div>
          <label class="bw-label">Timezone</label>
          <select v-model="form.timezone" class="bw-select">
            <option>UTC</option><option>America/New_York</option><option>Europe/London</option><option>Asia/Tokyo</option>
          </select>
        </div>
        <div>
          <label class="bw-label">Currency</label>
          <select v-model="form.currency" class="bw-select">
            <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Notifications -->
    <section v-if="tab === 'notifications'" class="bw-card">
      <div v-for="n in notifs" :key="n.key" class="notif-row">
        <div>
          <div class="notif-row__title">{{ n.title }}</div>
          <div class="notif-row__desc">{{ n.desc }}</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="form.notifications[n.key]" />
          <span class="switch__slider"></span>
        </label>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const tabs = [
  { id: 'personal', label: 'Personal' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'notifications', label: 'Notifications' }
] as const
const tab = ref<typeof tabs[number]['id']>('personal')

const form = reactive({
  firstName: 'Demo',
  lastName: 'Buyer',
  email: 'buyer@moonmart.ai',
  jobTitle: 'Head of Operations',
  company: 'Acme Corp',
  companySize: '51–200',
  language: 'English',
  timezone: 'Europe/London',
  currency: 'USD',
  notifications: {
    enquiryReplies: true,
    priceDrops: true,
    weeklyDigest: true,
    newDeals: false,
    productUpdates: true
  } as Record<string, boolean>
})

const notifs = [
  { key: 'enquiryReplies', title: 'Vendor replies', desc: 'Email me when a vendor replies to one of my enquiries.' },
  { key: 'priceDrops', title: 'Price drops', desc: 'Alert me when any of my saved apps change pricing.' },
  { key: 'weeklyDigest', title: 'Weekly digest', desc: 'A Monday email with what\'s new across my saved apps.' },
  { key: 'newDeals', title: 'New deals', desc: 'Notify me when exclusive deals land in my categories.' },
  { key: 'productUpdates', title: 'Product updates', desc: 'Feature releases and changelog from saved apps.' }
]

const save = () => {
  // no-op
  alert('Profile saved')
}
</script>

<style scoped>
.notif-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--bw-border); }
.notif-row:last-child { border-bottom: none; }
.notif-row__title { font-weight: 600; font-size: 0.92rem; }
.notif-row__desc { color: var(--bw-text-muted); font-size: 0.82rem; margin-top: 2px; max-width: 520px; }
.switch { position: relative; width: 42px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch__slider { position: absolute; inset: 0; background: var(--bw-border-strong); border-radius: 999px; cursor: pointer; transition: .2s; }
.switch__slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: .2s; }
.switch input:checked + .switch__slider { background: var(--bw-primary); }
.switch input:checked + .switch__slider::before { transform: translateX(18px); }
</style>
