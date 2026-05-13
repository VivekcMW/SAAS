<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Badge management</h1>
        <p class="bw-head__sub">Assign and revoke recognition badges on app listings.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--primary" @click="openAssignModal">Assign badge</button>
      </div>
    </header>

    <p v-if="loading" style="padding: 24px; color: var(--bw-text-muted);">Loading badges…</p>

    <AdminGridTable
      v-else
      :columns="columns"
      :rows="badges"
      row-key="id"
      search-placeholder="Search apps, badge types…"
      :selectable="false"
      :exportable="true"
      export-file-name="badges-export"
    >
      <template #cell-appName="{ row }">
        <strong>{{ row.appName }}</strong>
        <div style="font-size:0.78rem; color: var(--bw-text-muted);">{{ row.appId }}</div>
      </template>

      <template #cell-badgeType="{ row }">
        <span class="bw-chip" :class="badgeChip(row.badgeType)">{{ badgeLabel(row.badgeType) }}</span>
      </template>

      <template #cell-createdAt="{ row }">
        <span style="font-size:0.82rem; color: var(--bw-text-muted);">{{ fmtDate(row.createdAt) }}</span>
      </template>

      <template #cell-expiresAt="{ row }">
        <span style="font-size:0.82rem; color: var(--bw-text-muted);">{{ row.expiresAt ? fmtDate(row.expiresAt) : '—' }}</span>
      </template>

      <template #cell-_actions="{ row }">
        <button class="bw-btn bw-btn--ghost bw-btn--sm bw-btn--danger" @click="removeBadge(row as BadgeRow)">Remove</button>
      </template>
    </AdminGridTable>

    <!-- Assign badge modal -->
    <div v-if="showAssignModal" class="bw-modal-bg" @click.self="showAssignModal = false">
      <div class="bw-modal">
        <div class="bw-modal__head">
          <h2 class="bw-modal__title">Assign badge</h2>
          <button class="bw-modal__close" type="button" aria-label="Close" @click="showAssignModal = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="bw-modal__body">
          <!-- App search -->
          <div class="bw-field">
            <label class="bw-label">App</label>
            <div class="bw-app-search">
              <input
                v-model="appQuery"
                class="bw-input"
                placeholder="Search by app name…"
                autocomplete="off"
                @input="onAppQueryInput"
                @focus="showSuggestions = appSuggestions.length > 0"
                @blur="hideSuggestionsDelayed"
              >
              <ul v-if="showSuggestions && appSuggestions.length" class="bw-app-search__list">
                <li
                  v-for="app in appSuggestions"
                  :key="app.id"
                  class="bw-app-search__item"
                  @mousedown.prevent="selectApp(app)"
                >
                  <strong>{{ app.name }}</strong>
                  <span class="bw-app-search__meta">{{ app.category }} · {{ app.id }}</span>
                </li>
              </ul>
            </div>
            <p v-if="form.appId" style="font-size:0.78rem;color:var(--bw-text-muted);margin-top:2px;">Selected: <strong>{{ form.appName }}</strong> ({{ form.appId }})</p>
          </div>
          <div class="bw-field">
            <label class="bw-label">Badge type</label>
            <select v-model="form.badgeType" class="bw-select">
              <option value="">Select a badge</option>
              <option v-for="b in BADGE_TYPES" :key="b.value" :value="b.value">{{ b.label }}</option>
            </select>
          </div>
          <div class="bw-field">
            <label class="bw-label">Reason (optional)</label>
            <input v-model="form.reason" class="bw-input" placeholder="e.g. Editor's pick for Q2 2026" >
          </div>
          <div class="bw-field">
            <label class="bw-label">Expires at (optional)</label>
            <input v-model="form.expiresAt" type="date" class="bw-input" :min="today" >
          </div>
          <p v-if="formError" class="bw-form-error">
            {{ formError }}
            <button type="button" style="margin-left:8px;background:none;border:none;cursor:pointer;font-size:0.75rem;color:inherit;text-decoration:underline;" @click="formError = ''">Dismiss</button>
          </p>
        </div>
        <div class="bw-modal__foot">
          <button class="bw-btn bw-btn--ghost" @click="showAssignModal = false">Cancel</button>
          <button class="bw-btn bw-btn--primary" :disabled="saving" :aria-busy="saving ? 'true' : 'false'" @click="assignBadge">
            {{ saving ? 'Saving…' : 'Assign' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface BadgeRow {
  id: string
  appId: string
  appName: string
  badgeType: string
  assignedBy: string
  reason: string | null
  expiresAt: string | null
  createdAt: string
}

interface AppSuggestion {
  id: string
  name: string
  category: string
}

const BADGE_TYPES = [
  { value: 'editor_choice', label: "Editor's Choice" },
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Popular' },
  { value: 'highly_rated', label: 'Highly Rated' },
  { value: 'new', label: 'New' },
  { value: 'featured', label: 'Featured' },
  { value: 'verified', label: 'Verified' },
  { value: 'top_rated', label: 'Top Rated' }
]

const { fmtDate } = useFmt()
const today = new Date().toISOString().split('T')[0]

const badges = ref<BadgeRow[]>([])
const loading = ref(false)
const saving = ref(false)
const showAssignModal = ref(false)
const formError = ref('')
const form = ref({ appId: '', appName: '', badgeType: '', reason: '', expiresAt: '' })

// App search
const appQuery = ref('')
const appSuggestions = ref<AppSuggestion[]>([])
const showSuggestions = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

function onAppQueryInput() {
  form.value.appId = ''
  form.value.appName = ''
  if (searchTimer) clearTimeout(searchTimer)
  if (!appQuery.value.trim()) { appSuggestions.value = []; showSuggestions.value = false; return }
  searchTimer = setTimeout(async () => {
    try {
      const data = await $fetch<{ listings: AppSuggestion[] }>('/api/admin/listings', {
        query: { search: appQuery.value.trim(), limit: 10 }
      })
      appSuggestions.value = data.listings ?? []
      showSuggestions.value = appSuggestions.value.length > 0
    } catch { appSuggestions.value = [] }
  }, 280)
}

function selectApp(app: AppSuggestion) {
  form.value.appId = app.id
  form.value.appName = app.name
  appQuery.value = app.name
  showSuggestions.value = false
}

function hideSuggestionsDelayed() {
  setTimeout(() => { showSuggestions.value = false }, 200)
}

function openAssignModal() {
  form.value = { appId: '', appName: '', badgeType: '', reason: '', expiresAt: '' }
  appQuery.value = ''
  appSuggestions.value = []
  formError.value = ''
  showAssignModal.value = true
}

const columns = [
  { key: 'appName',    label: 'App',         sortable: true,  hideable: false, minWidth: '160px' },
  { key: 'badgeType',  label: 'Badge',       sortable: true,  hideable: false, width: '145px' },
  { key: 'assignedBy', label: 'Assigned by', sortable: false, hideable: true,  width: '140px' },
  { key: 'reason',     label: 'Reason',      sortable: false, hideable: true  },
  { key: 'createdAt',  label: 'Assigned',    sortable: true,  hideable: true,  width: '130px' },
  { key: 'expiresAt',  label: 'Expires',     sortable: true,  hideable: true,  width: '120px' },
  { key: '_actions',   label: '',            sortable: false, hideable: false, width: '90px' }
]

function badgeLabel(type: string) {
  return BADGE_TYPES.find(b => b.value === type)?.label ?? type
}

function badgeChip(type: string) {
  const map: Record<string, string> = {
    editor_choice: 'bw-chip--warning',
    trending: 'bw-chip--danger',
    popular: 'bw-chip--primary',
    highly_rated: 'bw-chip--success',
    new: 'bw-chip--neutral',
    featured: 'bw-chip--warning',
    verified: 'bw-chip--success',
    top_rated: 'bw-chip--primary'
  }
  return map[type] ?? 'bw-chip--neutral'
}

async function loadBadges() {
  loading.value = true
  try {
    const data = await $fetch<{ badges: BadgeRow[] }>('/api/admin/badges')
    badges.value = data.badges
  } catch (_err) {
    console.error('[AdminBadges] failed to load:', err)
  } finally {
    loading.value = false
  }
}

async function assignBadge() {
  formError.value = ''
  if (!form.value.appId.trim() || !form.value.badgeType) {
    formError.value = 'Please select an app and a badge type.'
    return
  }
  saving.value = true
  try {
    await $fetch('/api/admin/badges/assign', {
      method: 'POST',
      body: {
        appId: form.value.appId.trim(),
        badgeType: form.value.badgeType,
        action: 'assign',
        reason: form.value.reason || undefined,
        expiresAt: form.value.expiresAt || undefined
      }
    })
    showAssignModal.value = false
    form.value = { appId: '', appName: '', badgeType: '', reason: '', expiresAt: '' }
    appQuery.value = ''
    await loadBadges()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; statusMessage?: string }
    formError.value = e?.data?.message || e?.statusMessage || 'Failed to assign badge.'
  } finally {
    saving.value = false
  }
}

async function removeBadge(row: BadgeRow) {
  if (!confirm(`Remove "${badgeLabel(row.badgeType)}" badge from "${row.appName}"?`)) return
  try {
    await $fetch('/api/admin/badges/assign', {
      method: 'POST',
      body: { appId: row.appId, badgeType: row.badgeType, action: 'remove' }
    })
    await loadBadges()
  } catch (_err) {
    console.error('[AdminBadges] remove failed:', err)
  }
}

onMounted(loadBadges)
</script>

<style scoped>
.bw-modal-bg {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}
.bw-modal {
  background: var(--bw-surface); border-radius: 12px; width: 100%; max-width: 480px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: hidden;
}
.bw-modal__head { padding: 16px 20px; border-bottom: 1px solid var(--bw-border); display: flex; justify-content: space-between; align-items: center; }
.bw-modal__title { font-family: var(--f-ui); font-weight: 700; font-size: 1rem; margin: 0; }
.bw-modal__close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--bw-text-muted); }
.bw-modal__body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.bw-modal__foot { padding: 14px 20px; border-top: 1px solid var(--bw-border); display: flex; justify-content: flex-end; gap: 8px; }
.bw-field { display: flex; flex-direction: column; gap: 4px; }
.bw-label { font-size: 0.83rem; font-weight: 600; color: var(--bw-text-muted); }
.bw-form-error { font-size: 0.82rem; color: var(--bw-danger, #e53e3e); margin: 0; }
.bw-app-search { position: relative; }
.bw-app-search__list {
  position: absolute; top: calc(100% + 2px); left: 0; right: 0; z-index: 200;
  background: var(--bw-surface); border: 1px solid var(--bw-border); border-radius: 8px;
  list-style: none; margin: 0; padding: 4px 0; max-height: 240px; overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}
.bw-app-search__item {
  padding: 8px 12px; cursor: pointer; display: flex; flex-direction: column; gap: 1px;
  transition: background 0.12s;
}
.bw-app-search__item:hover { background: var(--bw-surface-hover, rgba(255,255,255,0.05)); }
.bw-app-search__meta { font-size: 0.75rem; color: var(--bw-text-muted); }
</style>
