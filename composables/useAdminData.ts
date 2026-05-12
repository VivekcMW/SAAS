import { ref, computed } from 'vue'

export type AppStatus = 'pending' | 'approved' | 'rejected'
export type UserStatus = 'active' | 'suspended' | 'pending'
export type TicketStatus = 'open' | 'resolved'
export type TicketKind = 'dispute' | 'flag' | 'report'

export interface AppListing {
  id: string
  name: string
  logo: string
  color: string
  vendorName: string
  vendorEmail: string
  category: string
  status: AppStatus
  submittedAt: string
  description: string
}

export interface PlatformUser {
  id: string
  name: string
  email: string
  role: 'buyer' | 'vendor' | 'admin'
  companyName?: string
  status: UserStatus
  joinedAt: string
  lastActive: string
}

export interface SupportTicket {
  id: string
  kind: TicketKind
  subject: string
  from: string
  against?: string
  amount?: number
  openedAt: string
  status: TicketStatus
  description: string
}

export interface ActivityEvent {
  id: string
  at: string
  actor: string
  actorRole: 'admin' | 'system' | 'vendor' | 'buyer'
  action: string
  target: string
}

const apps = ref<AppListing[]>([
  { id: 'a1', name: 'FlowDesk Pro', logo: 'FD', color: '#3b82f6', vendorName: 'FlowDesk Inc.', vendorEmail: 'team@flowdesk.io', category: 'Productivity', status: 'pending', submittedAt: '2 hours ago', description: 'Project management tool with Kanban, Gantt, and team chat built in.' },
  { id: 'a2', name: 'MagicCRM AI', logo: 'MC', color: '#ec4899', vendorName: 'MagicCRM Labs', vendorEmail: 'hello@magiccrm.ai', category: 'CRM', status: 'pending', submittedAt: '6 hours ago', description: 'AI-powered CRM with automated lead scoring and follow-up suggestions.' },
  { id: 'a3', name: 'Nebula Analytics', logo: 'NA', color: '#10b981', vendorName: 'Nebula Data Co.', vendorEmail: 'admin@nebula.dev', category: 'Analytics', status: 'pending', submittedAt: '1 day ago', description: 'Self-serve analytics dashboards for SaaS teams.' },
  { id: 'a4', name: 'Acme CRM', logo: 'AC', color: '#f59e0b', vendorName: 'Acme Technologies', vendorEmail: 'demo@moonmart.ai', category: 'CRM', status: 'approved', submittedAt: '14 days ago', description: 'All-in-one CRM for mid-market teams.' },
  { id: 'a5', name: 'Acme Inbox', logo: 'AI', color: '#6366f1', vendorName: 'Acme Technologies', vendorEmail: 'demo@moonmart.ai', category: 'Support', status: 'approved', submittedAt: '22 days ago', description: 'Shared inbox for customer support teams.' },
  { id: 'a6', name: 'QuickBill', logo: 'QB', color: '#ef4444', vendorName: 'BillCorp', vendorEmail: 'team@billcorp.io', category: 'Billing', status: 'rejected', submittedAt: '3 days ago', description: 'Invoicing and billing automation.' }
])

const users = ref<PlatformUser[]>([
  { id: 'u1', name: 'Priya Shah', email: 'priya@example.com', role: 'buyer', companyName: 'Truenorth', status: 'active', joinedAt: 'Jan 14', lastActive: '2h ago' },
  { id: 'u2', name: 'Yuki Tanaka', email: 'yuki@example.com', role: 'buyer', companyName: 'Kita Co.', status: 'active', joinedAt: 'Feb 02', lastActive: '1d ago' },
  { id: 'u3', name: 'Acme Technologies', email: 'demo@moonmart.ai', role: 'vendor', companyName: 'Acme Technologies', status: 'active', joinedAt: 'Oct 12', lastActive: '12m ago' },
  { id: 'u4', name: 'SmartSell LLC', email: 'ops@smartsell.io', role: 'vendor', companyName: 'SmartSell LLC', status: 'pending', joinedAt: 'Apr 20', lastActive: '1h ago' },
  { id: 'u5', name: 'Rahul Menon', email: 'rahul@example.com', role: 'buyer', companyName: 'Oakline Legal', status: 'active', joinedAt: 'Mar 08', lastActive: '4h ago' },
  { id: 'u6', name: 'BillCorp', email: 'team@billcorp.io', role: 'vendor', companyName: 'BillCorp', status: 'suspended', joinedAt: 'Feb 18', lastActive: '8d ago' },
  { id: 'u7', name: 'Admin User', email: 'admin@moonmart.ai', role: 'admin', status: 'active', joinedAt: 'Jan 01', lastActive: 'now' },
  { id: 'u8', name: 'Oakline Legal', email: 'buyer@moonmart.ai', role: 'buyer', companyName: 'Oakline Legal', status: 'active', joinedAt: 'Dec 20', lastActive: '30m ago' }
])

const tickets = ref<SupportTicket[]>([
  { id: 't1', kind: 'dispute', subject: 'Refund request — Acme CRM', from: 'Oakline Legal', against: 'Acme Technologies', amount: 290, openedAt: '1 day ago', status: 'open', description: 'Buyer reports that the integration with their invoicing tool failed. Requesting a full refund within the 30-day window.' },
  { id: 't2', kind: 'dispute', subject: 'Review dispute — Acme Inbox', from: 'Truenorth', against: 'Acme Technologies', openedAt: '2 days ago', status: 'open', description: 'Reviewer left a 2-star review citing missing SSO. Vendor claims SSO is on the paid tier only.' },
  { id: 't3', kind: 'flag', subject: 'Abusive review on "FlowDesk Pro"', from: 'Community report', openedAt: '3 hours ago', status: 'open', description: 'A review contains profanity and personal attacks on the vendor team.' },
  { id: 't4', kind: 'flag', subject: 'Spam review on "MagicCRM AI"', from: 'Auto-detected', openedAt: '5 hours ago', status: 'open', description: 'Short review text contains external promo URL.' },
  { id: 't5', kind: 'report', subject: 'Listing accuracy — QuickBill', from: 'Priya Shah', openedAt: '2 days ago', status: 'resolved', description: 'Screenshots in the listing do not match the actual product.' }
])

const activity = ref<ActivityEvent[]>([])
const activityLoaded = ref(false)
const activityLoading = ref(false)

async function loadActivity(opts?: { action?: string; entityType?: string; limit?: number }) {
  if (activityLoading.value) return
  activityLoading.value = true
  try {
    const data = await $fetch<{ activities: Array<{
      id: string; actorEmail: string | null; action: string;
      entityType: string | null; entityId: string | null;
      meta: Record<string, unknown> | null; createdAt: string
    }> }>('/api/admin/activity', { query: opts })
    activity.value = (data.activities || []).map(e => ({
      id: e.id,
      at: new Date(e.createdAt).toLocaleString(),
      actor: e.actorEmail || 'System',
      actorRole: e.actorEmail ? (e.action.startsWith('user.') ? 'admin' : 'vendor') : 'system',
      action: e.action,
      target: (e.meta?.name as string) || e.entityId || ''
    }))
    activityLoaded.value = true
  } catch (err) {
    console.error('[useAdminData] activity fetch failed:', err)
    activityError.value = true
  } finally {
    activityLoading.value = false
  }
}

const mrrTrend = [42100, 43800, 44900, 46200, 47800, 49600, 51200, 53900, 55400, 57600, 59200, 61400]
const signupsByDay = [8, 12, 15, 10, 18, 22, 19]

// Live stats from /api/admin/stats — loaded on demand
interface LiveAdminStats {
  mrr: number
  totalUsers: number
  totalVendors: number
  totalBuyers: number
  totalListings: number
  pendingListings: number
  publishedListings: number
  totalReviews: number
  activeSubscriptions: number
}
const liveStats = ref<LiveAdminStats | null>(null)
const liveStatsLoading = ref(false)

async function loadLiveStats() {
  if (liveStatsLoading.value) return
  liveStatsLoading.value = true
  try {
    liveStats.value = await $fetch<LiveAdminStats>('/api/admin/stats')
  } catch (err) {
    console.error('[useAdminData] stats fetch failed:', err)
  } finally {
    liveStatsLoading.value = false
  }
}

const kpis = computed(() => {
  const totalBuyers = liveStats.value?.totalBuyers ?? users.value.filter(u => u.role === 'buyer').length
  const totalVendors = liveStats.value?.totalVendors ?? users.value.filter(u => u.role === 'vendor').length
  const totalUsers = liveStats.value?.totalUsers ?? users.value.length
  const activeUsers = users.value.filter(u => u.status === 'active').length
  const pendingApps = liveStats.value?.pendingListings ?? apps.value.filter(a => a.status === 'pending').length
  const liveApps = liveStats.value?.publishedListings ?? apps.value.filter(a => a.status === 'approved').length
  const openTickets = tickets.value.filter(t => t.status === 'open').length
  const mrr = liveStats.value?.mrr ?? mrrTrend.at(-1) ?? 0
  const firstMrr = mrrTrend[0] || 1
  const mrrGrowth = Number(((mrr - firstMrr) / firstMrr * 100).toFixed(1))
  return {
    totalUsers,
    totalBuyers,
    totalVendors,
    activeUsers,
    pendingApps,
    liveApps,
    openTickets,
    mrr,
    mrrGrowth,
    platformFee: Math.round(mrr * 0.23)
  }
})

// ── Shared admin toast ────────────────────────────────────────────
const adminToast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
let _toastTimer: ReturnType<typeof setTimeout> | null = null

function showAdminToast(msg: string, type: 'success' | 'error' = 'success') {
  if (_toastTimer) clearTimeout(_toastTimer)
  adminToast.value = { msg, type }
  _toastTimer = setTimeout(() => { adminToast.value = null }, 3500)
}

// ── Activity error ────────────────────────────────────────────────
const activityError = ref(false)

async function decideApp(id: string, decision: 'approved' | 'rejected') {
  const a = apps.value.find(x => x.id === id)
  const prevStatus = a?.status
  if (a) a.status = decision
  activity.value.unshift({
    id: `e-${Date.now()}`,
    at: 'just now',
    actor: 'Admin User',
    actorRole: 'admin',
    action: decision === 'approved' ? 'approved' : 'rejected',
    target: a?.name || id
  })
  try {
    await $fetch(`/api/admin/apps/${id}/decide`, { method: 'POST', body: { decision } })
    showAdminToast(decision === 'approved' ? `"${a?.name ?? 'App'}" approved.` : `"${a?.name ?? 'App'}" rejected.`)
  } catch (err) {
    if (a && prevStatus !== undefined) a.status = prevStatus
    showAdminToast('Action failed. Please try again.', 'error')
    console.error('[useAdminData] decideApp failed:', err)
    throw err
  }
}

async function updateUserStatus(id: string, status: UserStatus) {
  const u = users.value.find(x => x.id === id)
  const prevStatus = u?.status
  if (u) u.status = status
  activity.value.unshift({
    id: `e-${Date.now()}`,
    at: 'just now',
    actor: 'Admin User',
    actorRole: 'admin',
    action: status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : 'updated',
    target: u?.name || id
  })
  try {
    await $fetch(`/api/admin/users/${id}/status`, { method: 'PUT', body: { status } })
    showAdminToast(
      status === 'suspended'
        ? `${u?.name ?? 'User'} suspended.`
        : `${u?.name ?? 'User'} status updated.`
    )
  } catch (err) {
    if (u && prevStatus !== undefined) u.status = prevStatus
    showAdminToast('Action failed. Please try again.', 'error')
    console.error('[useAdminData] updateUserStatus failed:', err)
    throw err
  }
}

async function resolveTicket(id: string) {
  const t = tickets.value.find(x => x.id === id)
  if (t) t.status = 'resolved'
  activity.value.unshift({
    id: `e-${Date.now()}`,
    at: 'just now',
    actor: 'Admin User',
    actorRole: 'admin',
    action: 'resolved',
    target: t?.subject || id
  })
  try {
    await $fetch(`/api/admin/support/${id}/resolve`, { method: 'POST' })
    showAdminToast('Ticket resolved.')
  } catch (err) {
    if (t) t.status = 'open'
    showAdminToast('Failed to resolve ticket.', 'error')
    console.error('[useAdminData] resolveTicket failed:', err)
    throw err
  }
}

export function useAdminData() {
  return {
    apps,
    users,
    tickets,
    activity,
    activityLoading,
    activityError,
    loadActivity,
    mrrTrend,
    signupsByDay,
    kpis,
    liveStats,
    liveStatsLoading,
    loadLiveStats,
    decideApp,
    updateUserStatus,
    resolveTicket,
    adminToast,
    showAdminToast
  }
}
