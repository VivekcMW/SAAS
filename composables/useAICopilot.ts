import { ref } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  at: string
}

// Mock AI replies. Keyword-based so the demo feels responsive.
const CANNED: { match: RegExp; reply: string }[] = [
  {
    match: /lead|reply|response/i,
    reply: 'You have 2 hot leads waiting over 4 hours: **Priya Shah (Nimbus Retail)** and **Yuki Tanaka (Solace Health)**. Both have drafts ready — open them in Leads. A reply within the next hour should still feel timely.'
  },
  {
    match: /listing|improve|health|score/i,
    reply: '**Acme Inbox** is your lowest-health listing (64/100). Three fixes in order of impact:\n\n1. Expand the description to 150+ words (currently 62)\n2. Add your SOC 2 badge — it\'s a top reason buyers bounce\n3. List 5 key integrations (Slack, Zendesk, Jira, HubSpot, Salesforce)\n\nI can draft all three in the Content assistant if you want.'
  },
  {
    match: /price|pricing|discount|promo/i,
    reply: 'Your 20% discount on Acme CRM is converting well (CPL $14, vs category avg $22). Competitors are running 25% offers for the next 10 days — consider matching to stay visible. Want me to draft the promo copy?'
  },
  {
    match: /review|feedback|rating/i,
    reply: 'You have 1 unanswered neutral review (Oakline Legal, 3★) and 1 negative (Truenorth Co, 2★). Vendor replies within 48 hours lift your listing rating by an average of 0.3★. I\'ve drafted tone-matched replies in the Reviews tab.'
  },
  {
    match: /competitor|similar|hubspot|pipedrive/i,
    reply: '42% of buyers who view Acme CRM also view HubSpot. Their main edge is marketplace depth (1,000+ integrations). You beat them on pricing (from $29 vs $45) and onboarding speed — these should be higher in your listing copy.'
  },
  {
    match: /analytic|funnel|conversion|traffic/i,
    reply: 'Your funnel this month:\n- 19.5k views → 2.3k saves (12%)\n- 2.3k saves → 114 enquiries (4.9%)\n- 114 → 42 demos (37%)\n- 42 → 11 deals (26%)\n\nSaves → enquiries is your weakest step (category median is 7%). The biggest lever: clearer "who this is for" on the listing hero.'
  },
  {
    match: /write|draft|copy|description|title/i,
    reply: 'I can draft listing copy from 3 bullets. Head to Content assistant — paste your product\'s core value, target buyer, and main integrations, and I\'ll generate a title + 120-word description + 3-bullet feature list in your brand voice.'
  }
]

function fallback(q: string) {
  return `Here's what I can help with right now:\n\n- "Who should I reply to first?"\n- "How do I improve my Acme Inbox listing?"\n- "What's my funnel looking like this month?"\n- "Draft a reply to the Oakline Legal review"\n- "How do I compare to HubSpot?"\n\n(You asked: "${q.trim().slice(0, 120)}" — try one of the above or ask in plain English.)`
}

export function useAICopilot() {
  const messages = ref<ChatMessage[]>([
    {
      id: 'seed',
      role: 'ai',
      content: 'Hi — I\'m your vendor copilot. I can help you triage leads, improve listings, draft replies, analyse your funnel, and compare against similar vendors. What do you want to tackle?',
      at: 'Now'
    }
  ])
  const typing = ref(false)

  async function ask(q: string) {
    if (!q.trim()) return
    messages.value.push({ id: 'u' + Date.now(), role: 'user', content: q, at: 'Just now' })
    typing.value = true

    // Simulated thinking delay
    await new Promise(r => setTimeout(r, 650))

    const hit = CANNED.find(c => c.match.test(q))
    const reply = hit ? hit.reply : fallback(q)

    messages.value.push({ id: 'a' + Date.now(), role: 'ai', content: reply, at: 'Just now' })
    typing.value = false
  }

  function reset() {
    messages.value = messages.value.slice(0, 1)
  }

  // Used by Content assistant
  async function generateListingCopy(input: { product: string; audience: string; integrations: string }) {
    await new Promise(r => setTimeout(r, 900))
    const title = `${input.product} — built for ${input.audience}`
    const description = `${input.product} helps ${input.audience} move faster without stitching together five tools. With native integrations for ${input.integrations || 'your existing stack'}, teams get up and running in a day — not a quarter.\n\nYou get a clean workspace, smart automations, and the kind of responsive support that actually answers in hours, not days. Priced to scale with your team, and backed by SOC 2 Type II compliance out of the box.`
    const bullets = [
      `Ready for ${input.audience} on day one — no consultant required`,
      `Works with the tools you already use (${input.integrations || 'Slack, Google, Jira, and more'})`,
      `Enterprise-grade security with SOC 2 Type II and SSO included`
    ]
    return { title, description, bullets }
  }

  // Used by Reviews / Leads for a quick rewrite
  async function rewriteDraft(original: string, tone: 'warm' | 'professional' | 'concise') {
    await new Promise(r => setTimeout(r, 500))
    const map = {
      warm: 'Hey there — thanks so much for reaching out! ',
      professional: 'Hello, thank you for your message. ',
      concise: ''
    }
    return map[tone] + original
  }

  return { messages, typing, ask, reset, generateListingCopy, rewriteDraft }
}
