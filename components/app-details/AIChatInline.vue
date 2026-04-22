<script setup lang="ts">
import { nextTick, ref } from 'vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

const props = defineProps<{
  appId: string
  appName: string
}>()

const suggestions = [
  `Does ${props.appName} integrate with Slack?`,
  `Is ${props.appName} HIPAA compliant?`,
  `What's the difference vs the free plan?`,
  `Can I import data from a competitor?`
]

const messages = ref<ChatMessage[]>([])
const input = ref('')
const loading = ref(false)
const scrollEl = ref<HTMLElement | null>(null)

async function send(text?: string) {
  const q = (text ?? input.value).trim()
  if (!q || loading.value) return

  messages.value.push({ role: 'user', text: q })
  input.value = ''
  loading.value = true
  await scrollToBottom()

  try {
    // Phase 2 stub: derive a contextual answer from the summary endpoint.
    // Replace with a streaming chat endpoint when wiring a real LLM.
    const res = await $fetch<{ pitch: string; pros: string[]; cons: string[]; verdict: string }>(
      '/api/ai/app-summary',
      { method: 'POST', body: { appId: props.appId } }
    )
    const answer = composeAnswer(q, res)
    messages.value.push({ role: 'assistant', text: answer })
  } catch (e) {
    console.error(e)
    messages.value.push({
      role: 'assistant',
      text: "I'm having trouble answering that right now. Please try again."
    })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

function composeAnswer(
  q: string,
  data: { pitch: string; pros: string[]; cons: string[]; verdict: string }
): string {
  const lower = q.toLowerCase()
  if (/(price|cost|cheap|expensive|free)/.test(lower)) {
    return `On pricing: ${data.pros.find(p => /price|free|trial|tier/i.test(p)) || data.pitch}`
  }
  if (/(integrat|connect|api|zapier|slack)/.test(lower)) {
    return data.pros.find(p => /integrat|api|zapier/i.test(p)) || `${props.appName} offers a broad integration ecosystem via API and Zapier.`
  }
  if (/(secur|compli|gdpr|soc|hipaa|encrypt)/.test(lower)) {
    return data.pros.find(p => /secur|enterprise|compli|sso/i.test(p)) || `${props.appName} provides enterprise-grade security including SSO and role-based access.`
  }
  if (/(con|down|drawback|issue|problem|bad|complaint)/.test(lower)) {
    return `Common drawbacks reported: ${data.cons.slice(0, 2).join('; ')}.`
  }
  if (/(verdict|recommend|should i|worth)/.test(lower)) {
    return data.verdict
  }
  // Fallback: short pitch
  const strength = data.pros[0] ? ` One key strength: ${data.pros[0].toLowerCase()}.` : ''
  return `${data.pitch}${strength}`
}

async function scrollToBottom() {
  await nextTick()
  if (scrollEl.value) {
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
}

function clearChat() {
  messages.value = []
}
</script>

<template>
  <section class="ai-chat" aria-labelledby="ai-chat-title">
    <header class="chat-head">
      <span class="chat-badge">
        <Icon name="heroicons:chat-bubble-left-right" />
        Ask AI
      </span>
      <h2 id="ai-chat-title" class="chat-title">
        Ask anything about {{ appName }}
      </h2>
      <p class="chat-sub">Get instant, factual answers grounded in this app's data.</p>
    </header>

    <!-- Messages -->
    <div ref="scrollEl" class="chat-stream" :class="{ 'has-messages': messages.length > 0 }">
      <template v-if="messages.length === 0">
        <div class="chat-empty">
          <p class="empty-label">Try asking…</p>
          <div class="suggestion-list">
            <button
              v-for="s in suggestions"
              :key="s"
              class="suggestion-chip"
              @click="send(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="(m, i) in messages"
          :key="i"
          :class="['msg', `msg-${m.role}`]"
        >
          <div class="msg-avatar">
            <Icon v-if="m.role === 'assistant'" name="heroicons:sparkles" />
            <Icon v-else name="heroicons:user" />
          </div>
          <div class="msg-bubble">{{ m.text }}</div>
        </div>

        <div v-if="loading" class="msg msg-assistant">
          <div class="msg-avatar"><Icon name="heroicons:sparkles" /></div>
          <div class="msg-bubble typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </template>
    </div>

    <!-- Input -->
    <form class="chat-input" @submit.prevent="send()">
      <Icon name="heroicons:chat-bubble-oval-left" class="input-icon" />
      <input
        v-model="input"
        type="text"
        :placeholder="`Ask anything about ${appName}…`"
        class="input-field"
        :disabled="loading"
        autocomplete="off"
      />
      <button
        v-if="messages.length > 0"
        type="button"
        class="clear-btn"
        :title="'Clear conversation'"
        @click="clearChat"
      >
        <Icon name="heroicons:trash" />
      </button>
      <button
        type="submit"
        class="send-btn"
        :disabled="!input.trim() || loading"
        aria-label="Send"
      >
        <Icon name="heroicons:paper-airplane" />
      </button>
    </form>

    <p class="chat-disclaimer">
      <Icon name="heroicons:information-circle" />
      AI may make mistakes. Verify important details on the vendor's website.
    </p>
  </section>
</template>

<style scoped>
.ai-chat {
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 20px;
  margin: 24px 0;
}

.chat-head { margin-bottom: 16px; }

.chat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff3e6;
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.chat-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 4px; }
.chat-sub { font-size: 13px; color: #6b7280; margin: 0; }

.chat-stream {
  min-height: 120px;
  max-height: 380px;
  overflow-y: auto;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  margin-bottom: 12px;
}

.chat-stream.has-messages { background: #ffffff; }

.chat-empty { text-align: left; }
.empty-label {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px;
  font-weight: 600;
}

.suggestion-list { display: flex; flex-wrap: wrap; gap: 6px; }

.suggestion-chip {
  background: #ffffff;
  border: 0.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}

.suggestion-chip:hover {
  border-color: #ff8838;
  background: #fffaf5;
  color: #b45309;
}

.msg {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.msg-user { flex-direction: row-reverse; }

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff3e6;
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.msg-user .msg-avatar { background: #f3f4f6; color: #6b7280; }

.msg-bubble {
  background: #f3f4f6;
  color: #111827;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 80%;
  word-wrap: break-word;
}

.msg-user .msg-bubble {
  background: #ff8838;
  color: #ffffff;
}

.msg-bubble.typing { display: flex; gap: 4px; padding: 12px 14px; }
.msg-bubble.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9ca3af;
  animation: bounce 1.2s infinite ease-in-out;
}
.msg-bubble.typing span:nth-child(2) { animation-delay: 0.15s; }
.msg-bubble.typing span:nth-child(3) { animation-delay: 0.3s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-4px); opacity: 1; }
}

/* Input */
.chat-input {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 6px 4px 14px;
  background: #ffffff;
  transition: border-color 150ms ease;
}

.chat-input:focus-within { border-color: #ff8838; }

.input-icon { color: #9ca3af; font-size: 18px; flex-shrink: 0; }

.input-field {
  flex: 1;
  border: 0;
  background: transparent;
  font-size: 14px;
  padding: 8px 4px;
  color: #111827;
  outline: none;
}

.clear-btn,
.send-btn {
  border: 0;
  border-radius: 999px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.clear-btn { background: transparent; color: #9ca3af; }
.clear-btn:hover { background: #f3f4f6; color: #6b7280; }

.send-btn { background: #ff8838; color: #ffffff; }
.send-btn:hover:not(:disabled) { background: #e57320; }
.send-btn:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

.chat-disclaimer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  margin: 8px 0 0;
}
</style>
