<template>
  <div class="vw leads-page">

    <!-- Page header -->
    <header class="leads-page__head">
      <div class="leads-page__head-left">
        <h1 class="leads-page__title">Leads</h1>
        <p class="leads-page__sub">Buyer enquiries — reply fast, win more deals.</p>
      </div>
      <div class="leads-page__head-right">
        <div class="leads-stats">
          <div class="leads-stat">
            <span class="leads-stat__n">{{ leads.filter(l => l.status === 'new').length }}</span>
            <span class="leads-stat__l">New</span>
          </div>
          <div class="leads-stat leads-stat--hot">
            <span class="leads-stat__n">{{ leads.filter(l => l.temperature === 'hot').length }}</span>
            <span class="leads-stat__l">Hot</span>
          </div>
          <div class="leads-stat">
            <span class="leads-stat__n">{{ leads.filter(l => l.status === 'awaiting').length }}</span>
            <span class="leads-stat__l">Awaiting</span>
          </div>
        </div>
        <span class="vw-ai-chip leads-ai-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          AI intent on
        </span>
      </div>
    </header>

    <!-- Filter bar -->
    <div class="leads-bar">
      <div class="leads-bar__tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          class="leads-tab"
          :class="{ 'is-active': filter === t.key }"
          @click="filter = t.key"
        >
          {{ t.label }}
          <span class="leads-tab__badge" :class="t.key === 'new' ? 'leads-tab__badge--new' : ''">{{ t.count() }}</span>
        </button>
      </div>
      <div class="leads-bar__search">
        <svg class="leads-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="search" class="leads-search-input" placeholder="Search name, company, listing…" />
        <button v-if="search" class="leads-search-clear" @click="search = ''" type="button">×</button>
      </div>
    </div>

    <!-- Three-panel layout -->
    <div class="leads-layout">

      <!-- LEFT: Lead list -->
      <div class="leads-list-panel">
        <!-- Loading skeletons -->
        <template v-if="leadsLoading">
          <div v-for="i in 5" :key="i" class="lead-skel">
            <div class="lead-skel__line lead-skel__line--wide"></div>
            <div class="lead-skel__line lead-skel__line--mid"></div>
            <div class="lead-skel__line lead-skel__line--narrow"></div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else-if="list.length === 0" class="leads-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p v-if="search">No leads match <em>"{{ search }}"</em></p>
          <p v-else>No leads in this tab yet.</p>
        </div>

        <!-- Lead items -->
        <div
          v-for="l in list"
          :key="l.id"
          class="lead-item"
          :class="{ 'is-active': active?.id === l.id, 'is-unread': l.status === 'new' }"
          @click="select(l.id)"
        >
          <div class="lead-item__avatar" :class="`lead-item__avatar--${l.temperature}`">
            {{ l.buyerName.charAt(0).toUpperCase() }}
          </div>
          <div class="lead-item__body">
            <div class="lead-item__row1">
              <span class="lead-item__name">{{ l.buyerName }}</span>
              <span class="lead-item__time">{{ l.updatedAt }}</span>
            </div>
            <div class="lead-item__company">{{ l.buyerCompany }}{{ l.buyerSize ? ' · ' + l.buyerSize : '' }}</div>
            <div class="lead-item__subject">{{ l.subject }}</div>
            <div class="lead-item__row2">
              <span class="lead-item__listing">{{ l.listingName }}</span>
              <span class="lead-item__temp-chip" :class="`is-${l.temperature}`">{{ l.temperature }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CENTRE: Thread -->
      <div class="leads-thread-panel">
        <!-- Empty state -->
        <div v-if="!active" class="leads-thread-empty">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p>Select a lead to start the conversation</p>
        </div>

        <template v-else>
          <!-- Thread header -->
          <div class="thread-header">
            <div class="thread-header__info">
              <div class="thread-header__avatar" :class="`thread-avatar--${active.temperature}`">
                {{ active.buyerName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="thread-header__name">{{ active.buyerName }}</div>
                <div class="thread-header__meta">
                  {{ active.buyerCompany }}{{ active.buyerSize ? ' · ' + active.buyerSize : '' }}
                  &middot; <span class="thread-header__listing">{{ active.listingName }}</span>
                </div>
              </div>
            </div>
            <div class="thread-header__actions">
              <span class="thread-status-chip" :class="`is-${active.status}`">{{ active.status }}</span>
              <button
                v-if="active.status !== 'closed'"
                class="thread-action-btn"
                :disabled="closing"
                @click="closeLead(active.id)"
                title="Close lead"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                {{ closing ? '…' : 'Close' }}
              </button>
              <button
                v-if="active.status !== 'closed'"
                class="thread-action-btn thread-action-btn--win"
                :disabled="closing"
                @click="markWon(active.id)"
                title="Mark as won"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Won
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div class="thread-messages" ref="msgEl">
            <div
              v-for="m in active.messages"
              :key="m.id"
              class="msg-row"
              :class="m.from === 'vendor' ? 'msg-row--vendor' : 'msg-row--buyer'"
            >
              <div class="msg-avatar">{{ m.from === 'buyer' ? active.buyerName.charAt(0) : 'Y' }}</div>
              <div class="msg-content">
                <div class="msg-bubble">{{ m.body }}</div>
                <div class="msg-time">{{ m.from === 'buyer' ? active.buyerName : 'You' }} &middot; {{ m.at }}</div>
              </div>
            </div>
            <div v-if="!active.messages?.length" class="thread-no-msgs">
              <p>No messages yet. Start the conversation below.</p>
            </div>
          </div>

          <!-- Composer -->
          <div class="thread-composer">
            <div v-if="active.aiDraft && !reply" class="composer-ai-hint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
              AI draft available in the panel →
            </div>
            <textarea
              v-model="reply"
              class="composer-textarea"
              placeholder="Write your reply… or use the AI draft →"
              rows="3"
            />
            <div class="composer-footer">
              <button class="composer-btn composer-btn--ghost" @click="reply = ''" :disabled="!reply">Clear</button>
              <button
                class="composer-btn composer-btn--primary"
                :disabled="!reply.trim()"
                @click="send"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send reply
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- RIGHT: AI sidecar -->
      <div v-if="active" class="leads-ai-panel">
        <!-- Lead summary -->
        <div class="ai-panel-card">
          <div class="ai-panel-card__head">
            <span class="vw-ai-chip">AI</span>
            <span class="ai-panel-card__title">Lead summary</span>
          </div>
          <p class="ai-panel-card__body">{{ summary }}</p>
        </div>

        <!-- AI draft -->
        <div v-if="active.aiDraft" class="ai-panel-card ai-panel-card--draft">
          <div class="ai-panel-card__head">
            <span class="vw-ai-chip">AI</span>
            <span class="ai-panel-card__title">Suggested reply</span>
          </div>
          <p class="ai-panel-card__body ai-draft-text">{{ active.aiDraft }}</p>
          <div class="ai-draft-actions">
            <button class="ai-draft-btn ai-draft-btn--use" @click="useDraft(active.aiDraft)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Use this
            </button>
            <button class="ai-draft-btn" @click="tone('warm')">Warmer</button>
            <button class="ai-draft-btn" @click="tone('concise')">Shorter</button>
          </div>
        </div>

        <!-- Buyer signals -->
        <div class="ai-panel-card">
          <div class="ai-panel-card__head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span class="ai-panel-card__title">Buyer signals</span>
          </div>
          <ul class="signals-list">
            <li class="signals-item">
              <span class="signals-label">Company</span>
              <span class="signals-value">{{ active.buyerCompany || '—' }}{{ active.buyerSize ? ' · ' + active.buyerSize : '' }}</span>
            </li>
            <li class="signals-item">
              <span class="signals-label">Intent</span>
              <span class="signals-value">
                <span class="lead-item__temp-chip" :class="`is-${active.temperature}`">{{ active.temperature }}</span>
              </span>
            </li>
            <li class="signals-item">
              <span class="signals-label">Listing</span>
              <span class="signals-value">{{ active.listingName }}</span>
            </li>
            <li v-if="active.source" class="signals-item">
              <span class="signals-label">Source</span>
              <span class="signals-value">{{ active.source }}</span>
            </li>
            <li class="signals-item">
              <span class="signals-label">Messages</span>
              <span class="signals-value">{{ active.messages?.length ?? 0 }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- AI sidecar placeholder when no lead selected -->
      <div v-else class="leads-ai-panel leads-ai-panel--empty">
        <div class="ai-panel-placeholder">
          <span class="vw-ai-chip">AI</span>
          <p>Select a lead to see AI insights and suggested replies.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const { leads, replyLead, loadLeads, loadLeadMessages, leadsLoading } = useVendorData()
const ai = useAICopilot()

onMounted(async () => {
  await loadLeads()
  if (leads.value[0]) activeId.value = leads.value[0].id
})

const filter = ref<'all' | 'new' | 'awaiting' | 'closed'>('all')
const activeId = ref<string | null>(null)
const reply = ref('')
const search = ref('')
const closing = ref(false)
const msgEl = ref<HTMLElement | null>(null)

const tabs = [
  { key: 'all' as const, label: 'All', count: () => leads.value.length },
  { key: 'new' as const, label: 'New', count: () => leads.value.filter(l => l.status === 'new').length },
  { key: 'awaiting' as const, label: 'Awaiting', count: () => leads.value.filter(l => l.status === 'awaiting').length },
  { key: 'closed' as const, label: 'Closed', count: () => leads.value.filter(l => l.status === 'closed').length }
]

const list = computed(() => {
  let items = filter.value === 'all' ? leads.value : leads.value.filter(l => l.status === filter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    items = items.filter(l =>
      l.buyerName.toLowerCase().includes(q) ||
      l.buyerCompany.toLowerCase().includes(q) ||
      l.listingName.toLowerCase().includes(q)
    )
  }
  return items
})
const active = computed(() => leads.value.find(l => l.id === activeId.value) || null)

watch(activeId, async (id) => {
  if (id) {
    await loadLeadMessages(id)
    await nextTick()
    if (msgEl.value) msgEl.value.scrollTop = msgEl.value.scrollHeight
  }
})

const summary = computed(() => {
  if (!active.value) return ''
  const l = active.value
  return `${l.buyerName}${l.buyerCompany ? ' from ' + l.buyerCompany : ''} is asking about "${l.listingName}". Intent is ${l.temperature} across ${l.messages?.length ?? 0} message(s).`
})

function select(id: string) {
  activeId.value = id
  reply.value = ''
}
function useDraft(txt: string) { reply.value = txt }

async function tone(k: 'warm' | 'concise') {
  if (!active.value?.aiDraft) return
  const updated = await ai.rewriteDraft(active.value.aiDraft, k)
  active.value.aiDraft = updated
}

function send() {
  if (!active.value || !reply.value.trim()) return
  replyLead(active.value.id, reply.value)
  reply.value = ''
}

async function closeLead(id: string) {
  closing.value = true
  try {
    await $fetch(`/api/enquiries/${id}/status`, { method: 'PATCH', body: { status: 'closed' } })
    const lead = leads.value.find(l => l.id === id)
    if (lead) lead.status = 'closed'
  } catch (e) {
    console.error('[VendorLeads] close failed', e)
  } finally {
    closing.value = false
  }
}

async function markWon(id: string) {
  closing.value = true
  try {
    await $fetch(`/api/enquiries/${id}/status`, { method: 'PATCH', body: { status: 'closed', outcome: 'won' } })
    const lead = leads.value.find(l => l.id === id)
    if (lead) lead.status = 'closed'
  } catch (e) {
    console.error('[VendorLeads] mark-won failed', e)
  } finally {
    closing.value = false
  }
}
</script>

<style scoped>
/* ── Page header ── */
.leads-page { display: flex; flex-direction: column; gap: 0; }
.leads-page__head {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 16px; padding-bottom: 20px;
}
.leads-page__head-left {}
.leads-page__title { font-family: var(--f-ui); font-weight: 800; font-size: 1.5rem; color: var(--vw-text); margin: 0 0 4px; }
.leads-page__sub { font-size: 0.84rem; color: var(--vw-text-muted); margin: 0; }
.leads-page__head-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }

/* KPI strip in header */
.leads-stats { display: flex; gap: 1px; border: 1px solid var(--vw-border); border-radius: 10px; overflow: hidden; }
.leads-stat {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 8px 16px; background: var(--vw-surface); min-width: 56px;
}
.leads-stat + .leads-stat { border-left: 1px solid var(--vw-border); }
.leads-stat--hot .leads-stat__n { color: #f87171; }
.leads-stat__n { font-weight: 800; font-family: var(--f-ui); font-size: 1.05rem; color: var(--vw-text); line-height: 1; }
.leads-stat__l { font-size: 0.68rem; color: var(--vw-text-subtle); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
.leads-ai-badge { font-size: 0.72rem; }

/* ── Filter bar ── */
.leads-bar {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
}
.leads-bar__tabs { display: flex; gap: 4px; }
.leads-tab {
  padding: 6px 12px; border-radius: 8px; font-size: 0.82rem; font-weight: 500;
  border: 1px solid transparent; background: transparent; color: var(--vw-text-muted);
  cursor: pointer; transition: all .12s ease; display: flex; align-items: center; gap: 6px;
}
.leads-tab:hover { background: var(--vw-surface-2); color: var(--vw-text); }
.leads-tab.is-active { background: var(--vw-surface-2); color: var(--vw-text); border-color: var(--vw-border); }
.leads-tab__badge {
  font-size: 0.7rem; padding: 1px 6px; border-radius: 999px;
  background: var(--vw-surface); color: var(--vw-text-subtle); min-width: 18px; text-align: center;
}
.leads-tab__badge--new { background: rgba(239,68,68,0.15); color: #f87171; }
.is-active .leads-tab__badge { background: var(--vw-border); }

.leads-bar__search {
  position: relative; display: flex; align-items: center;
}
.leads-search-icon { position: absolute; left: 10px; color: var(--vw-text-subtle); pointer-events: none; }
.leads-search-input {
  padding: 7px 32px 7px 32px; border-radius: 8px; font-size: 0.83rem;
  border: 1px solid var(--vw-border); background: var(--vw-surface);
  color: var(--vw-text); width: 260px; transition: border-color .15s;
}
.leads-search-input::placeholder { color: var(--vw-text-subtle); }
.leads-search-input:focus { outline: none; border-color: var(--vw-primary); }
.leads-search-clear {
  position: absolute; right: 10px; background: none; border: none;
  color: var(--vw-text-subtle); cursor: pointer; font-size: 1rem; line-height: 1; padding: 0;
}
.leads-search-clear:hover { color: var(--vw-text); }

/* ── Three-panel grid ── */
.leads-layout {
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  gap: 14px;
  min-height: 560px;
  align-items: start;
}

/* ── Left panel: lead list ── */
.leads-list-panel {
  border: 1px solid var(--vw-border); border-radius: 12px;
  background: var(--vw-surface); overflow: hidden;
  display: flex; flex-direction: column;
}

/* Loading skeleton */
.lead-skel { padding: 14px; border-bottom: 1px solid var(--vw-border); animation: skel-pulse 1.4s ease-in-out infinite; }
@keyframes skel-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.lead-skel__line { height: 10px; border-radius: 5px; background: var(--vw-surface-2); margin-bottom: 7px; }
.lead-skel__line--wide { width: 70%; }
.lead-skel__line--mid { width: 50%; }
.lead-skel__line--narrow { width: 40%; }

/* Empty state */
.leads-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 40px 20px; color: var(--vw-text-subtle); text-align: center;
}
.leads-empty svg { opacity: 0.35; }
.leads-empty p { font-size: 0.85rem; margin: 0; }
.leads-empty em { font-style: normal; color: var(--vw-text-muted); }

/* Lead item card */
.lead-item {
  display: flex; gap: 10px; padding: 13px 14px;
  border-bottom: 1px solid var(--vw-border);
  cursor: pointer; transition: background .1s ease;
  position: relative;
}
.lead-item:last-child { border-bottom: none; }
.lead-item:hover { background: var(--vw-surface-2); }
.lead-item.is-active { background: rgba(var(--vw-primary-rgb, 212,168,67), 0.08); border-left: 3px solid var(--vw-primary); }
.lead-item.is-unread .lead-item__name::after {
  content: ''; display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: var(--vw-primary); margin-left: 6px; vertical-align: middle;
}

.lead-item__avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.85rem; color: white;
  background: var(--vw-text-subtle);
}
.lead-item__avatar--hot { background: #dc2626; }
.lead-item__avatar--warm { background: #d97706; }
.lead-item__avatar--cold { background: var(--vw-text-subtle); }

.lead-item__body { flex: 1; min-width: 0; }
.lead-item__row1 { display: flex; justify-content: space-between; align-items: baseline; gap: 4px; }
.lead-item__name { font-weight: 600; font-size: 0.875rem; color: var(--vw-text); }
.lead-item__time { font-size: 0.68rem; color: var(--vw-text-subtle); flex-shrink: 0; }
.lead-item__company { font-size: 0.75rem; color: var(--vw-text-subtle); margin-top: 1px; }
.lead-item__subject {
  font-size: 0.8rem; color: var(--vw-text-muted); margin-top: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lead-item__row2 { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; gap: 6px; }
.lead-item__listing { font-size: 0.7rem; color: var(--vw-text-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

/* Temperature chip */
.lead-item__temp-chip {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  padding: 2px 7px; border-radius: 999px; letter-spacing: 0.04em; flex-shrink: 0;
}
.lead-item__temp-chip.is-hot { background: rgba(220,38,38,0.15); color: #f87171; }
.lead-item__temp-chip.is-warm { background: rgba(217,119,6,0.15); color: #fbbf24; }
.lead-item__temp-chip.is-cold { background: var(--vw-surface-2); color: var(--vw-text-subtle); }

/* ── Centre panel: thread ── */
.leads-thread-panel {
  border: 1px solid var(--vw-border); border-radius: 12px;
  background: var(--vw-surface); display: flex; flex-direction: column;
  min-height: 560px; overflow: hidden;
}

.leads-thread-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; color: var(--vw-text-subtle); padding: 40px;
}
.leads-thread-empty svg { opacity: 0.25; }
.leads-thread-empty p { font-size: 0.88rem; margin: 0; }

/* Thread header */
.thread-header {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; padding: 14px 18px;
  border-bottom: 1px solid var(--vw-border);
  background: var(--vw-surface);
}
.thread-header__info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.thread-header__avatar {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem; color: white;
  background: var(--vw-text-subtle);
}
.thread-avatar--hot { background: #dc2626; }
.thread-avatar--warm { background: #d97706; }
.thread-header__name { font-weight: 700; font-size: 0.95rem; color: var(--vw-text); }
.thread-header__meta { font-size: 0.77rem; color: var(--vw-text-muted); margin-top: 1px; }
.thread-header__listing { color: var(--vw-primary); font-weight: 500; }
.thread-header__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* Status chip in thread header */
.thread-status-chip {
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  padding: 3px 8px; border-radius: 999px; letter-spacing: 0.04em;
}
.thread-status-chip.is-new { background: rgba(var(--vw-primary-rgb,212,168,67),0.15); color: var(--vw-primary); }
.thread-status-chip.is-replied { background: rgba(16,185,129,0.12); color: #34d399; }
.thread-status-chip.is-awaiting { background: rgba(245,158,11,0.12); color: #fbbf24; }
.thread-status-chip.is-closed { background: var(--vw-surface-2); color: var(--vw-text-subtle); }

/* Thread action buttons */
.thread-action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 7px; font-size: 0.78rem; font-weight: 500;
  border: 1px solid var(--vw-border); background: var(--vw-surface-2);
  color: var(--vw-text-muted); cursor: pointer; transition: all .12s;
}
.thread-action-btn:hover { border-color: var(--vw-text-subtle); color: var(--vw-text); }
.thread-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.thread-action-btn--win { border-color: rgba(16,185,129,0.3); color: #34d399; background: rgba(16,185,129,0.08); }
.thread-action-btn--win:hover { background: rgba(16,185,129,0.15); }

/* Messages area */
.thread-messages {
  flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px;
  min-height: 280px;
}
.thread-no-msgs { flex: 1; display: flex; align-items: center; justify-content: center; }
.thread-no-msgs p { font-size: 0.83rem; color: var(--vw-text-subtle); }

.msg-row { display: flex; gap: 10px; max-width: 78%; }
.msg-row--vendor { align-self: flex-end; flex-direction: row-reverse; }

.msg-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: white;
  background: var(--vw-text-subtle);
}
.msg-row--vendor .msg-avatar { background: var(--vw-primary); }

.msg-content { display: flex; flex-direction: column; gap: 4px; }
.msg-row--vendor .msg-content { align-items: flex-end; }

.msg-bubble {
  padding: 10px 14px; border-radius: 14px; font-size: 0.875rem; line-height: 1.55;
  background: var(--vw-surface-2); color: var(--vw-text);
  border-bottom-left-radius: 4px;
  max-width: 100%; word-break: break-word;
}
.msg-row--vendor .msg-bubble {
  background: var(--vw-primary); color: white;
  border-bottom-left-radius: 14px; border-bottom-right-radius: 4px;
}
.msg-time { font-size: 0.68rem; color: var(--vw-text-subtle); padding: 0 4px; }

/* Composer */
.thread-composer { border-top: 1px solid var(--vw-border); padding: 14px 16px; }
.composer-ai-hint {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.72rem; color: var(--vw-ai-text); background: var(--vw-ai-50);
  border: 1px solid var(--vw-ai-100); border-radius: 6px; padding: 3px 9px;
  margin-bottom: 8px;
}
.composer-textarea {
  width: 100%; padding: 10px 12px; border-radius: 8px; resize: none;
  border: 1px solid var(--vw-border); background: var(--vw-surface-2);
  color: var(--vw-text); font-size: 0.875rem; line-height: 1.5; font-family: inherit;
  transition: border-color .15s;
}
.composer-textarea::placeholder { color: var(--vw-text-subtle); }
.composer-textarea:focus { outline: none; border-color: var(--vw-primary); }
.composer-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.composer-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 500;
  cursor: pointer; transition: all .12s; border: 1px solid transparent;
}
.composer-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.composer-btn--ghost { background: transparent; border-color: var(--vw-border); color: var(--vw-text-muted); }
.composer-btn--ghost:hover:not(:disabled) { background: var(--vw-surface-2); color: var(--vw-text); }
.composer-btn--primary { background: var(--vw-primary); color: white; border-color: var(--vw-primary); }
.composer-btn--primary:hover:not(:disabled) { filter: brightness(1.1); }

/* ── Right panel: AI sidecar ── */
.leads-ai-panel { display: flex; flex-direction: column; gap: 12px; }
.leads-ai-panel--empty {
  border: 1px dashed var(--vw-border); border-radius: 12px;
  background: transparent;
}
.ai-panel-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 32px 20px; text-align: center; color: var(--vw-text-subtle);
}
.ai-panel-placeholder p { font-size: 0.82rem; margin: 0; }

.ai-panel-card {
  border: 1px solid var(--vw-border); border-radius: 12px;
  background: var(--vw-surface); padding: 14px;
}
.ai-panel-card--draft { border-color: var(--vw-ai-100); background: var(--vw-ai-50, var(--vw-surface)); }
.ai-panel-card__head {
  display: flex; align-items: center; gap: 7px; margin-bottom: 10px;
}
.ai-panel-card__title { font-weight: 600; font-size: 0.82rem; color: var(--vw-text); }
.ai-panel-card__body { font-size: 0.82rem; line-height: 1.55; color: var(--vw-text-muted); margin: 0; }

.ai-draft-text { white-space: pre-line; }
.ai-draft-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.ai-draft-btn {
  padding: 5px 10px; border-radius: 7px; font-size: 0.76rem; font-weight: 500;
  border: 1px solid var(--vw-border); background: var(--vw-surface-2);
  color: var(--vw-text-muted); cursor: pointer; transition: all .12s;
  display: inline-flex; align-items: center; gap: 4px;
}
.ai-draft-btn:hover { color: var(--vw-text); border-color: var(--vw-text-subtle); }
.ai-draft-btn--use { background: var(--vw-primary); color: white; border-color: var(--vw-primary); }
.ai-draft-btn--use:hover { filter: brightness(1.1); }

.signals-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; }
.signals-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0; border-bottom: 1px solid var(--vw-border); gap: 8px;
}
.signals-item:last-child { border: none; }
.signals-label { font-size: 0.75rem; color: var(--vw-text-subtle); flex-shrink: 0; }
.signals-value { font-size: 0.78rem; color: var(--vw-text); text-align: right; }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .leads-layout { grid-template-columns: 280px 1fr 260px; }
}
@media (max-width: 1024px) {
  .leads-layout { grid-template-columns: 260px 1fr; }
  .leads-ai-panel { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; }
  .ai-panel-card { flex: 1; min-width: 240px; }
}
@media (max-width: 720px) {
  .leads-layout { grid-template-columns: 1fr; }
  .leads-page__head { flex-direction: column; gap: 12px; }
  .leads-bar { flex-direction: column; align-items: stretch; }
  .leads-search-input { width: 100%; }
  .leads-stats { align-self: flex-start; }
}
</style>
