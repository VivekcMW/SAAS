import { ref, computed } from 'vue'

export type PendingAppStatus = 'pending' | 'approved' | 'rejected'
export type UserStatus = 'active' | 'suspended' | 'pending'
export type FlagStatus = 'open' | 'dismissed' | 'actioned'
export type DisputeStatus = 'open' | 'mediating' | 'resolved'

export interface PendingApp {
  id: string
  name: string
  logo: string
  color: string
  vendorName: string
  vendorEmail: string
  category: string
  submittedAt: string
  status: PendingAppStatus
  aiRiskScore: number          // 0-100
  aiRecommendation: 'approve' | 'reject' | 'review'
  aiConfidence: number         // 0-100
  aiFlags: string[]
  aiSummary: string
  description: string
}

export interface PlatformUser {
  id: string
  name: string
  email: string
  role: 'buyer' | 'vendor' | 'admin'
  status: UserStatus
  joinedAt: string
  lastActive: string
  companyName?: string
  listings?: number
  enquiries?: number
  aiTrustScore: number  // 0-100
}

export interface FlaggedContent {
  id: string
  kind: 'review' | 'listing' | 'message'
  reportedBy: string
  target: string
  body: string
  reportedAt: string
  status: FlagStatus
  aiCategory: 'spam' | 'abuse' | 'fake' | 'off-topic' | 'safe'
  aiConfidence: number
  aiAction: 'auto-remove' | 'human-review' | 'keep'
}

export interface Dispute {
  id: string
  buyerName: string
  vendorName: string
  listingName: string
  subject: string
  amount: number
  openedAt: string
  status: DisputeStatus
  aiSummary: string
  aiRecommendedResolution: string
}

export interface AuditEvent {
  id: string
  actor: string
  actorRole: 'admin' | 'vendor' | 'buyer' | 'system'
  action: string
  target: string
  at: string
}

export interface Anomaly {
  id: string
  severity: 'high' | 'med' | 'low'
  title: string
  body: string
  metric: string
  cta?: { label: string; href: string }
}

const pendingApps = ref<PendingApp[]>([
  {
    id: 'pa1',
    name: 'FlowDesk Pro',
    logo: 'FD',
    color: '#3b82f6',
    vendorName: 'FlowDesk Inc.',
    vendorEmail: 'hello@flowdesk.example',
    category: 'Project Management',
    submittedAt: '4h ago',
    status: 'pending',
    aiRiskScore: 18,
    aiRecommendation: 'approve',
    aiConfidence: 92,
    aiFlags: [],
    aiSummary: 'Legitimate listing. Vendor has verified domain (flowdesk.example), clear pricing ($19–79/mo), detailed description (340 words), and 8 working integration links. No policy concerns detected.',
    description: 'A Kanban and sprint planning tool for small engineering teams with built-in standups and retros.'
  },
  {
    id: 'pa2',
    name: 'MagicCRM AI',
    logo: 'MC',
    color: '#ec4899',
    vendorName: 'SmartSell LLC',
    vendorEmail: 'contact@smartsell.example',
    category: 'CRM',
    submittedAt: '1d ago',
    status: 'pending',
    aiRiskScore: 68,
    aiRecommendation: 'review',
    aiConfidence: 81,
    aiFlags: [
      'Description contains unverifiable claims ("10× more leads guaranteed")',
      'Vendor domain registered 11 days ago',
      'Screenshots appear to be stock UI kit'
    ],
    aiSummary: 'Medium-risk listing. Marketing language is aggressive with unverifiable performance claims. Vendor is new (domain <2 weeks old). Manual review recommended before approval.',
    description: 'AI-powered CRM that automatically scores leads, writes emails, and closes deals faster than any human salesperson.'
  },
  {
    id: 'pa3',
    name: 'Nebula Analytics',
    logo: 'NA',
    color: '#8b5cf6',
    vendorName: 'Nebula Data Co.',
    vendorEmail: 'team@nebula-data.example',
    category: 'Analytics',
    submittedAt: '2d ago',
    status: 'pending',
    aiRiskScore: 12,
    aiRecommendation: 'approve',
    aiConfidence: 96,
    aiFlags: [],
    aiSummary: 'Low-risk, well-formed listing. SOC 2 badge verified, GDPR compliance documented, pricing tiers clearly listed, and vendor has 2 published case studies.',
    description: 'Product analytics for SaaS teams. Event tracking, funnels, cohorts, and retention curves — no sampling.'
  },
  {
    id: 'pa4',
    name: 'QuickBill',
    logo: 'QB',
    color: '#10b981',
    vendorName: 'BillCorp',
    vendorEmail: 'admin@billcorp.example',
    category: 'Finance',
    submittedAt: '3d ago',
    status: 'pending',
    aiRiskScore: 84,
    aiRecommendation: 'reject',
    aiConfidence: 88,
    aiFlags: [
      'Name and copy are near-identical to existing listing "QuickBills Pro"',
      'No website provided',
      'Logo appears to be AI-generated trademarked lookalike'
    ],
    aiSummary: 'High-risk listing. Likely trademark infringement on existing marketplace vendor "QuickBills Pro". Missing required vendor website. Recommend rejection pending legal review.',
    description: 'Invoicing and billing for small business. Send invoices, accept payments, track expenses.'
  }
])

const users = ref<PlatformUser[]>([
  { id: 'u1', name: 'Priya Shah', email: 'priya@nimbus.example', role: 'buyer', status: 'active', joinedAt: 'Jul 12, 2025', lastActive: '2h ago', companyName: 'Nimbus Retail', enquiries: 14, aiTrustScore: 96 },
  { id: 'u2', name: 'Yuki Tanaka', email: 'yuki@solace-health.example', role: 'buyer', status: 'active', joinedAt: 'Aug 3, 2025', lastActive: '1h ago', companyName: 'Solace Health', enquiries: 8, aiTrustScore: 94 },
  { id: 'u3', name: 'Acme Technologies', email: 'demo@saasworld.com', role: 'vendor', status: 'active', joinedAt: 'Jan 15, 2024', lastActive: 'now', companyName: 'Acme Technologies', listings: 4, aiTrustScore: 98 },
  { id: 'u4', name: 'SmartSell LLC', email: 'contact@smartsell.example', role: 'vendor', status: 'pending', joinedAt: '11 days ago', lastActive: '1d ago', companyName: 'SmartSell LLC', listings: 1, aiTrustScore: 42 },
  { id: 'u5', name: 'Rahul Menon', email: 'rahul@acme.example', role: 'vendor', status: 'active', joinedAt: 'Mar 2, 2025', lastActive: '3h ago', companyName: 'Acme Technologies', aiTrustScore: 91 },
  { id: 'u6', name: 'BillCorp', email: 'admin@billcorp.example', role: 'vendor', status: 'suspended', joinedAt: '5 days ago', lastActive: '2d ago', companyName: 'BillCorp', listings: 1, aiTrustScore: 18 },
  { id: 'u7', name: 'Admin User', email: 'admin@saasworld.com', role: 'admin', status: 'active', joinedAt: 'Jan 1, 2024', lastActive: 'now', aiTrustScore: 100 },
  { id: 'u8', name: 'Oakline Legal', email: 'procurement@oakline.example', role: 'buyer', status: 'active', joinedAt: 'Sep 22, 2025', lastActive: '5h ago', companyName: 'Oakline Legal', enquiries: 5, aiTrustScore: 89 }
])

const flags = ref<FlaggedContent[]>([
  {
    id: 'f1', kind: 'review', reportedBy: 'Acme Technologies', target: 'Review on Acme CRM',
    body: 'This product is absolute garbage, do NOT buy. The owners are scammers and the support team is incompetent.',
    reportedAt: '2h ago', status: 'open',
    aiCategory: 'abuse', aiConfidence: 87, aiAction: 'human-review'
  },
  {
    id: 'f2', kind: 'review', reportedBy: 'Nebula Data Co.', target: 'Review on Nebula Analytics',
    body: 'Great product!!! Buy my course at www.fake-spam-link.example to learn more!!! Click here!!!',
    reportedAt: '4h ago', status: 'open',
    aiCategory: 'spam', aiConfidence: 98, aiAction: 'auto-remove'
  },
  {
    id: 'f3', kind: 'listing', reportedBy: 'buyer_anon', target: 'MagicCRM AI listing',
    body: 'Listing makes false claims ("10× more leads guaranteed") and uses stock screenshots.',
    reportedAt: '1d ago', status: 'open',
    aiCategory: 'fake', aiConfidence: 76, aiAction: 'human-review'
  },
  {
    id: 'f4', kind: 'message', reportedBy: 'Priya Shah', target: 'DM from vendor SmartSell',
    body: 'Unsolicited promo message from a vendor I never enquired with.',
    reportedAt: '2d ago', status: 'dismissed',
    aiCategory: 'off-topic', aiConfidence: 62, aiAction: 'human-review'
  }
])

const disputes = ref<Dispute[]>([
  {
    id: 'd1',
    buyerName: 'Oakline Legal', vendorName: 'Acme Technologies', listingName: 'Acme CRM',
    subject: 'Refund request after 14-day trial',
    amount: 290, openedAt: '3d ago', status: 'open',
    aiSummary: 'Buyer claims core feature (bulk contact import) did not work as advertised. Vendor logs confirm 2 failed import attempts. Buyer is within refund window per marketplace terms.',
    aiRecommendedResolution: 'Full refund. The failed import is documented; terms favour the buyer.'
  },
  {
    id: 'd2',
    buyerName: 'Truenorth Co', vendorName: 'Acme Technologies', listingName: 'Acme Inbox',
    subject: 'Negative review dispute — factual inaccuracy',
    amount: 0, openedAt: '5d ago', status: 'mediating',
    aiSummary: 'Vendor disputes a 2★ review that claims "no SSO support" — product does ship SSO on the Pro plan. Review appears to be from a Free-tier user.',
    aiRecommendedResolution: 'Attach vendor response clarifying SSO availability. Do not remove review — reviewer\'s experience on Free tier is accurate for that tier.'
  }
])

const auditLog = ref<AuditEvent[]>([
  { id: 'a1', actor: 'admin@saasworld.com', actorRole: 'admin', action: 'approved listing', target: 'Nebula Analytics', at: '2h ago' },
  { id: 'a2', actor: 'system', actorRole: 'system', action: 'auto-removed review', target: 'spam review on Nebula Analytics', at: '4h ago' },
  { id: 'a3', actor: 'admin@saasworld.com', actorRole: 'admin', action: 'suspended user', target: 'admin@billcorp.example', at: '5h ago' },
  { id: 'a4', actor: 'demo@saasworld.com', actorRole: 'vendor', action: 'published listing', target: 'Acme Analytics', at: '1d ago' },
  { id: 'a5', actor: 'system', actorRole: 'system', action: 'flagged listing for review', target: 'MagicCRM AI', at: '1d ago' },
  { id: 'a6', actor: 'priya@nimbus.example', actorRole: 'buyer', action: 'submitted enquiry', target: 'Acme CRM', at: '2d ago' }
])

const anomalies = ref<Anomaly[]>([
  {
    id: 'an1', severity: 'high',
    title: 'Suspicious review burst on MagicCRM AI',
    body: '7 five-star reviews posted within 40 minutes from accounts created this week. Likely review manipulation.',
    metric: '7 reviews / 40 min',
    cta: { label: 'Open in Fraud detection', href: '/dashboard/fraud' }
  },
  {
    id: 'an2', severity: 'med',
    title: 'Signup spike from single IP range',
    body: '12 buyer signups in the last 6 hours from a single /24 block. Could be legitimate team rollout, or farming.',
    metric: '12 signups · 1 subnet',
    cta: { label: 'Review signups', href: '/dashboard/users' }
  },
  {
    id: 'an3', severity: 'low',
    title: 'Payment retries above baseline',
    body: 'Stripe retry rate is 4.1% (baseline 2.2%). Mostly card-expiry, not fraud.',
    metric: '4.1% vs 2.2%',
    cta: { label: 'See revenue', href: '/dashboard/revenue' }
  }
])

const mrrTrend = [42100, 43800, 45200, 46100, 48300, 49800, 51200, 52400, 54100, 55800, 58200, 61400]
const signupsByDay = [24, 31, 28, 45, 52, 48, 61]

export function useAdminData() {
  const kpis = computed(() => ({
    totalUsers: users.value.length,
    totalBuyers: users.value.filter(u => u.role === 'buyer').length,
    totalVendors: users.value.filter(u => u.role === 'vendor').length,
    activeUsers: users.value.filter(u => u.status === 'active').length,
    pendingApps: pendingApps.value.filter(a => a.status === 'pending').length,
    openFlags: flags.value.filter(f => f.status === 'open').length,
    openDisputes: disputes.value.filter(d => d.status !== 'resolved').length,
    totalListings: 128,
    mrr: mrrTrend[mrrTrend.length - 1],
    mrrGrowth: ((mrrTrend[mrrTrend.length - 1] - mrrTrend[0]) / mrrTrend[0] * 100).toFixed(1),
    platformFee: 14280
  }))

  function decideApp(id: string, decision: 'approved' | 'rejected') {
    const app = pendingApps.value.find(a => a.id === id)
    if (app) app.status = decision
  }

  function updateUserStatus(id: string, status: UserStatus) {
    const u = users.value.find(u => u.id === id)
    if (u) u.status = status
  }

  function resolveFlag(id: string, action: FlagStatus) {
    const f = flags.value.find(f => f.id === id)
    if (f) f.status = action
  }

  function resolveDispute(id: string) {
    const d = disputes.value.find(d => d.id === id)
    if (d) d.status = 'resolved'
  }

  return {
    pendingApps, users, flags, disputes, auditLog, anomalies,
    mrrTrend, signupsByDay, kpis,
    decideApp, updateUserStatus, resolveFlag, resolveDispute
  }
}
