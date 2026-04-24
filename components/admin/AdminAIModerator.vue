<template>
  <div class="aw">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title"><span class="aw-ai-chip">AI</span> AI moderator</h1>
        <p class="bw-head__sub">Unified AI queue across apps, reviews, and disputes. Ask the copilot below.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--ghost" @click="ai.reset()">Clear chat</button>
      </div>
    </header>

    <div class="mod-grid">
      <!-- Chat -->
      <section class="bw-card chat-card">
        <div class="chat-log">
          <div v-for="m in ai.messages.value" :key="m.id" class="chat-msg" :class="`chat-msg--${m.role}`">
            <div class="chat-bubble" v-html="render(m.content)" />
          </div>
          <div v-if="ai.typing.value" class="chat-msg chat-msg--ai">
            <div class="chat-bubble chat-bubble--typing"><span /><span /><span /></div>
          </div>
        </div>
        <form class="chat-input" @submit.prevent="send">
          <input v-model="q" placeholder="Ask: What's in the review queue? Any fraud signals?" />
          <button type="submit" class="bw-btn bw-btn--primary" :disabled="!q.trim()">Send</button>
        </form>
        <div class="chat-chips">
          <button v-for="c in chips" :key="c" class="chip-btn" @click="ask(c)">{{ c }}</button>
        </div>
      </section>

      <!-- AI-actionable queue -->
      <aside class="bw-card">
        <h2 class="bw-card__title">AI-actionable items</h2>
        <ul class="ai-queue">
          <li v-for="a in actionable" :key="a.id">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ a.title }}</div>
              <div style="font-size: 0.76rem; color: var(--aw-text-subtle);">{{ a.detail }}</div>
            </div>
            <span class="aw-risk" :class="a.band">{{ a.conf }}%</span>
          </li>
        </ul>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--aw-border); display: flex; gap: 8px;">
          <button class="bw-btn bw-btn--primary bw-btn--sm" style="flex: 1;">Apply all ≥90%</button>
          <button class="bw-btn bw-btn--ghost bw-btn--sm" style="flex: 1;">Review each</button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const ai = useAdminAI()
const { pendingApps, flags } = useAdminData()

const q = ref('')
const chips = [
  'What\'s in the review queue?',
  'Any fraud signals right now?',
  'Summarise open disputes',
  'Platform health'
]

const actionable = computed(() => {
  const items: { id: string; title: string; detail: string; conf: number; band: string }[] = []
  pendingApps.value.filter(a => a.status === 'pending').forEach(a => {
    items.push({ id: a.id, title: `${a.name} · ${a.aiRecommendation}`, detail: `Risk ${a.aiRiskScore} · ${a.vendorName}`, conf: a.aiConfidence, band: band(a.aiConfidence) })
  })
  flags.value.filter(f => f.status === 'open').forEach(f => {
    items.push({ id: f.id, title: `${f.type} · ${f.aiAction}`, detail: f.aiCategory, conf: f.aiConfidence, band: band(f.aiConfidence) })
  })
  return items.sort((a, b) => b.conf - a.conf)
})

function band(c: number) { return c >= 90 ? 'aw-risk--low' : c >= 75 ? 'aw-risk--med' : 'aw-risk--high' }

async function send() {
  const text = q.value
  q.value = ''
  await ai.ask(text)
}
async function ask(t: string) { q.value = t; await send() }

function render(md: string) {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n- /g, '<br>• ')
    .replace(/\n/g, '<br>')
}
</script>

<style scoped>
.mod-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; }
@media (max-width: 960px) { .mod-grid { grid-template-columns: 1fr; } }

.chat-card { display: flex; flex-direction: column; height: 640px; }
.chat-log { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 10px; }
.chat-msg { display: flex; }
.chat-msg--user { justify-content: flex-end; }
.chat-bubble { max-width: 78%; padding: 10px 14px; border-radius: 14px; font-size: 0.9rem; line-height: 1.5; }
.chat-msg--ai .chat-bubble { background: var(--aw-accent-50); color: var(--aw-accent-text); border-bottom-left-radius: 4px; }
.chat-msg--user .chat-bubble { background: #111827; color: white; border-bottom-right-radius: 4px; }
.chat-bubble--typing { display: inline-flex; gap: 4px; }
.chat-bubble--typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--aw-accent); animation: bounce 1.2s infinite; }
.chat-bubble--typing span:nth-child(2) { animation-delay: 0.15s; }
.chat-bubble--typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }

.chat-input { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid var(--aw-border); }
.chat-input input { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--aw-border); background: var(--aw-surface); font: inherit; }
.chat-input input:focus { outline: none; border-color: var(--aw-accent); }

.chat-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.chip-btn { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--aw-border); background: var(--aw-surface); font-size: 0.78rem; cursor: pointer; color: var(--aw-text-muted); }
.chip-btn:hover { border-color: var(--aw-accent); color: var(--aw-accent); }

.ai-queue { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.ai-queue li { display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--aw-surface-2); border-radius: 8px; }
</style>
