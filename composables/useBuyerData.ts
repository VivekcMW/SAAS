// Mock data + helpers for the Buyer workspace.
// Replace with real API calls when backend is ready.
import { computed, reactive, readonly } from 'vue'

export type BuyerStatus = 'shortlisted' | 'evaluating' | 'demo-booked' | 'decided' | 'rejected'

export interface SavedApp {
  id: string
  slug: string
  name: string
  category: string
  logo: string // emoji-free: single letter
  color: string
  priceFrom: number // per seat / mo
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

const state = reactive({
  savedApps: [
    { id: 'a1', slug: 'slack', name: 'Slack', category: 'Communication', logo: 'S', color: '#4A154B', priceFrom: 7.25, rating: 4.6, reviews: 32410, status: 'evaluating' as BuyerStatus, savedAt: '2026-04-10', note: 'Need SSO', integrations: ['Google Workspace', 'Jira', 'Notion'], trial: true, soc2: true },
    { id: 'a2', slug: 'notion', name: 'Notion', category: 'Productivity', logo: 'N', color: '#111111', priceFrom: 10, rating: 4.7, reviews: 18920, status: 'shortlisted' as BuyerStatus, savedAt: '2026-04-14', integrations: ['Slack', 'Github'], trial: true, soc2: true },
    { id: 'a3', slug: 'hubspot', name: 'HubSpot', category: 'CRM', logo: 'H', color: '#FF7A59', priceFrom: 45, rating: 4.4, reviews: 11230, status: 'demo-booked' as BuyerStatus, savedAt: '2026-04-05', note: 'Demo on 28 Apr', integrations: ['Gmail', 'Slack', 'Zapier'], trial: true, soc2: true },
    { id: 'a4', slug: 'linear', name: 'Linear', category: 'Project mgmt', logo: 'L', color: '#5E6AD2', priceFrom: 8, rating: 4.8, reviews: 4800, status: 'shortlisted' as BuyerStatus, savedAt: '2026-04-18', integrations: ['Github', 'Slack', 'Figma'], trial: true, soc2: true },
    { id: 'a5', slug: 'intercom', name: 'Intercom', category: 'Support', logo: 'I', color: '#1F8DED', priceFrom: 74, rating: 4.3, reviews: 2900, status: 'rejected' as BuyerStatus, savedAt: '2026-03-30', note: 'Too pricey', integrations: ['Slack', 'Salesforce'], trial: false, soc2: true }
  ] as SavedApp[],
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
  const kpis = computed(() => ({
    saved: state.savedApps.length,
    evaluating: state.savedApps.filter(a => a.status === 'evaluating' || a.status === 'shortlisted' || a.status === 'demo-booked').length,
    openEnquiries: state.enquiries.filter(e => e.status !== 'closed').length,
    reviews: state.reviews.length
  }))

  const updateStatus = (id: string, status: BuyerStatus) => {
    const a = state.savedApps.find(x => x.id === id); if (a) a.status = status
  }
  const removeApp = (id: string) => {
    const i = state.savedApps.findIndex(x => x.id === id); if (i >= 0) state.savedApps.splice(i, 1)
  }
  const setNote = (id: string, note: string) => {
    const a = state.savedApps.find(x => x.id === id); if (a) a.note = note
  }
  const closeEnquiry = (id: string) => {
    const e = state.enquiries.find(x => x.id === id); if (e) e.status = 'closed'
  }

  return {
    state: readonly(state),
    savedApps: computed(() => state.savedApps),
    enquiries: computed(() => state.enquiries),
    reviews: computed(() => state.reviews),
    deals: computed(() => state.deals),
    digest: computed(() => state.digest),
    kpis,
    updateStatus,
    removeApp,
    setNote,
    closeEnquiry
  }
}
