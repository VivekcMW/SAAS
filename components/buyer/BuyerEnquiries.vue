<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Enquiries</h1>
        <p class="bw-head__sub">Conversations with vendors about the apps you're evaluating.</p>
      </div>
    </header>

    <!-- Counters / tab switcher — only shown when data is loaded -->
    <div v-if="!pending && !fetchError" class="bw-kpis" style="grid-template-columns: repeat(3, 1fr); max-width: 640px;">
      <button class="bw-kpi tab-kpi" :class="{ 'is-active': tab === 'open' }" @click="tab = 'open'">
        <div class="bw-kpi__label">Open</div>
        <div class="bw-kpi__value">{{ counts.open }}</div>
      </button>
      <button class="bw-kpi tab-kpi" :class="{ 'is-active': tab === 'awaiting-reply' }" @click="tab = 'awaiting-reply'">
        <div class="bw-kpi__label">Awaiting reply</div>
        <div class="bw-kpi__value">{{ counts['awaiting-reply'] }}</div>
      </button>
      <button class="bw-kpi tab-kpi" :class="{ 'is-active': tab === 'closed' }" @click="tab = 'closed'">
        <div class="bw-kpi__label">Closed</div>
        <div class="bw-kpi__value">{{ counts.closed }}</div>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="bw-empty">
      <div class="bw-empty__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      </div>
      <p class="bw-empty__desc">Loading enquiries…</p>
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="bw-empty">
      <div class="bw-empty__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3 class="bw-empty__title">Could not load enquiries</h3>
      <p class="bw-empty__desc">{{ fetchError }}</p>
      <button class="bw-btn bw-btn--ghost" @click="refresh">Retry</button>
    </div>

    <section v-else class="bw-card" style="padding: 0; overflow: hidden;">
      <div v-if="filtered.length === 0" class="bw-empty" style="border: 0; border-radius: 0;">
        <div class="bw-empty__icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h3 class="bw-empty__title">Nothing here</h3>
        <p class="bw-empty__desc">You'll see vendor replies to your enquiries in this tab.</p>
      </div>

      <ul v-else class="enq-list">
        <li v-for="e in filtered" :key="e.id" class="enq-item" @click="toggleThread(e.id)">
          <div class="enq-item__main">
            <div class="enq-item__title">
              <strong>{{ e.product }}</strong>
              <span class="enq-item__vendor">· {{ e.vendor }}</span>
              <span v-if="e.unread > 0" class="bw-chip bw-chip--primary">{{ e.unread }} new</span>
            </div>
            <div class="enq-item__msg">{{ e.lastMessage }}</div>
          </div>
          <div class="enq-item__meta">
            <span class="bw-chip" :class="statusChip(e.status)">{{ statusText(e.status) }}</span>
            <span class="enq-item__time">{{ e.lastMessageAt }}</span>
          </div>

          <!-- Thread drawer -->
          <div v-if="openId === e.id" class="enq-thread" @click.stop>
            <p v-if="threadError[e.id]" class="enq-thread__error">{{ threadError[e.id] }}</p>
            <div v-else-if="threadLoading[e.id]" class="enq-thread__loading">Loading messages…</div>
            <template v-else>
              <div
                v-for="msg in threads[e.id] || []"
                :key="msg.id"
                class="enq-thread__msg"
                :class="msg.isMine ? 'enq-thread__msg--mine' : 'enq-thread__msg--them'"
              >
                <div class="enq-thread__msg-body">{{ msg.body }}</div>
                <div class="enq-thread__msg-meta">{{ msg.sender }} · {{ msg.sentAt }}</div>
              </div>
            </template>

            <div class="enq-thread__reply">
              <textarea
                v-model="replyText[e.id]"
                class="bw-textarea"
                placeholder="Type your reply…"
                :disabled="sendingReply[e.id]"
              />
              <p v-if="replyError[e.id]" class="enq-thread__error">{{ replyError[e.id] }}</p>
              <div class="enq-thread__actions">
                <button
                  v-if="e.status !== 'closed'"
                  class="bw-btn bw-btn--subtle bw-btn--sm"
                  :disabled="closingId === e.id"
                  @click.stop="closeEnquiry(e)"
                >{{ closingId === e.id ? 'Closing…' : 'Close' }}</button>
                <button
                  class="bw-btn bw-btn--primary bw-btn--sm"
                  :disabled="!replyText[e.id]?.trim() || sendingReply[e.id]"
                  @click.stop="sendReply(e)"
                >{{ sendingReply[e.id] ? 'Sending…' : 'Send reply' }}</button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

interface Enquiry {
  id: string
  product: string
  productSlug: string
  vendor: string
  subject: string
  lastMessage: string
  lastMessageAt: string
  status: 'open' | 'awaiting-reply' | 'closed'
  unread: number
}

interface ThreadMessage {
  id: string
  body: string
  sender: string
  sentAt: string
  isMine: boolean
}

const { currentUser } = useAuth()

const { data, pending, error, refresh } = await useFetch<{ enquiries: Enquiry[] }>('/api/buyer/enquiries', {
  default: () => ({ enquiries: [] }),
})
const fetchError = computed(() => error.value?.data?.statusMessage || (error.value ? 'Unable to load enquiries. Please try again.' : null))

const enquiries = computed(() => data.value?.enquiries ?? [])
const tab = ref<'open' | 'awaiting-reply' | 'closed'>('open')

const counts = computed(() => ({
  open: enquiries.value.filter(e => e.status === 'open').length,
  'awaiting-reply': enquiries.value.filter(e => e.status === 'awaiting-reply').length,
  closed: enquiries.value.filter(e => e.status === 'closed').length,
}))

const filtered = computed(() => enquiries.value.filter(e => e.status === tab.value))

const openId = ref<string | null>(null)
const threads = ref<Record<string, ThreadMessage[]>>({})
const threadLoading = ref<Record<string, boolean>>({})
const threadError = ref<Record<string, string>>({})

async function loadThread(enquiryId: string) {
  if (threads.value[enquiryId]) return
  threadLoading.value[enquiryId] = true
  threadError.value[enquiryId] = ''
  try {
    const res = await $fetch<{ enquiry: any; messages: any[] }>(`/api/enquiries/${enquiryId}/messages`)
    threads.value[enquiryId] = res.messages.map(m => ({
      id: m.id,
      body: m.body,
      sender: m.sender_id === currentUser.value?.id ? 'You' : 'Vendor',
      sentAt: formatRelative(m.created_at),
      isMine: m.sender_id === currentUser.value?.id,
    }))
  } catch (e: any) {
    threadError.value[enquiryId] = e?.data?.statusMessage || 'Could not load messages.'
  } finally {
    threadLoading.value[enquiryId] = false
  }
}

function toggleThread(id: string) {
  openId.value = openId.value === id ? null : id
  if (openId.value) loadThread(id)
}

const replyText = ref<Record<string, string>>({})
const sendingReply = ref<Record<string, boolean>>({})
const replyError = ref<Record<string, string>>({})

async function sendReply(e: Enquiry) {
  const msg = replyText.value[e.id]?.trim()
  if (!msg) return
  sendingReply.value[e.id] = true
  replyError.value[e.id] = ''
  try {
    await $fetch(`/api/enquiries/${e.id}/messages`, { method: 'POST', body: { message: msg } })
    if (!threads.value[e.id]) threads.value[e.id] = []
    threads.value[e.id].push({
      id: `tmp-${Date.now()}`,
      body: msg,
      sender: 'You',
      sentAt: 'just now',
      isMine: true,
    })
    replyText.value[e.id] = ''
    const idx = (data.value?.enquiries ?? []).findIndex(x => x.id === e.id)
    if (idx >= 0 && data.value) data.value.enquiries[idx].status = 'awaiting-reply'
  } catch (err: any) {
    replyError.value[e.id] = err?.data?.statusMessage || 'Failed to send reply.'
  } finally {
    sendingReply.value[e.id] = false
  }
}

const closingId = ref<string | null>(null)

async function closeEnquiry(e: Enquiry) {
  closingId.value = e.id
  try {
    await $fetch(`/api/enquiries/${e.id}/status`, { method: 'PATCH', body: { status: 'closed' } })
    const idx = (data.value?.enquiries ?? []).findIndex(x => x.id === e.id)
    if (idx >= 0 && data.value) data.value.enquiries[idx].status = 'closed'
    openId.value = null
  } catch {
    // silently ignore
  } finally {
    closingId.value = null
  }
}

const statusChip = (s: Enquiry['status']) => ({
  open: 'bw-chip--info',
  'awaiting-reply': 'bw-chip--warning',
  closed: 'bw-chip--neutral',
}[s])

const statusText = (s: Enquiry['status']) => ({
  open: 'Open',
  'awaiting-reply': 'Awaiting reply',
  closed: 'Closed',
}[s])

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? '1 day ago' : `${days} days ago`
}
</script>

<style scoped>
.tab-kpi { cursor: pointer; text-align: left; font-family: inherit; }
.tab-kpi.is-active { border-color: var(--bw-primary); background: var(--bw-primary-50); }
.tab-kpi.is-active .bw-kpi__label { color: var(--bw-primary-600); }

.enq-list { list-style: none; margin: 0; padding: 0; }
.enq-item { padding: 16px 20px; border-bottom: 1px solid var(--bw-border); cursor: pointer; transition: background .15s; display: grid; grid-template-columns: 1fr auto; gap: 12px; }
.enq-item:hover { background: var(--bw-surface-2); }
.enq-item:last-child { border-bottom: none; }
.enq-item__main { min-width: 0; }
.enq-item__title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 0.95rem; }
.enq-item__vendor { color: var(--bw-text-muted); font-weight: 400; }
.enq-item__msg { color: var(--bw-text-muted); font-size: 0.88rem; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.enq-item__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.enq-item__time { font-size: 0.78rem; color: var(--bw-text-subtle); }

.enq-thread { grid-column: 1 / -1; margin-top: 14px; padding: 16px; background: var(--bw-surface-2); border-radius: 10px; cursor: default; display: flex; flex-direction: column; gap: 10px; }
.enq-thread__loading { font-size: 0.85rem; color: var(--bw-text-subtle); }
.enq-thread__error { font-size: 0.82rem; color: var(--bw-danger, #e53e3e); margin: 0; }
.enq-thread__msg { max-width: 80%; padding: 12px 14px; border-radius: 10px; font-size: 0.9rem; }
.enq-thread__msg--them { background: var(--bw-surface); border: 1px solid var(--bw-border); align-self: flex-start; }
.enq-thread__msg--mine { background: var(--bw-primary-50); border: 1px solid var(--bw-primary); align-self: flex-end; }
.enq-thread__msg-body { line-height: 1.5; }
.enq-thread__msg-meta { font-size: 0.72rem; color: var(--bw-text-subtle); margin-top: 4px; }
.enq-thread__reply { display: flex; flex-direction: column; gap: 8px; }
.enq-thread__actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
</style>
