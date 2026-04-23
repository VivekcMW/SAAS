<template>
  <div class="vw copilot">
    <header class="bw-head">
      <div>
        <h1 class="bw-head__title">
          <span class="vw-ai-chip">AI</span>
          Copilot
        </h1>
        <p class="bw-head__sub">Ask anything about your leads, listings, pricing, or competitors.</p>
      </div>
      <div class="bw-head__actions">
        <button class="bw-btn bw-btn--subtle bw-btn--sm" @click="ai.reset()">Clear chat</button>
      </div>
    </header>

    <div class="vw-chat bw-card">
      <div ref="logEl" class="vw-chat__log">
        <div v-for="m in ai.messages.value" :key="m.id" class="vw-chat__msg" :class="m.role === 'user' ? 'vw-chat__msg--user' : 'vw-chat__msg--ai'">
          <div class="vw-chat__bubble">{{ m.content }}</div>
        </div>
        <div v-if="ai.typing.value" class="vw-chat__msg vw-chat__msg--ai">
          <div class="vw-chat__bubble vw-chat__typing">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <div class="copilot-suggest">
        <button v-for="s in suggestions" :key="s" type="button" class="cp-chip" @click="send(s)">{{ s }}</button>
      </div>

      <form class="vw-chat__composer" @submit.prevent="submit">
        <input v-model="q" class="vw-chat__input" placeholder="Ask the copilot…" />
        <button class="bw-btn bw-btn--primary" type="submit" :disabled="!q.trim() || ai.typing.value">Send</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
const ai = useAICopilot()
const q = ref('')
const logEl = ref<HTMLElement | null>(null)

const suggestions = [
  'Who should I reply to first today?',
  'How do I improve my listing health?',
  'Should I discount Acme CRM this month?',
  'How do I compare to HubSpot?',
  'Why did demos drop last week?'
]

async function send(text: string) {
  q.value = ''
  await ai.ask(text)
  await nextTick()
  if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
}
function submit() {
  if (q.value.trim()) send(q.value)
}
watch(() => ai.messages.value.length, async () => {
  await nextTick()
  if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
})
</script>

<style scoped>
.copilot .vw-chat { min-height: 540px; }
.copilot-suggest { padding: 8px 16px 0; display: flex; gap: 6px; flex-wrap: wrap; }
.cp-chip {
  padding: 5px 10px; background: var(--vw-ai-50);
  color: var(--vw-ai-text); border: 1px solid var(--vw-ai-100);
  border-radius: 999px; font-size: 0.78rem; cursor: pointer;
}
.cp-chip:hover { background: var(--vw-ai-100); }

.vw-chat__typing { display: inline-flex; gap: 4px; padding: 12px 16px; }
.vw-chat__typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--vw-text-subtle); animation: blink 1.2s infinite; }
.vw-chat__typing span:nth-child(2) { animation-delay: 0.2s; }
.vw-chat__typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
</style>
