<template>
  <div class="bw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">Enquiries</h1>
        <p class="bw-head__sub">Conversations with vendors about the apps you're evaluating.</p>
      </div>
    </header>

    <!-- Counters -->
    <div class="bw-kpis" style="grid-template-columns: repeat(3, 1fr); max-width: 640px;">
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

    <section class="bw-card" style="padding: 0; overflow: hidden;">
      <div v-if="filtered.length === 0" class="bw-empty" style="border: 0; border-radius: 0;">
        <div class="bw-empty__icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h3 class="bw-empty__title">Nothing here</h3>
        <p class="bw-empty__desc">You'll see vendor replies to your enquiries in this tab.</p>
      </div>

      <ul v-else class="enq-list">
        <li v-for="e in filtered" :key="e.id" class="enq-item" @click="openId = openId === e.id ? null : e.id">
          <div class="enq-item__main">
            <div class="enq-item__title">
              <strong>{{ e.product }}</strong>
              <span class="enq-item__vendor">· {{ e.vendor }}</span>
              <span v-if="e.unread" class="bw-chip bw-chip--primary">{{ e.unread }} new</span>
            </div>
            <div class="enq-item__msg">{{ e.lastMessage }}</div>
          </div>
          <div class="enq-item__meta">
            <span class="bw-chip" :class="statusChip(e.status)">{{ statusText(e.status) }}</span>
            <span class="enq-item__time">{{ e.lastMessageAt }}</span>
          </div>

          <!-- Thread drawer -->
          <div v-if="openId === e.id" class="enq-thread" @click.stop>
            <div class="enq-thread__msg enq-thread__msg--them">{{ e.lastMessage }}</div>
            <div class="enq-thread__reply">
              <textarea class="bw-textarea" placeholder="Type your reply…" />
              <div class="enq-thread__actions">
                <button class="bw-btn bw-btn--ghost bw-btn--sm" @click="schedule(e)">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/></svg>
                  Schedule demo
                </button>
                <button v-if="e.status !== 'closed'" class="bw-btn bw-btn--subtle bw-btn--sm" @click="closeEnquiry(e.id)">Close</button>
                <button class="bw-btn bw-btn--primary bw-btn--sm">Send reply</button>
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
import { useBuyerData, type Enquiry } from '~/composables/useBuyerData'

const { enquiries, closeEnquiry } = useBuyerData()

const tab = ref<'open' | 'awaiting-reply' | 'closed'>('open')
const openId = ref<string | null>(null)

const counts = computed(() => ({
  open: enquiries.value.filter(e => e.status === 'open').length,
  'awaiting-reply': enquiries.value.filter(e => e.status === 'awaiting-reply').length,
  closed: enquiries.value.filter(e => e.status === 'closed').length
}))

const filtered = computed(() => enquiries.value.filter(e => e.status === tab.value))

const statusChip = (s: Enquiry['status']) => ({
  open: 'bw-chip--info',
  'awaiting-reply': 'bw-chip--warning',
  closed: 'bw-chip--neutral'
}[s])
const statusText = (s: Enquiry['status']) => ({ open: 'Open', 'awaiting-reply': 'Awaiting reply', closed: 'Closed' }[s])

const schedule = (e: Enquiry) => {
  alert(`Opening calendar to schedule a demo with ${e.vendor}`)
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

.enq-thread { grid-column: 1 / -1; margin-top: 14px; padding: 16px; background: var(--bw-surface-2); border-radius: 10px; cursor: default; }
.enq-thread__msg { background: var(--bw-surface); border: 1px solid var(--bw-border); padding: 12px 14px; border-radius: 10px; font-size: 0.9rem; max-width: 80%; margin-bottom: 12px; }
.enq-thread__reply { display: flex; flex-direction: column; gap: 10px; }
.enq-thread__actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
</style>
