import { ref } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  at: string
}

const SEED_CONTENT = "Hi — I'm your AI copilot. I can help you find the right SaaS tools, discuss your software stack, answer questions about any listing, or help you evaluate vendors. What are you looking to tackle?"

// Used by Content assistant — template-based (no dedicated server endpoint yet)
async function generateListingCopy(input: { product: string; audience: string; integrations: string }) {
  const title = `${input.product} — built for ${input.audience}`
  const description = `${input.product} helps ${input.audience} move faster without stitching together five tools. With native integrations for ${input.integrations || 'your existing stack'}, teams get up and running in a day — not a quarter.\n\nYou get a clean workspace, smart automations, and the kind of responsive support that actually answers in hours, not days. Priced to scale with your team, and backed by SOC 2 Type II compliance out of the box.`
  const bullets = [
    `Ready for ${input.audience} on day one — no consultant required`,
    `Works with the tools you already use (${input.integrations || 'Slack, Google, Jira, and more'})`,
    `Enterprise-grade security with SOC 2 Type II and SSO included`
  ]
  return { title, description, bullets }
}

// Used by Reviews / Leads for a quick rewrite — template-based
async function rewriteDraft(original: string, tone: 'warm' | 'professional' | 'concise') {
  const map = {
    warm: 'Hey there — thanks so much for reaching out! ',
    professional: 'Hello, thank you for your message. ',
    concise: ''
  }
  return map[tone] + original
}

export function useAICopilot() {
  const messages = ref<ChatMessage[]>([
    { id: 'seed', role: 'ai', content: SEED_CONTENT, at: 'Now' }
  ])
  const typing = ref(false)
  const sessionId = ref<string | null>(null)

  async function ask(q: string) {
    if (!q.trim()) return
    messages.value.push({ id: 'u' + Date.now(), role: 'user', content: q, at: 'Just now' })
    typing.value = true

    try {
      const data = await $fetch<{ sessionId: string; reply: string; suggestedApps?: string[] }>(
        '/api/ai/copilot',
        {
          method: 'POST',
          body: { message: q, sessionId: sessionId.value ?? undefined }
        }
      )
      sessionId.value = data.sessionId
      messages.value.push({ id: 'a' + Date.now(), role: 'ai', content: data.reply, at: 'Just now' })
    } catch (err: unknown) {
      const code = (err as { statusCode?: number })?.statusCode
      let reply = 'Something went wrong. Please try again.'
      if (code === 401) reply = 'Please sign in to use the AI copilot.'
      else if (code === 429) reply = 'Rate limit reached — please wait a moment and try again.'
      messages.value.push({ id: 'e' + Date.now(), role: 'ai', content: reply, at: 'Just now' })
    } finally {
      typing.value = false
    }
  }

  function reset() {
    messages.value = [{ id: 'seed', role: 'ai', content: SEED_CONTENT, at: 'Now' }]
    sessionId.value = null
  }

  return { messages, typing, ask, reset, generateListingCopy, rewriteDraft }
}
