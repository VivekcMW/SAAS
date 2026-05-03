import { computed, reactive, readonly, ref } from 'vue'

export type BuyerStatus = 'shortlisted' | 'evaluating' | 'demo-booked' | 'decided' | 'rejected'

export interface SavedApp {
  id: string
  slug: string
  name: string
  category: string
  logo: string
  color: string
  priceFrom: number
  rating: number
  reviews: number
  status: BuyerStatus
  savedAt: string
  note?: string
  integrations: string[]
  trial: boolean
  soc2: boolean
}

export interface Enquiry {
  id: string
  product: string
  productSlug: string
  vendor: string
  lastMessage: string
  lastMessageAt: string
  status: 'open' | 'awaiting-reply' | 'closed'
  unread: number
}

export interface BuyerReview {
  id: string
  product: string
  productSlug: string
  rating: number
  title: string
  body: string
  createdAt: string
  helpful: number
  vendorReplied: boolean
}

export interface Deal {
  id: string
  product: string
  productSlug: string
  title: string
  percentOff: number
  code: string
  expiresAt: string
  category: string
}

export interface DigestItem {
  id: string
  kind: 'new-app' | 'price-drop' | 'new-feature' | 'review'
  title: string
  description: string
  product?: string
  at: string
}

// ── Logo colour palette for apps without a logo ───────────────────────────
const LOGO_COLORS = ['#4A154B', '#111111', '#FF7A59', '#5E6AD2', '#1F8DED', '#0052CC', '#00B37E', '#E44D26']
function logoLetter(name: string) { return (name ?? '?')[0].toUpperCase() }
function logoColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (id.codePointAt(i) ?? 0) + ((h << 5) - h)
  }
  return LOGO_COLORS[Math.abs(h) % LOGO_COLORS.length]
}

// ── API response shape from GET /api/buyer/saved-apps ──────────────────────
interface SavedAppApiRow {
  id: string
  slug: string
  name: string
  provider: string
  category: string
  logo: string
  description: string
  pricing: { type: string; value?: number | null; period?: string | null }
  rating: number
  reviewCount: number
  tags: string[]
  integrations: string[]
  features: string[]
  certifications: string[]
  status: string
  note: string
  savedAt: string
}

// ── Module-level reactive state ────────────────────────────────────────────
const savedAppsLoaded = ref(false)
const savedAppsLoading = ref(false)

const state = reactive({
  savedApps: [] as SavedApp[],
  enquiries: [
    { id: 'e1', product: 'Slack', productSlug: 'slack', vendor: 'Slack Technologies', lastMessage: 'Your trial has been extended by 14 days.', lastMessageAt: '3 hours ago', status: 'open', unread: 1 },
    { id: 'e2', product: 'HubSpot', productSlug: 'hubspot', vendor: 'HubSpot Inc.', lastMessage: 'Demo scheduled for Apr 28, 3:00 PM.', lastMessageAt: '1 day ago', status: 'awaiting-reply', unread: 0 },
    { id: 'e3', product: 'Linear', productSlug: 'linear', vendor: 'Linear', lastMessage: 'Here is the enterprise pricing sheet you requested.', lastMessageAt: '2 days ago', status: 'open', unread: 2 },
    { id: 'e4', product: 'Intercom', productSlug: 'intercom', vendor: 'Intercom', lastMessage: 'Thanks for considering us.', lastMessageAt: '2 weeks ago', status: 'closed', unread: 0 }
  ] as Enquiry[],
  reviews: [
    { id: 'r1', product: 'Slack', productSlug: 'slack', rating: 5, title: 'Still the gold standard for team chat', body: 'Channels + threads + Slack Connect cover every use case we have across 3 orgs.', createdAt: '2026-04-12', helpful: 24, vendorReplied: true },
    { id: 'r2', product: 'Notion', productSlug: 'notion', rating: 4, title: 'Great docs, needs better offline', body: 'Love the flexibility, but the offline experience on mobile is still shaky.', createdAt: '2026-03-28', helpful: 11, vendorReplied: false }
  ] as BuyerReview[],
  deals: [
    { id: 'd1', product: 'Linear', productSlug: 'linear', title: '20% off annual plan', percentOff: 20, code: 'SAAS20LIN', expiresAt: '2026-05-31', category: 'Project mgmt' },
    { id: 'd2', product: 'Intercom', productSlug: 'intercom', title: '3 months free for startups', percentOff: 25, code: 'STARTUP3', expiresAt: '2026-06-30', category: 'Support' },
    { id: 'd3', product: 'Notion', productSlug: 'notion', title: '50% off team plan (6 mo)', percentOff: 50, code: 'TEAM50', expiresAt: '2026-05-15', category: 'Productivity' },
    { id: 'd4', product: 'HubSpot', productSlug: 'hubspot', title: 'Free onboarding ($2k value)', percentOff: 15, code: 'HSONBOARD', expiresAt: '2026-07-01', category: 'CRM' }
  ] as Deal[],
  digest: [
    { id: 'g1', kind: 'price-drop', title: 'Linear dropped its Standard plan price', description: '$8 → $7 per seat / month. Applies to new and existing customers.', product: 'Linear', at: 'Today' },
    { id: 'g2', kind: 'new-feature', title: 'Slack rolled out AI message summaries', description: 'Auto-summarise unread channels. Now available on Business+ plans.', product: 'Slack', at: 'Yesterday' },
    { id: 'g3', kind: 'new-app', title: 'Fresh in Productivity: Mem 2.0', description: 'AI-first notes app with long-context search. 4.6★ from early reviews.', at: '2 days ago' },
    { id: 'g4', kind: 'review', title: 'HubSpot picked up a detailed 5-star review from a company your size', description: '"Onboarding templates saved us 3 weeks" — Acme Corp (51–200 employees).', product: 'HubSpot', at: '3 days ago' }
  ] as DigestItem[]
})

function mapApiRow(r: SavedAppApiRow): SavedApp {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    logo: logoLetter(r.name),
    color: logoColor(r.id),
    priceFrom: r.pricing?.value ?? 0,
    rating: r.rating,
    reviews: r.reviewCount,
    status: (r.status as BuyerStatus) || 'shortlisted',
    savedAt: r.savedAt ? r.savedAt.slice(0, 10) : '',
    note: r.note || '',
    integrations: Array.isArray(r.integrations) ? r.integrations : [],
    trial: r.pricing?.type === 'trial' || r.pricing?.type === 'free',
    soc2: Array.isArray(r.certifications) && r.certifications.some(c => /soc\s*2/i.test(c))
  }
}

async function loadSavedApps() {
  if (savedAppsLoaded.value || savedAppsLoading.value) return
  savedAppsLoading.value = true
  try {
    const data = await $fetch<{ savedApps: SavedAppApiRow[] }>('/api/buyer/saved-apps')
    state.savedApps = (data.savedApps || []).map(mapApiRow)
    savedAppsLoaded.value = true
  } catch {
    // Not authenticated or network error — leave empty
  } finally {
    savedAppsLoading.value = false
  }
}

function resetSavedApps() {
  state.savedApps = []
  savedAppsLoaded.value = false
  savedAppsLoading.value = false
}

export const statusLabel: Record<BuyerStatus, string> = {
  shortlisted: 'Shortlisted',
  evaluating: 'Evaluating',
  'demo-booked': 'Demo booked',
  decided: 'Decided',
  rejected: 'Rejected'
}
export const statusTone: Record<BuyerStatus, string> = {
  shortlisted: 'info',
  evaluating: 'primary',
  'demo-booked': 'success',
  decided: 'success',
  rejected: 'neutral'
}

export const useBuyerData = () => {
  // Load saved apps from API on first call
  loadSavedApps()

  const kpis = computed(() => ({
    saved: state.savedApps.length,
    evaluating: state.savedApps.filter(a => a.status === 'evaluating' || a.status === 'shortlisted' || a.status === 'demo-booked').length,
    openEnquiries: state.enquiries.filter(e => e.status !== 'closed').length,
    reviews: state.reviews.length
  }))

  const updateStatus = async (id: string, status: BuyerStatus) => {
    const a = state.savedApps.find(x => x.id === id)
    if (a) {
      const prev = a.status
      a.status = status
      try {
        await $fetch(`/api/buyer/saved-apps/${id}`, { method: 'PATCH', body: { status } })
      } catch {
        a.status = prev
      }
    }
  }

  const removeApp = async (id: string) => {
    const i = state.savedApps.findIndex(x => x.id === id)
    if (i >= 0) {
      const removed = state.savedApps.splice(i, 1)[0]
      try {
        await $fetch('/api/user/favorites', { method: 'DELETE', body: { appId: id } })
      } catch {
        state.savedApps.splice(i, 0, removed)
      }
    }
  }

  const setNote = async (id: string, note: string) => {
    const a = state.savedApps.find(x => x.id === id)
    if (a) {
      const prev = a.note
      a.note = note
      try {
        await $fetch(`/api/buyer/saved-apps/${id}`, { method: 'PATCH', body: { note } })
      } catch {
        a.note = prev
      }
    }
  }

  const closeEnquiry = (id: string) => {
    const e = state.enquiries.find(x => x.id === id); if (e) e.status = 'closed'
  }

  return {
    state: readonly(state),
    savedApps: computed(() => state.savedApps),
    savedAppsLoading,
    enquiries: computed(() => state.enquiries),
    reviews: computed(() => state.reviews),
    deals: computed(() => state.deals),
    digest: computed(() => state.digest),
    kpis,
    updateStatus,
    removeApp,
    setNote,
    closeEnquiry,
    loadSavedApps,
    resetSavedApps
  }
}
