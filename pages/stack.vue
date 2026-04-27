<template>
  <div class="stack-page">
    <div class="stack-page__hero">
      <div class="container">
        <h1>My SaaS Stack</h1>
        <p>Track your tools, monitor spending, and discover what other teams use.</p>
      </div>
    </div>

    <div class="container stack-page__body">
      <!-- Summary cards -->
      <div class="stack-summary">
        <div class="summary-card">
          <span class="summary-card__value">{{ stack?.count ?? 0 }}</span>
          <span class="summary-card__label">Tools</span>
        </div>
        <div class="summary-card">
          <span class="summary-card__value">${{ fmtMoney(stack?.total_monthly_usd ?? 0) }}</span>
          <span class="summary-card__label">/ month est.</span>
        </div>
        <div class="summary-card">
          <span class="summary-card__value">${{ fmtMoney((stack?.total_monthly_usd ?? 0) * 12) }}</span>
          <span class="summary-card__label">/ year est.</span>
        </div>
      </div>

      <div class="stack-page__layout">
        <!-- Stack items -->
        <main class="stack-page__main">
          <div class="stack-main__header">
            <h2>Your tools</h2>
            <NuxtLink to="/marketplace" class="btn-add">+ Add tool</NuxtLink>
          </div>

          <p v-if="stackPending" class="muted">Loading…</p>
          <p v-else-if="!stack?.items?.length" class="stack-empty">
            Your stack is empty. <NuxtLink to="/marketplace">Browse the marketplace</NuxtLink> and add tools to track your spending.
          </p>

          <div v-else class="stack-list">
            <div v-for="item in stack.items" :key="item.id" class="stack-item">
              <div class="stack-item__logo">
                <img v-if="item.app_logo" :src="item.app_logo" :alt="item.app_name" width="36" height="36" loading="lazy" />
                <div v-else class="stack-item__logo-placeholder">{{ item.app_name[0] }}</div>
              </div>
              <div class="stack-item__body">
                <div class="stack-item__name">{{ item.app_name }}</div>
                <div class="stack-item__cat">{{ item.category }}</div>
              </div>
              <div class="stack-item__cost">
                <span v-if="item.price_usd != null" class="stack-item__price">
                  ${{ fmtMoney(item.price_usd) }}<small>/{{ item.billing_period }}</small>
                </span>
                <span v-else class="stack-item__price muted">—</span>
              </div>
              <div class="stack-item__actions">
                <button class="icon-btn" title="Set renewal reminder" @click="openReminder(item)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </button>
                <button class="icon-btn icon-btn--danger" title="Remove from stack" @click="removeItem(item.id)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </main>

        <!-- Sidebar: Suggestions -->
        <aside class="stack-page__sidebar">
          <div class="sidebar-card">
            <h3>Suggested tools</h3>
            <p class="sidebar-card__sub">Apps commonly used alongside your stack</p>
            <p v-if="!suggestions?.suggestions?.length" class="muted">Add more tools to get suggestions.</p>
            <div v-else class="suggestion-list">
              <div v-for="app in suggestions.suggestions" :key="app.id" class="suggestion-item">
                <img v-if="app.logo" :src="app.logo" :alt="app.name" width="28" height="28" loading="lazy" class="suggestion-item__logo" />
                <div class="suggestion-item__body">
                  <NuxtLink :to="`/app/${app.id}`" class="suggestion-item__name">{{ app.name }}</NuxtLink>
                  <span class="suggestion-item__cat">{{ app.category }}</span>
                </div>
                <button class="suggestion-item__add" @click="addToStack(app.id)" :disabled="addingIds.has(app.id)">
                  {{ addingIds.has(app.id) ? '✓' : '+' }}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Reminder modal -->
    <div v-if="reminderModal" class="modal-overlay" @click.self="reminderModal = null">
      <div class="modal">
        <h4>Set renewal reminder for <strong>{{ reminderModal.app_name }}</strong></h4>
        <form @submit.prevent="saveReminder">
          <label>Remind me on</label>
          <input v-model="reminderDate" type="date" required :min="today" />
          <div class="modal__actions">
            <button type="submit" :disabled="reminderLoading">{{ reminderLoading ? 'Saving…' : 'Set reminder' }}</button>
            <button type="button" @click="reminderModal = null">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'My SaaS Stack — SaasWorld', description: 'Track your SaaS tools, monitor spending, and discover what teams use alongside your stack.' })

const { data: stack, pending: stackPending, refresh: refreshStack } = await useAsyncData('my-stack', () => $fetch('/api/stack'))
const { data: suggestions, refresh: refreshSuggestions } = await useAsyncData('stack-suggestions', () => $fetch('/api/stack/similar'))

function fmtMoney(n: number) {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)
}

const addingIds = ref(new Set<string>())
async function addToStack(appId: string) {
  addingIds.value.add(appId)
  try {
    await $fetch('/api/stack', { method: 'POST', body: { app_id: appId } })
    await Promise.all([refreshStack(), refreshSuggestions()])
  } finally {
    addingIds.value.delete(appId)
  }
}

async function removeItem(id: string) {
  await $fetch(`/api/stack/${id}`, { method: 'DELETE' })
  await refreshStack()
  await refreshSuggestions()
}

const reminderModal = ref<any>(null)
const reminderDate = ref('')
const reminderLoading = ref(false)
const today = new Date().toISOString().slice(0, 10)

function openReminder(item: any) {
  reminderModal.value = item
  reminderDate.value = item.renewal_date?.slice(0, 10) || ''
}

async function saveReminder() {
  if (!reminderModal.value) return
  reminderLoading.value = true
  try {
    await $fetch(`/api/stack/${reminderModal.value.id}/reminder`, { method: 'POST', body: { remind_at: reminderDate.value } })
    reminderModal.value = null
  } finally {
    reminderLoading.value = false
  }
}
</script>

<style scoped>
.stack-page__hero { background: #1e1b4b; color: #fff; padding: 2.5rem 1.5rem; }
.stack-page__hero h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
.stack-page__hero p { opacity: 0.75; font-size: 0.95rem; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
.stack-page__body { padding-top: 2rem; padding-bottom: 3rem; }
.stack-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
.summary-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem 1.5rem; text-align: center; }
.summary-card__value { display: block; font-size: 1.75rem; font-weight: 800; }
.summary-card__label { font-size: 0.78rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.stack-page__layout { display: grid; grid-template-columns: 1fr 280px; gap: 2rem; }
@media (max-width: 768px) { .stack-page__layout { grid-template-columns: 1fr; } .stack-summary { grid-template-columns: 1fr 1fr; } }
.stack-main__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.stack-main__header h2 { font-size: 1.1rem; font-weight: 700; }
.btn-add { background: #4f46e5; color: #fff; border-radius: 7px; padding: 6px 14px; font-size: 0.85rem; font-weight: 600; text-decoration: none; }
.btn-add:hover { background: #4338ca; }
.stack-empty { color: #6b7280; font-size: 0.9rem; }
.stack-empty a { color: #4f46e5; }
.stack-list { display: flex; flex-direction: column; gap: 0; }
.stack-item { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 0; border-bottom: 1px solid #f3f4f6; }
.stack-item__logo { flex-shrink: 0; width: 36px; height: 36px; }
.stack-item__logo img { border-radius: 8px; object-fit: contain; }
.stack-item__logo-placeholder { width: 36px; height: 36px; background: #e0e7ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #4f46e5; }
.stack-item__body { flex: 1; }
.stack-item__name { font-size: 0.9rem; font-weight: 600; }
.stack-item__cat { font-size: 0.75rem; color: #9ca3af; text-transform: capitalize; }
.stack-item__cost { text-align: right; min-width: 80px; }
.stack-item__price { font-size: 0.875rem; font-weight: 600; }
.stack-item__price small { font-size: 0.7rem; font-weight: 400; color: #9ca3af; }
.stack-item__actions { display: flex; gap: 6px; }
.icon-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px 7px; cursor: pointer; color: #6b7280; display: flex; }
.icon-btn:hover { color: #4f46e5; border-color: #a5b4fc; }
.icon-btn--danger:hover { color: #dc2626; border-color: #fca5a5; }
.sidebar-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; }
.sidebar-card h3 { font-size: 0.875rem; font-weight: 700; margin-bottom: 2px; }
.sidebar-card__sub { font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.75rem; }
.suggestion-list { display: flex; flex-direction: column; gap: 8px; }
.suggestion-item { display: flex; align-items: center; gap: 8px; }
.suggestion-item__logo { border-radius: 6px; object-fit: contain; flex-shrink: 0; }
.suggestion-item__body { flex: 1; }
.suggestion-item__name { font-size: 0.85rem; font-weight: 600; text-decoration: none; color: #111827; }
.suggestion-item__name:hover { color: #4f46e5; }
.suggestion-item__cat { display: block; font-size: 0.72rem; color: #9ca3af; text-transform: capitalize; }
.suggestion-item__add { background: #e0e7ff; color: #4f46e5; border: none; border-radius: 6px; width: 26px; height: 26px; font-size: 1rem; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.suggestion-item__add:disabled { background: #d1fae5; color: #16a34a; cursor: default; }
.muted { color: #9ca3af; font-size: 0.875rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal { background: #fff; border-radius: 14px; padding: 1.5rem; max-width: 380px; width: 100%; }
.modal h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
.modal label { font-size: 0.875rem; font-weight: 600; display: block; margin-bottom: 6px; }
.modal input { border: 1px solid #d1d5db; border-radius: 8px; padding: 7px 10px; font-size: 0.875rem; width: 100%; margin-bottom: 1rem; }
.modal__actions { display: flex; gap: 8px; }
.modal__actions button { border-radius: 7px; padding: 7px 16px; font-size: 0.875rem; cursor: pointer; }
.modal__actions button[type=submit] { background: #4f46e5; color: #fff; border: none; }
.modal__actions button[type=button] { background: none; border: 1px solid #e5e7eb; }
.price-intel-wrap { margin-top: 2rem; }
</style>
