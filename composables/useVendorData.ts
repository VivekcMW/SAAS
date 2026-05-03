import { ref, computed } from 'vue'

export type ListingStatus = 'live' | 'draft' | 'pending' | 'paused'
export type LeadTemperature = 'hot' | 'warm' | 'cold'
export type LeadStatus = 'new' | 'replied' | 'awaiting' | 'closed'

export interface VendorListing {
  id: string
  name: string
  logo: string
  color: string
  category: string
  status: ListingStatus
  healthScore: number // 0-100
  views30d: number
  savesPct: number // % of viewers who save
  leads30d: number
  rating: number
  reviewsCount: number
  aiIssues: string[] // suggestions to improve
  priceFrom: number
}

export interface LeadMessage {
  id: string
  from: 'buyer' | 'vendor'
  body: string
  at: string // human-readable
}

export interface Lead {
  id: string
  buyerName: string
  buyerCompany: string
  buyerSize: string
  listingId: string
  listingName: string
  subject: string
  preview: string
  temperature: LeadTemperature
  status: LeadStatus
  updatedAt: string
  unread: number
  messages: LeadMessage[]
  aiDraft?: string
}

export interface VendorReview {
  id: string
  buyerName: string
  buyerCompany: string
  listingName: string
  rating: number
  title: string
  body: string
  sentiment: 'positive' | 'neutral' | 'negative'
  at: string
  replied: boolean
  aiReplyDraft: string
}

export interface Promotion {
  id: string
  listingName: string
  type: 'discount' | 'featured' | 'trial-extend'
  label: string
  status: 'active' | 'scheduled' | 'ended'
  spend: number
  budget: number
  clicks: number
  leads: number
  endsAt: string
  aiSuggestion?: string
}

export interface SimilarVendor {
  id: string
  name: string
  logo: string
  color: string
  category: string
  rating: number
  reviews: number
  priceFrom: number
  yourRank: 'above' | 'tied' | 'below'
  gap: string // what they have that you don't
  overlap: number // % of shared buyers
}

export interface FunnelStep {
  label: string
  value: number
  rate: number // vs previous step
}

export interface TodayAction {
  id: string
  title: string
  why: string
  cta: string
  to: string
  impact: 'high' | 'med' | 'low'
}

export interface InsightItem {
  id: string
  headline: string
  narrative: string
  delta: string
  tone: 'win' | 'risk' | 'neutral'
}

const listings = ref<VendorListing[]>([
  {
    id: 'l1',
    name: 'Acme CRM',
    logo: 'A',
    color: '#ff8838',
    category: 'CRM',
    status: 'live',
    healthScore: 82,
    views30d: 12450,
    savesPct: 14.2,
    leads30d: 86,
    rating: 4.6,
    reviewsCount: 312,
    aiIssues: ['Add 2 more screenshots', 'Price page is thin'],
    priceFrom: 29
  },
  {
    id: 'l2',
    name: 'Acme Inbox',
    logo: 'I',
    color: '#2563eb',
    category: 'Support',
    status: 'live',
    healthScore: 64,
    views30d: 5820,
    savesPct: 8.1,
    leads30d: 22,
    rating: 4.3,
    reviewsCount: 88,
    aiIssues: ['Description under 80 words', 'No integrations listed', 'Missing SOC 2 badge'],
    priceFrom: 19
  },
  {
    id: 'l3',
    name: 'Acme Forms',
    logo: 'F',
    color: '#10b981',
    category: 'Productivity',
    status: 'draft',
    healthScore: 38,
    views30d: 0,
    savesPct: 0,
    leads30d: 0,
    rating: 0,
    reviewsCount: 0,
    aiIssues: ['Title too generic', 'No pricing', 'No logo', 'Missing key features'],
    priceFrom: 0
  },
  {
    id: 'l4',
    name: 'Acme Analytics',
    logo: 'A',
    color: '#6b5cff',
    category: 'Analytics',
    status: 'paused',
    healthScore: 71,
    views30d: 1240,
    savesPct: 10.5,
    leads30d: 6,
    rating: 4.4,
    reviewsCount: 47,
    aiIssues: ['Listing paused — resume to get leads'],
    priceFrom: 49
  }
])

// ── Leads (enquiries from buyers) ─────────────────────────────────────────────
interface EnquiryApiRow {
  id: string
  subject: string
  buyer_email: string
  buyer_name: string
  status: string
  created_at: string
  updated_at: string
  app_name: string
  last_message: string | null
  message_count: number
}

function mapEnquiryToLead(e: EnquiryApiRow): Lead {
  const statusMap: Record<string, LeadStatus> = {
    open: 'new',
    awaiting: 'awaiting',
    replied: 'replied',
    closed: 'closed'
  }
  // Rough temperature heuristic: if opened within last 24h → hot, 7d → warm, else cold
  const ageMs = Date.now() - new Date(e.updated_at).getTime()
  const temperature: LeadTemperature =
    ageMs < 24 * 60 * 60 * 1000 ? 'hot' : ageMs < 7 * 24 * 60 * 60 * 1000 ? 'warm' : 'cold'
  return {
    id: e.id,
    buyerName: e.buyer_name,
    buyerCompany: e.buyer_email.split('@')[1]?.replace(/\.[^.]+$/, '') || '',
    buyerSize: '',
    listingId: '',
    listingName: e.app_name,
    subject: e.subject,
    preview: e.last_message || '(no messages yet)',
    temperature,
    status: statusMap[e.status] ?? 'new',
    updatedAt: new Date(e.updated_at).toLocaleDateString(),
    unread: e.status === 'open' ? 1 : 0,
    messages: []
  }
}

const leads = ref<Lead[]>([])
const leadsLoaded = ref(false)
const leadsLoading = ref(false)

async function loadLeads() {
  if (leadsLoaded.value || leadsLoading.value) return
  leadsLoading.value = true
  try {
    const data = await $fetch<{ enquiries: EnquiryApiRow[] }>('/api/vendor/enquiries')
    leads.value = (data.enquiries || []).map(mapEnquiryToLead)
    leadsLoaded.value = true
  } catch (err) {
    console.error('[useVendorData] leads fetch failed:', err)
  } finally {
    leadsLoading.value = false
  }
}

async function loadLeadMessages(enquiryId: string) {
  try {
    const data = await $fetch<{ messages: Array<{ id: string; sender_email: string; body: string; created_at: string }> }>(
      `/api/enquiries/${enquiryId}/messages`
    )
    const lead = leads.value.find(l => l.id === enquiryId)
    if (!lead) return
    lead.messages = data.messages.map(m => ({
      id: m.id,
      from: m.sender_email === lead.buyerName ? 'buyer' : 'vendor' as 'buyer' | 'vendor',
      body: m.body,
      at: new Date(m.created_at).toLocaleString()
    }))
  } catch (err) {
    console.error('[useVendorData] messages fetch failed:', err)
  }
}

const reviews = ref<VendorReview[]>([
  {
    id: 'r1',
    buyerName: 'Sara K.',
    buyerCompany: 'Northwind Media',
    listingName: 'Acme CRM',
    rating: 5,
    title: 'Replaced 3 tools with this',
    body: 'We consolidated our pipeline, email, and task tracking into Acme CRM and haven\'t looked back. Onboarding took half a day.',
    sentiment: 'positive',
    at: 'Apr 18, 2026',
    replied: false,
    aiReplyDraft: 'Thanks Sara — it\'s great to hear consolidation worked for Northwind. If you\'d ever want to share your setup as a case study, we\'d love to feature it.'
  },
  {
    id: 'r2',
    buyerName: 'D. Rivera',
    buyerCompany: 'Oakline Legal',
    listingName: 'Acme CRM',
    rating: 3,
    title: 'Good core, mobile needs work',
    body: 'Desktop experience is solid but the iOS app freezes when opening large deal records. Support was fast but this is a gap.',
    sentiment: 'neutral',
    at: 'Apr 15, 2026',
    replied: false,
    aiReplyDraft: 'Hi — thank you for the honest feedback. The iOS freeze on large deals is a known issue and a fix is in our April patch (shipping next Tuesday). I\'ll follow up once it\'s live so you can confirm it\'s resolved for you.'
  },
  {
    id: 'r3',
    buyerName: 'Liam N.',
    buyerCompany: 'Truenorth Co',
    listingName: 'Acme Inbox',
    rating: 2,
    title: 'Missing basic automations',
    body: 'No triggers for tag-based routing. This is table-stakes for a helpdesk in 2026.',
    sentiment: 'negative',
    at: 'Apr 9, 2026',
    replied: true,
    aiReplyDraft: ''
  }
])

// ── Promotions ────────────────────────────────────────────────────────────────
const promotions = ref<Promotion[]>([])
const promotionsLoaded = ref(false)
const promotionsLoading = ref(false)

async function loadPromotions() {
  if (promotionsLoaded.value || promotionsLoading.value) return
  promotionsLoading.value = true
  try {
    const data = await $fetch<{ promotions: Promotion[] }>('/api/vendor/promotions')
    promotions.value = data.promotions || []
    promotionsLoaded.value = true
  } catch (err) {
    console.error('[useVendorData] promotions fetch failed:', err)
  } finally {
    promotionsLoading.value = false
  }
}

async function createPromotion(payload: {
  appId: string; type: Promotion['type']; label: string; budget?: number; startsAt?: string; endsAt?: string
}) {
  await $fetch('/api/vendor/promotions', { method: 'POST', body: payload })
  promotionsLoaded.value = false
  await loadPromotions()
}

const similarVendors = ref<SimilarVendor[]>([])
const similarVendorsLoaded = ref(false)
const similarVendorsLoading = ref(false)

async function loadSimilarVendors() {
  if (similarVendorsLoaded.value || similarVendorsLoading.value) return
  similarVendorsLoading.value = true
  try {
    const data = await $fetch<{ competitors: SimilarVendor[] }>('/api/vendor/similar-vendors')
    similarVendors.value = data.competitors || []
    similarVendorsLoaded.value = true
  } catch {
    // Not authenticated or no listings yet — keep empty
  } finally {
    similarVendorsLoading.value = false
  }
}

// funnel is now a computed property inside useVendorData(), backed by real analytics API

const todayActions = ref<TodayAction[]>([
  {
    id: 'a1',
    title: 'Reply to 3 hot leads waiting > 4 hours',
    why: 'Median response time: 9h. Competitors respond in 2h.',
    cta: 'Open leads',
    to: '/dashboard/leads',
    impact: 'high'
  },
  {
    id: 'a2',
    title: 'Improve Acme Inbox listing (score 64)',
    why: '3 fixes could lift health to 85+ and recover ~12 leads/mo.',
    cta: 'Fix with AI',
    to: '/dashboard/content-assistant',
    impact: 'high'
  },
  {
    id: 'a3',
    title: 'Reply to neutral 3★ review',
    why: 'Vendor replies within 48h lift listing rating by avg 0.3★.',
    cta: 'Open reviews',
    to: '/dashboard/reviews',
    impact: 'med'
  }
])

const insights = ref<InsightItem[]>([
  {
    id: 'i1',
    headline: 'Leads up 18% week-over-week',
    narrative: 'Acme CRM leads rose to 38 (from 32) this week. The 20% featured promo is the likely driver — CPL dropped to $14.',
    delta: '+18%',
    tone: 'win'
  },
  {
    id: 'i2',
    headline: 'You lost 12 leads to slow replies',
    narrative: '12 enquiries went > 24h without a reply. Leads waiting > 24h convert at 40% of the rate of < 4h replies.',
    delta: '−12',
    tone: 'risk'
  },
  {
    id: 'i3',
    headline: 'Acme Inbox conversion is lagging',
    narrative: 'Save rate is 8.1% vs category median of 11.4%. Top gap: no SOC 2 badge on the listing.',
    delta: '−3.3pp',
    tone: 'risk'
  },
  {
    id: 'i4',
    headline: 'HubSpot is showing up more in your compare lane',
    narrative: '42% of buyers who view Acme CRM also view HubSpot. Their marketplace depth is the most-cited reason.',
    delta: '+6%',
    tone: 'neutral'
  }
])

export function useVendorData() {
  // Live analytics from real DB
  const analyticsData = ref<{
    views: number; uniqueViews: number; leads: number; hotLeads: number
    demos: number; reviews: number; avgRating: number; allTimeRating: number
    totalReviews: number; mrr: number
    funnel: Array<{ label: string; value: number; rate: number }>
    period: string
  } | null>(null)
  const analyticsLoading = ref(false)
  const analyticsPeriod = ref('30d')

  async function loadAnalytics(period = '30d') {
    analyticsLoading.value = true
    analyticsPeriod.value = period
    try {
      const data = await $fetch<typeof analyticsData.value>(`/api/vendor/analytics?period=${period}`)
      analyticsData.value = data
    } catch (err) {
      console.error('[useVendorData] analytics fetch failed:', err)
    } finally {
      analyticsLoading.value = false
    }
  }

  const kpis = computed(() => {
    if (analyticsData.value) {
      return {
        activeListings: listings.value.filter(l => l.status === 'live').length,
        totalListings: listings.value.length,
        openLeads: leads.value.filter(l => l.status === 'new' || l.status === 'awaiting').length,
        hotLeads: analyticsData.value.hotLeads,
        avgRating: analyticsData.value.allTimeRating.toFixed(1),
        views30d: analyticsData.value.views,
        leads30d: analyticsData.value.leads,
        mrr: analyticsData.value.mrr
      }
    }
    return {
      activeListings: listings.value.filter(l => l.status === 'live').length,
      totalListings: listings.value.length,
      openLeads: leads.value.filter(l => l.status === 'new' || l.status === 'awaiting').length,
      hotLeads: leads.value.filter(l => l.temperature === 'hot' && l.status !== 'closed').length,
      avgRating: (listings.value.reduce((s, l) => s + (l.rating || 0) * (l.reviewsCount || 0), 0) /
        Math.max(1, listings.value.reduce((s, l) => s + (l.reviewsCount || 0), 0))).toFixed(1),
      views30d: listings.value.reduce((s, l) => s + l.views30d, 0),
      leads30d: listings.value.reduce((s, l) => s + l.leads30d, 0),
      mrr: 0
    }
  })

  const funnel = computed(() =>
    analyticsData.value?.funnel ?? [
      { label: 'Impressions', value: 0, rate: 100 },
      { label: 'Profile Views', value: 0, rate: 0 },
      { label: 'Leads', value: 0, rate: 0 },
      { label: 'Demos', value: 0, rate: 0 }
    ]
  )


  function updateListingStatus(id: string, status: ListingStatus) {
    const l = listings.value.find(x => x.id === id)
    if (l) l.status = status
  }

  function replyLead(id: string, body: string) {
    const ld = leads.value.find(x => x.id === id)
    if (!ld) return
    ld.messages.push({ id: 'm' + Date.now(), from: 'vendor', body, at: 'Just now' })
    ld.status = 'replied'
    ld.unread = 0
    ld.aiDraft = undefined
    // Persist via API (fire-and-forget)
    $fetch(`/api/enquiries/${id}/messages`, { method: 'POST', body: { message: body } }).catch(console.error)
  }

  function markReviewReplied(id: string) {
    const r = reviews.value.find(x => x.id === id)
    if (r) { r.replied = true; r.aiReplyDraft = '' }
  }

  return {
    listings,
    leads,
    reviews,
    promotions,
    promotionsLoading,
    loadPromotions,
    createPromotion,
    similarVendors,
    similarVendorsLoading,
    loadSimilarVendors,
    funnel,
    todayActions,
    insights,
    kpis,
    analyticsData,
    analyticsLoading,
    analyticsPeriod,
    loadAnalytics,
    updateListingStatus,
    replyLead,
    loadLeads,
    loadLeadMessages,
    leadsLoading,
    markReviewReplied
  }
}
