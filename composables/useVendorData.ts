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

const leads = ref<Lead[]>([
  {
    id: 'ld1',
    buyerName: 'Priya Shah',
    buyerCompany: 'Nimbus Retail',
    buyerSize: '51–200',
    listingId: 'l1',
    listingName: 'Acme CRM',
    subject: 'Demo request for 80-seat team',
    preview: 'Hi — we\'re comparing Acme CRM vs HubSpot. Can we get a demo this week?',
    temperature: 'hot',
    status: 'new',
    updatedAt: '2h ago',
    unread: 2,
    messages: [
      { id: 'm1', from: 'buyer', body: 'Hi — we\'re comparing Acme CRM vs HubSpot. Can we get a demo this week? We\'re 80 seats, mid-market retail.', at: '2h ago' },
      { id: 'm2', from: 'buyer', body: 'Also — do you have SOC 2 Type II?', at: '2h ago' }
    ],
    aiDraft: 'Hi Priya,\n\nThanks for considering Acme CRM. I\'d love to set up a demo this week — would Thursday 2pm or Friday 10am work for your team?\n\nOn compliance: yes, we\'re SOC 2 Type II certified. I\'ll attach our report with the demo invite.\n\nLooking forward to it,\nSales Team'
  },
  {
    id: 'ld2',
    buyerName: 'Marcus Reid',
    buyerCompany: 'Forge Labs',
    buyerSize: '11–50',
    listingId: 'l1',
    listingName: 'Acme CRM',
    subject: 'Pricing for non-profit',
    preview: 'Do you offer non-profit discount?',
    temperature: 'warm',
    status: 'awaiting',
    updatedAt: '1d ago',
    unread: 0,
    messages: [
      { id: 'm3', from: 'buyer', body: 'Do you offer non-profit discount?', at: '2d ago' },
      { id: 'm4', from: 'vendor', body: 'Yes, 30% off with 501(c)(3) verification. Can you share your EIN?', at: '1d ago' }
    ]
  },
  {
    id: 'ld3',
    buyerName: 'Yuki Tanaka',
    buyerCompany: 'Solace Health',
    buyerSize: '201–1000',
    listingId: 'l2',
    listingName: 'Acme Inbox',
    subject: 'HIPAA compliance?',
    preview: 'Can we use Acme Inbox in a HIPAA context?',
    temperature: 'hot',
    status: 'new',
    updatedAt: '4h ago',
    unread: 1,
    messages: [
      { id: 'm5', from: 'buyer', body: 'Can we use Acme Inbox in a HIPAA context? We need BAA.', at: '4h ago' }
    ],
    aiDraft: 'Hi Yuki,\n\nThanks for reaching out. Acme Inbox supports HIPAA on our Business plan — we sign a BAA as part of onboarding.\n\nHappy to walk through the security model on a 20-min call. What works this week?\n\nBest,\nSales Team'
  },
  {
    id: 'ld4',
    buyerName: 'Aarav Patel',
    buyerCompany: 'Quickbuild',
    buyerSize: '1–10',
    listingId: 'l1',
    listingName: 'Acme CRM',
    subject: 'Free tier?',
    preview: 'Thanks for the info — we\'ll circle back next quarter.',
    temperature: 'cold',
    status: 'closed',
    updatedAt: '1w ago',
    unread: 0,
    messages: [
      { id: 'm6', from: 'buyer', body: 'Is there a free tier?', at: '2w ago' },
      { id: 'm7', from: 'vendor', body: 'We have a 14-day trial, no free tier.', at: '2w ago' },
      { id: 'm8', from: 'buyer', body: 'Thanks for the info — we\'ll circle back next quarter.', at: '1w ago' }
    ]
  }
])

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

const promotions = ref<Promotion[]>([
  {
    id: 'p1',
    listingName: 'Acme CRM',
    type: 'discount',
    label: '20% off annual plan',
    status: 'active',
    spend: 180,
    budget: 400,
    clicks: 1240,
    leads: 38,
    endsAt: 'May 31',
    aiSuggestion: 'Competitors are at 25%. Consider bumping to 25% for the last 10 days to close the gap.'
  },
  {
    id: 'p2',
    listingName: 'Acme CRM',
    type: 'featured',
    label: 'Featured in CRM category',
    status: 'active',
    spend: 520,
    budget: 800,
    clicks: 3200,
    leads: 22,
    endsAt: 'May 15',
    aiSuggestion: 'CPL is $23 — on par. No action needed.'
  },
  {
    id: 'p3',
    listingName: 'Acme Inbox',
    type: 'trial-extend',
    label: '30-day trial (vs 14)',
    status: 'scheduled',
    spend: 0,
    budget: 200,
    clicks: 0,
    leads: 0,
    endsAt: 'Starts May 1',
    aiSuggestion: 'Based on your current 14-day trial → paid conversion (8%), extending to 30 days typically lifts conversion by 20–30%.'
  }
])

const similarVendors = ref<SimilarVendor[]>([
  {
    id: 's1',
    name: 'HubSpot',
    logo: 'H',
    color: '#ff7a59',
    category: 'CRM',
    rating: 4.5,
    reviews: 8920,
    priceFrom: 45,
    yourRank: 'below',
    gap: 'Marketplace with 1,000+ integrations',
    overlap: 42
  },
  {
    id: 's2',
    name: 'Pipedrive',
    logo: 'P',
    color: '#1a1a1a',
    category: 'CRM',
    rating: 4.4,
    reviews: 3140,
    priceFrom: 24,
    yourRank: 'tied',
    gap: 'Visual pipeline drag-and-drop',
    overlap: 28
  },
  {
    id: 's3',
    name: 'Freshsales',
    logo: 'F',
    color: '#29bcaf',
    category: 'CRM',
    rating: 4.3,
    reviews: 2080,
    priceFrom: 19,
    yourRank: 'above',
    gap: '—',
    overlap: 18
  },
  {
    id: 's4',
    name: 'Close',
    logo: 'C',
    color: '#0a253c',
    category: 'CRM',
    rating: 4.6,
    reviews: 690,
    priceFrom: 99,
    yourRank: 'below',
    gap: 'Built-in power dialer',
    overlap: 9
  }
])

const funnel = ref<FunnelStep[]>([
  { label: 'Listing views', value: 19510, rate: 100 },
  { label: 'Saves / shortlists', value: 2340, rate: 12 },
  { label: 'Enquiries', value: 114, rate: 4.9 },
  { label: 'Demos booked', value: 42, rate: 37 },
  { label: 'Deals won', value: 11, rate: 26 }
])

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
  const kpis = computed(() => ({
    activeListings: listings.value.filter(l => l.status === 'live').length,
    totalListings: listings.value.length,
    openLeads: leads.value.filter(l => l.status === 'new' || l.status === 'awaiting').length,
    hotLeads: leads.value.filter(l => l.temperature === 'hot' && l.status !== 'closed').length,
    avgRating: (listings.value.reduce((s, l) => s + (l.rating || 0) * (l.reviewsCount || 0), 0) /
      Math.max(1, listings.value.reduce((s, l) => s + (l.reviewsCount || 0), 0))).toFixed(1),
    views30d: listings.value.reduce((s, l) => s + l.views30d, 0),
    leads30d: listings.value.reduce((s, l) => s + l.leads30d, 0),
    mrr: 8420 // mock
  }))

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
    similarVendors,
    funnel,
    todayActions,
    insights,
    kpis,
    updateListingStatus,
    replyLead,
    markReviewReplied
  }
}
