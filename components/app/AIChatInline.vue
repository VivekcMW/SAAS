<template>
  <div class="aic">
    <div class="aic-header">
      <div class="aic-header-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div class="aic-header-text">
        <h3 class="aic-header-title">Ask about {{ appName }}</h3>
        <p class="aic-header-sub">AI-powered answers about this product</p>
      </div>
    </div>

    <!-- Message thread -->
    <div ref="messagesEl" class="aic-messages">
      <div v-for="msg in messages" :key="msg.id" class="aic-msg" :class="`aic-msg--${msg.role}`">
        <div class="aic-msg__bubble">{{ msg.content }}</div>
      </div>
      <div v-if="typing" class="aic-msg aic-msg--ai">
        <div class="aic-msg__bubble aic-msg__bubble--typing">
          <span /><span /><span />
        </div>
      </div>
    </div>

    <!-- Suggested questions (initial state) -->
    <div v-if="messages.length === 1 && !typing" class="aic-suggestions">
      <button
        v-for="q in suggestedQuestions"
        :key="q"
        class="aic-suggestion"
        @click="askQuestion(q)"
      >
        {{ q }}
      </button>
    </div>

    <!-- Input -->
    <form class="aic-input-row" @submit.prevent="handleSubmit">
      <input
        ref="inputEl"
        v-model="draft"
        class="aic-input"
        type="text"
        placeholder="Ask a question about this product…"
        :disabled="typing"
        maxlength="400"
        autocomplete="off"
      >
      <button type="submit" class="aic-send" :disabled="!draft.trim() || typing" aria-label="Send">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
    <p class="aic-footer">Powered by AI · Answers may not be 100% accurate</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

interface Props {
  appId: string
  appName: string
  appCategory?: string
  appDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  appCategory: '',
  appDescription: '',
})

interface Message { id: string; role: 'user' | 'ai'; content: string }

const messages = ref<Message[]>([
  {
    id: 'seed',
    role: 'ai',
    content: `Hi! I'm here to answer your questions about **${props.appName}**. Ask me about features, pricing, integrations, or how it compares to alternatives.`,
  },
])
const typing = ref(false)
const draft = ref('')
const sessionId = ref<string | null>(null)
const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const suggestedQuestions = computed(() => [
  `What are the main features of ${props.appName}?`,
  `How does ${props.appName} compare to alternatives?`,
  `Is there a free plan available?`,
  `What integrations does ${props.appName} support?`,
])

async function askQuestion(q: string) {
  draft.value = q
  await handleSubmit()
}

async function handleSubmit() {
  const q = draft.value.trim()
  if (!q || typing.value) return
  draft.value = ''

  messages.value.push({ id: `u${Date.now()}`, role: 'user', content: q })
  typing.value = true
  await scrollToBottom()

  try {
    const data = await $fetch<{ sessionId: string; reply: string }>('/api/ai/copilot', {
      method: 'POST',
      body: {
        message: q,
        sessionId: sessionId.value ?? undefined,
        context: {
          appId: props.appId,
          appName: props.appName,
          category: props.appCategory,
          description: props.appDescription,
        },
      },
    })
    sessionId.value = data.sessionId
    messages.value.push({ id: `a${Date.now()}`, role: 'ai', content: data.reply })
  } catch (err: any) {
    const code = err?.statusCode ?? err?.status
    let reply = 'Something went wrong. Please try again.'
    if (code === 401) reply = 'Please sign in to ask questions.'
    else if (code === 429) reply = 'Rate limit reached — please wait a moment and try again.'
    messages.value.push({ id: `e${Date.now()}`, role: 'ai', content: reply })
  } finally {
    typing.value = false
    await scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.aic {
  border: 1px solid var(--bw-border, #e2e8f0);
  border-radius: 14px;
  background: var(--bw-bg, #fff);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 560px;
}

.aic-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--bw-border, #e2e8f0);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
}
.aic-header-icon {
  width: 38px; height: 38px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.aic-header-title { font-size: 0.95rem; font-weight: 700; margin: 0 0 2px; }
.aic-header-sub { font-size: 0.76rem; opacity: 0.85; margin: 0; }

.aic-messages {
  flex: 1;
  min-height: 200px;
  max-height: 340px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}

.aic-msg { display: flex; }
.aic-msg--user { justify-content: flex-end; }
.aic-msg--ai { justify-content: flex-start; }

.aic-msg__bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.88rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.aic-msg--user .aic-msg__bubble {
  background: #6366f1;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.aic-msg--ai .aic-msg__bubble {
  background: var(--bw-bg-secondary, #f8fafc);
  color: var(--bw-text, #0f172a);
  border: 1px solid var(--bw-border, #e2e8f0);
  border-bottom-left-radius: 4px;
}

/* Typing indicator */
.aic-msg__bubble--typing {
  display: flex; align-items: center; gap: 5px; padding: 12px 16px;
}
.aic-msg__bubble--typing span {
  width: 7px; height: 7px; border-radius: 50%;
  background: #94a3b8;
  animation: bounce 1.2s ease-in-out infinite;
}
.aic-msg__bubble--typing span:nth-child(2) { animation-delay: 0.2s; }
.aic-msg__bubble--typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.aic-suggestions {
  display: flex; flex-direction: column; gap: 6px;
  padding: 0 16px 12px;
}
.aic-suggestion {
  text-align: left; padding: 8px 12px; border-radius: 8px;
  border: 1px solid var(--bw-border, #e2e8f0);
  font-size: 0.82rem; color: #6366f1; cursor: pointer;
  background: none; transition: all 0.15s;
}
.aic-suggestion:hover { background: #eef2ff; border-color: #c7d2fe; }

.aic-input-row {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--bw-border, #e2e8f0);
}
.aic-input {
  flex: 1; padding: 9px 14px; border-radius: 8px;
  border: 1px solid var(--bw-border, #e2e8f0);
  font-size: 0.88rem; background: var(--bw-bg, #fff);
  color: var(--bw-text, #0f172a); outline: none;
  transition: border-color 0.15s;
}
.aic-input:focus { border-color: #6366f1; }
.aic-input:disabled { opacity: 0.6; }

.aic-send {
  width: 38px; height: 38px; border-radius: 8px;
  background: #6366f1; color: #fff; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: background 0.15s;
}
.aic-send:hover:not(:disabled) { background: #4f46e5; }
.aic-send:disabled { opacity: 0.45; cursor: not-allowed; }

.aic-footer {
  text-align: center; font-size: 0.72rem;
  color: var(--bw-text-muted, #94a3b8);
  padding: 0 16px 10px; margin: 0;
}
</style>
