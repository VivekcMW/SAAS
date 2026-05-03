<template>
  <div class="vw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Leads</h1>
        <p class="bw-head__sub">Buyer enquiries with AI-drafted replies and intent detection.</p>
      </div>
      <div class="bw-head__actions">
        <span class="vw-ai-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
          AI intent detection on
        </span>
      </div>
    </header>

    <div class="bw-tabs">
      <button v-for="t in tabs" :key="t.key" type="button" class="bw-tab" :class="{ 'is-active': filter === t.key }" @click="filter = t.key">
        {{ t.label }}
        <span class="bw-tab__count">{{ t.count() }}</span>
      </button>
    </div>

    <div class="vw-thread">
      <!-- List -->
      <div class="vw-thread__list">
        <div v-if="leadsLoading" class="bw-empty" style="padding: 32px 16px; border: none;">Loading leads…</div>
        <div v-else-if="list.length === 0" class="bw-empty" style="padding: 32px 16px; border: none;">No leads here.</div>
        <div
          v-for="l in list"
          :key="l.id"
          class="vw-thread__item"
          :class="{ 'is-active': active?.id === l.id }"
          @click="select(l.id)"
        >
          <div class="thread-item__top">
            <strong>{{ l.buyerName }}</strong>
            <span class="bw-chip" :class="tempChip(l.temperature)" style="font-size: 0.68rem; padding: 1px 7px;">{{ l.temperature }}</span>
          </div>
          <div class="thread-item__sub">{{ l.buyerCompany }} · {{ l.buyerSize }}</div>
          <div class="thread-item__subject">{{ l.subject }}</div>
          <div class="thread-item__foot">
            <span>{{ l.listingName }}</span>
            <span>{{ l.updatedAt }}</span>
          </div>
        </div>
      </div>

      <!-- Main -->
      <div v-if="active" class="vw-thread__main">
        <div class="thread-main__head">
          <div>
            <div class="thread-main__title">{{ active.subject }}</div>
            <div class="thread-main__sub">
              {{ active.buyerName }} · {{ active.buyerCompany }} ({{ active.buyerSize }})
              · re: <strong>{{ active.listingName }}</strong>
            </div>
          </div>
          <span class="bw-chip" :class="statusChip(active.status)">{{ active.status }}</span>
        </div>

        <div class="thread-main__body">
          <div v-for="m in active.messages" :key="m.id" class="msg" :class="`is-${m.from}`">
            <div class="msg__bubble">{{ m.body }}</div>
            <div class="msg__meta">{{ m.from === 'buyer' ? active.buyerName : 'You' }} · {{ m.at }}</div>
          </div>
        </div>

        <div class="thread-main__composer">
          <textarea v-model="reply" class="bw-textarea" placeholder="Write a reply… or click the AI draft →" rows="4" />
          <div class="composer-actions">
            <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="reply = ''">Clear</button>
            <button class="bw-btn bw-btn--primary bw-btn--sm" :disabled="!reply.trim()" @click="send">Send reply</button>
          </div>
        </div>
      </div>
      <div v-else class="vw-thread__main bw-empty" style="justify-content: center;">
        <p>Select a lead to view the conversation.</p>
      </div>

      <!-- AI sidecar -->
      <div v-if="active" class="vw-thread__ai">
        <div class="vw-ai-card">
          <div class="vw-ai-card__title">
            <span class="vw-ai-chip">AI</span>
            Lead summary
          </div>
          <p class="ai-body">{{ summary }}</p>
        </div>

        <div v-if="active.aiDraft" class="vw-ai-card" style="margin-top: 14px;">
          <div class="vw-ai-card__title">
            <span class="vw-ai-chip">AI</span>
            Draft reply
          </div>
          <p class="ai-draft">{{ active.aiDraft }}</p>
          <div class="ai-draft__actions">
            <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="active.aiDraft && useDraft(active.aiDraft)">Use this</button>
            <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="tone('warm')">Warmer</button>
            <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="tone('concise')">Shorter</button>
          </div>
        </div>

        <div class="bw-card" style="margin-top: 14px;">
          <h3 style="font-family: var(--f-ui); font-size: 0.9rem; margin: 0 0 8px;">Buyer signals</h3>
          <ul class="signals">
            <li>Company: {{ active.buyerCompany }} ({{ active.buyerSize }})</li>
            <li>Intent: <strong>{{ active.temperature }}</strong></li>
            <li>Matched listing: {{ active.listingName }}</li>
            <li>Source: Organic search</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const { leads, replyLead, loadLeads, loadLeadMessages, leadsLoading } = useVendorData()
const ai = useAICopilot()

onMounted(async () => {
  await loadLeads()
  if (leads.value[0]) activeId.value = leads.value[0].id
})

const filter = ref<'all' | 'new' | 'awaiting' | 'closed'>('all')
const activeId = ref<string | null>(null)
const reply = ref('')

const tabs = [
  { key: 'all' as const, label: 'All', count: () => leads.value.length },
  { key: 'new' as const, label: 'New', count: () => leads.value.filter(l => l.status === 'new').length },
  { key: 'awaiting' as const, label: 'Awaiting reply', count: () => leads.value.filter(l => l.status === 'awaiting').length },
  { key: 'closed' as const, label: 'Closed', count: () => leads.value.filter(l => l.status === 'closed').length }
]

const list = computed(() => filter.value === 'all' ? leads.value : leads.value.filter(l => l.status === filter.value))
const active = computed(() => leads.value.find(l => l.id === activeId.value) || null)

// Load messages when active thread changes
watch(activeId, async (id) => {
  if (id) await loadLeadMessages(id)
})

const summary = computed(() => {
  if (!active.value) return ''
  const l = active.value
  return `${l.buyerName}${l.buyerCompany ? ' from ' + l.buyerCompany : ''} is asking about ${l.listingName}. Intent looks ${l.temperature} based on ${l.messages.length} message(s) about ${l.subject.toLowerCase()}.`
})

function select(id: string) {
  activeId.value = id
  reply.value = ''
}
function tempChip(t: string) {
  if (t === 'hot') return 'bw-chip--danger'
  if (t === 'warm') return 'bw-chip--warning'
  return 'bw-chip--neutral'
}
function statusChip(s: string) {
  if (s === 'new') return 'bw-chip--primary'
  if (s === 'replied') return 'bw-chip--success'
  if (s === 'awaiting') return 'bw-chip--warning'
  return 'bw-chip--neutral'
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
</script>

<style scoped>
.thread-item__top { display: flex; justify-content: space-between; align-items: center; gap: 6px; font-size: 0.88rem; }
.thread-item__sub { font-size: 0.76rem; color: var(--vw-text-subtle); margin-top: 2px; }
.thread-item__subject { font-size: 0.82rem; color: var(--vw-text-muted); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.thread-item__foot { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--vw-text-subtle); margin-top: 6px; }

.thread-main__head { padding: 14px 18px; border-bottom: 1px solid var(--vw-border); display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.thread-main__title { font-family: var(--f-ui); font-weight: 700; font-size: 1rem; }
.thread-main__sub { font-size: 0.8rem; color: var(--vw-text-muted); margin-top: 2px; }

.thread-main__body { flex: 1; padding: 18px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; min-height: 200px; }
.msg { max-width: 75%; }
.msg.is-vendor { align-self: flex-end; }
.msg__bubble {
  padding: 10px 14px; border-radius: 14px; font-size: 0.9rem; line-height: 1.5;
  background: var(--vw-surface-2);
}
.msg.is-vendor .msg__bubble { background: var(--vw-primary); color: white; border-bottom-right-radius: 4px; }
.msg.is-buyer .msg__bubble { border-bottom-left-radius: 4px; }
.msg__meta { font-size: 0.7rem; color: var(--vw-text-subtle); margin-top: 4px; padding: 0 4px; }
.msg.is-vendor .msg__meta { text-align: right; }

.thread-main__composer { border-top: 1px solid var(--vw-border); padding: 12px 14px; }
.composer-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

.ai-body, .ai-draft { font-size: 0.85rem; line-height: 1.5; color: var(--vw-text); margin: 0; white-space: pre-line; }
.ai-draft__actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }

.signals { list-style: none; padding: 0; margin: 0; font-size: 0.82rem; color: var(--vw-text-muted); }
.signals li { padding: 4px 0; border-bottom: 1px solid var(--vw-border); }
.signals li:last-child { border: none; }
</style>
