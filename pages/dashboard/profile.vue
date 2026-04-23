<template>
  <div class="profile-page">
    <header class="page-header">
      <div>
        <h1>Profile Management</h1>
        <p>Manage your personal information and account preferences</p>
      </div>
      <div class="header-actions">
        <button v-if="!isEditing" type="button" class="btn btn-primary" @click="startEdit">
          <UIcon dynamic name="i-heroicons-pencil-square" /> Edit profile
        </button>
        <template v-else>
          <button type="button" class="btn btn-ghost" :disabled="isSaving" @click="cancelEdit">Cancel</button>
          <button type="button" class="btn btn-primary" :disabled="isSaving" @click="saveProfile">
            <UIcon v-if="isSaving" dynamic name="i-heroicons-arrow-path" class="spin" />
            <span>{{ isSaving ? 'Saving…' : 'Save changes' }}</span>
          </button>
        </template>
      </div>
    </header>

    <div v-if="savedMessage" class="toast toast-success" role="status">
      <UIcon dynamic name="i-heroicons-check-circle" />
      <span>{{ savedMessage }}</span>
    </div>

    <div class="profile-grid">
      <!-- Profile Card -->
      <section class="card profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            <img :src="avatarUrl" :alt="displayName" />
          </div>
          <div class="profile-info">
            <h3>{{ displayName }}</h3>
            <p>{{ form.email }}</p>
            <div class="badges">
              <span class="plan-badge">{{ planLabel }}</span>
              <span class="role-badge" :class="`role-${currentUser?.role || 'buyer'}`">
                {{ roleLabel }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-body">
          <h4 class="section-title">Personal information</h4>
          <div class="form-grid">
            <div class="field">
              <label>First name</label>
              <input v-model="form.firstName" type="text" :disabled="!isEditing" />
            </div>
            <div class="field">
              <label>Last name</label>
              <input v-model="form.lastName" type="text" :disabled="!isEditing" />
            </div>
            <div class="field">
              <label>Email</label>
              <input v-model="form.email" type="email" disabled />
            </div>
            <div class="field">
              <label>Phone</label>
              <input v-model="form.phone" type="tel" :disabled="!isEditing" placeholder="+1 555 000 0000" />
            </div>
            <div class="field field-wide">
              <label>Job title</label>
              <input v-model="form.jobTitle" type="text" :disabled="!isEditing" placeholder="e.g. Product Manager" />
            </div>
            <div class="field">
              <label>Company</label>
              <input v-model="form.company" type="text" :disabled="!isEditing" />
            </div>
            <div class="field">
              <label>Company size</label>
              <select v-model="form.companySize" :disabled="!isEditing">
                <option value="">Select…</option>
                <option v-for="s in companySizes" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <h4 class="section-title">Preferences</h4>
          <div class="form-grid">
            <div class="field">
              <label>Language</label>
              <select v-model="form.language" :disabled="!isEditing">
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div class="field">
              <label>Timezone</label>
              <select v-model="form.timezone" :disabled="!isEditing">
                <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
              </select>
            </div>
          </div>

          <h4 class="section-title">Notifications</h4>
          <div class="toggle-list">
            <label class="toggle">
              <input v-model="form.notifyEmail" type="checkbox" :disabled="!isEditing" />
              <span>Email notifications</span>
            </label>
            <label class="toggle">
              <input v-model="form.notifyProduct" type="checkbox" :disabled="!isEditing" />
              <span>Product updates &amp; announcements</span>
            </label>
            <label class="toggle">
              <input v-model="form.notifyMarketing" type="checkbox" :disabled="!isEditing" />
              <span>Marketing &amp; tips</span>
            </label>
          </div>
        </div>
      </section>

      <!-- Stats sidebar -->
      <aside class="sidebar-column">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon stat-icon-blue">
              <UIcon dynamic name="i-heroicons-calendar" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.daysActive }}</span>
              <span class="stat-label">Days active</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-teal">
              <UIcon dynamic name="i-heroicons-squares-2x2" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.products }}</span>
              <span class="stat-label">Products</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-orange">
              <UIcon dynamic name="i-heroicons-star" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.rating.toFixed(1) }}</span>
              <span class="stat-label">Avg rating</span>
            </div>
          </div>
        </div>

        <div class="card danger-card">
          <h4 class="section-title">Security</h4>
          <button type="button" class="btn btn-outline" @click="changePassword">
            <UIcon dynamic name="i-heroicons-key" /> Change password
          </button>
          <button type="button" class="btn btn-outline danger" @click="confirmDelete">
            <UIcon dynamic name="i-heroicons-trash" /> Delete account
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'

useSeoMeta({
  title: 'Profile Management — SaaSWorld',
  description: 'Manage your personal information, preferences, and account settings.'
})

definePageMeta({ layout: false })

const { currentUser } = useAuth()

const isEditing = ref(false)
const isSaving = ref(false)
const savedMessage = ref('')

const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+']
const timezones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo']

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  company: '',
  companySize: '',
  language: 'en',
  timezone: 'UTC',
  notifyEmail: true,
  notifyProduct: true,
  notifyMarketing: false
})

let snapshot = { ...form }

const displayName = computed(() =>
  [form.firstName, form.lastName].filter(Boolean).join(' ') || currentUser.value?.fullName || 'Your account'
)

const avatarUrl = computed(() =>
  currentUser.value?.avatar ||
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName.value)}&backgroundColor=0073e6`
)

const planLabel = computed(() => {
  const plan = currentUser.value?.plan || 'free'
  return plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan'
})

const roleLabel = computed(() => {
  const role = currentUser.value?.role
  if (role === 'admin') return 'Admin'
  if (role === 'vendor') return 'Vendor'
  return 'Buyer'
})

const stats = reactive({
  daysActive: 245,
  products: 12,
  rating: 4.8
})

function hydrateFromUser() {
  const u = currentUser.value
  if (!u) return
  form.firstName = u.firstName || ''
  form.lastName = u.lastName || ''
  form.email = u.email || ''
  form.phone = u.phoneNumber || ''
  form.jobTitle = u.jobTitle || ''
  form.company = u.companyName || ''
  form.companySize = u.companySize || ''
  snapshot = { ...form }
}

onMounted(hydrateFromUser)
watch(currentUser, hydrateFromUser)

function startEdit() {
  snapshot = { ...form }
  isEditing.value = true
  savedMessage.value = ''
}

function cancelEdit() {
  Object.assign(form, snapshot)
  isEditing.value = false
}

async function saveProfile() {
  isSaving.value = true
  try {
    // Simulated persistence — wire to /api/profile when ready
    await new Promise(r => setTimeout(r, 600))
    snapshot = { ...form }
    isEditing.value = false
    savedMessage.value = 'Profile updated successfully.'
    setTimeout(() => (savedMessage.value = ''), 3000)
  } finally {
    isSaving.value = false
  }
}

function changePassword() {
  navigateTo('/forgot-password')
}

function confirmDelete() {
  if (window.confirm('Delete your account? This action cannot be undone.')) {
    savedMessage.value = 'Account deletion requested. Check your email to confirm.'
    setTimeout(() => (savedMessage.value = ''), 4000)
  }
}
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
}
.page-header p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}
.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.btn :deep(svg) { width: 16px; height: 16px; }
.btn-primary { background: #0073e6; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #005cb8; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
.btn-ghost { background: transparent; color: #334155; border-color: #e2e8f0; }
.btn-ghost:hover:not(:disabled) { background: #f1f5f9; }
.btn-outline { background: #fff; color: #334155; border-color: #e2e8f0; width: 100%; justify-content: flex-start; }
.btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-outline.danger { color: #b91c1c; border-color: #fecaca; }
.btn-outline.danger:hover { background: #fef2f2; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}
.toast :deep(svg) { width: 18px; height: 18px; }
.toast-success { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }

.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.profile-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
  flex-shrink: 0;
}
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.profile-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.125rem;
}
.profile-info p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}
.badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.plan-badge,
.role-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.plan-badge { background: #0073e6; color: #fff; }
.role-badge { background: #f1f5f9; color: #475569; }
.role-badge.role-admin { background: #fef3c7; color: #92400e; }
.role-badge.role-vendor { background: #e0f2fe; color: #075985; }

.card-body { padding: 1.5rem; }

.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin: 0 0 0.75rem;
}
.card-body .section-title + .form-grid { margin-bottom: 1.5rem; }
.card-body .section-title:not(:first-child) { margin-top: 0.5rem; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.875rem 1rem;
}
.field { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
.field-wide { grid-column: span 2; }
.field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #334155;
}
.field input,
.field select {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #0f172a;
  background: #fff;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: #0073e6;
  box-shadow: 0 0 0 3px rgba(0, 115, 230, 0.15);
}
.field input:disabled,
.field select:disabled {
  background: #f8fafc;
  color: #475569;
  cursor: not-allowed;
}

.toggle-list { display: flex; flex-direction: column; gap: 0.5rem; }
.toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.875rem;
  color: #334155;
  cursor: pointer;
  user-select: none;
}
.toggle input { width: 16px; height: 16px; accent-color: #0073e6; cursor: pointer; }
.toggle input:disabled { cursor: not-allowed; }

.sidebar-column { display: flex; flex-direction: column; gap: 1.5rem; }
.stats-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.stat-icon :deep(svg) { width: 20px; height: 20px; }
.stat-icon-blue { background: #0073e6; }
.stat-icon-teal { background: #14b8a6; }
.stat-icon-orange { background: #f97316; }
.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
}
.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.danger-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.danger-card .section-title { margin: 0 0 0.25rem; }

@media (max-width: 960px) {
  .profile-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .field-wide { grid-column: auto; }
  .profile-header { flex-direction: column; text-align: center; }
}
</style>
