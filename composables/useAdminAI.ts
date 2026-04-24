import { ref } from 'vue'

export interface AdminChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  at: string
}

const CANNED: { match: RegExp; reply: string }[] = [
  {
    match: /pending|approve|review|queue/i,
    reply: '**4 apps in review queue.** My recommendations:\n\n- **Nebula Analytics** — approve (risk 12, confidence 96%)\n- **FlowDesk Pro** — approve (risk 18, confidence 92%)\n- **MagicCRM AI** — manual review (risk 68) — aggressive claims, new domain\n- **QuickBill** — reject (risk 84) — likely trademark infringement on "QuickBills Pro"\n\nWant me to auto-approve the two low-risk ones?'
  },
  {
    match: /fraud|fake|spam|suspicious|anomal/i,
    reply: 'Top fraud signals right now:\n\n1. **Review burst on MagicCRM AI** — 7 five-star reviews in 40 min from week-old accounts. Likely manipulation.\n2. **Signup spike from one subnet** — 12 signups in 6h from a single /24. Could be a team or farming.\n3. **Payment retry rate** — 4.1% (baseline 2.2%). Mostly expiry, not fraud.\n\nRecommend: quarantine the MagicCRM reviews pending human review.'
  },
  {
    match: /user|signup|buyer|vendor|suspend/i,
    reply: '8 platform users — 4 buyers, 3 vendors, 1 admin. **BillCorp** is already suspended (AI trust 18). **SmartSell LLC** is pending review (trust 42, domain <2 weeks old). All others are healthy (trust >85).'
  },
  {
    match: /revenue|mrr|money|billing|payment/i,
    reply: 'MRR is **$61.4k**, up 45.8% in 12 months. Platform fees run **$14.3k/mo** (23% take). Growth is driven by vendor mix (8 paid vendors this quarter). Top earners: Acme Technologies, Nebula Data Co.'
  },
  {
    match: /flag|abuse|content|moderat/i,
    reply: '4 open flags. AI-actioned already:\n\n- 1 spam review auto-removed (98% confidence)\n- 1 abusive review held for human review\n- 1 fake-claim listing held\n- 1 off-topic DM\n\nClear queue in ~10 min.'
  },
  {
    match: /dispute|refund|chargeback/i,
    reply: '2 active disputes:\n\n- **Oakline Legal vs Acme CRM** ($290) — buyer within refund window, feature failure documented. I recommend full refund.\n- **Truenorth vs Acme Inbox** (review dispute) — reviewer was on Free tier where SSO isn\'t available. Keep review, attach vendor response.'
  },
  {
    match: /trend|growth|forecast|predict/i,
    reply: 'Platform trends (last 30 days):\n\n- Signups: +18% (strong)\n- Listings: +6 new this week\n- Enquiries: +23%\n- Deals closed: +11%\n\nForecast: if growth holds, MRR hits **$72k by end of next quarter**. Main risk: vendor churn — 2 Free-tier vendors went inactive.'
  },
  {
    match: /health|platform|system|overview/i,
    reply: 'Platform is healthy. All SLAs green. 1 high-severity anomaly (review burst), 2 medium. Queue: 4 pending apps, 4 flags, 2 disputes. Nothing is on fire. Focus your next 30 min on the review queue.'
  }
]

function fallback(q: string) {
  return `Try one of:\n\n- "What\'s in the review queue?"\n- "Any fraud signals right now?"\n- "How is MRR trending?"\n- "Summarise open disputes"\n- "Platform health"\n\n(You asked: "${q.trim().slice(0, 120)}")`
}

export function useAdminAI() {
  const messages = ref<AdminChatMessage[]>([
    { id: 'seed', role: 'ai', content: 'I\'m your admin copilot. I can triage the review queue, flag fraud, summarise disputes, and surface trends. Ask me anything.', at: 'now' }
  ])
  const typing = ref(false)

  async function ask(q: string) {
    if (!q.trim()) return
    messages.value.push({ id: `u-${Date.now()}`, role: 'user', content: q, at: 'now' })
    typing.value = true
    await new Promise(r => setTimeout(r, 650))
    const match = CANNED.find(c => c.match.test(q))
    const reply = match ? match.reply : fallback(q)
    messages.value.push({ id: `a-${Date.now()}`, role: 'ai', content: reply, at: 'now' })
    typing.value = false
  }

  function reset() {
    messages.value = messages.value.slice(0, 1)
  }

  async function classifyContent(text: string) {
    await new Promise(r => setTimeout(r, 400))
    const lower = text.toLowerCase()
    if (/http|www\.|click here|buy now/i.test(lower)) return { category: 'spam', confidence: 96 }
    if (/garbage|scam|idiot|terrible|awful|stupid/i.test(lower)) return { category: 'abuse', confidence: 82 }
    if (/guarantee|10x|magic|miracle/i.test(lower)) return { category: 'fake', confidence: 74 }
    return { category: 'safe', confidence: 88 }
  }

  return { messages, typing, ask, reset, classifyContent }
}
