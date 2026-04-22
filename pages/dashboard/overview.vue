<template>
  <div class="overview">
    <DashPageHeader
      :title="greeting"
      :description="headerDesc"
      :eyebrow="eyebrowLabel"
    >
      <template #actions>
        <NuxtLink v-if="role === 'vendor'" to="/list-product" class="btn-primary">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          Add new app
        </NuxtLink>
        <NuxtLink v-else to="/marketplace" class="btn-primary">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Browse apps
        </NuxtLink>
      </template>
    </DashPageHeader>

    <!-- Stat cards -->
    <div class="overview__stats">
      <DashStatCard
        v-for="s in stats"
        :key="s.label"
        :label="s.label"
        :value="s.value"
        :delta="s.delta"
        :tone="s.tone"
        :icon="s.icon"
      />
    </div>

    <!-- Main grid -->
    <div class="overview__grid">
      <!-- Left: recent activity -->
      <section class="card">
        <header class="card__head">
          <h2>Recent activity</h2>
          <NuxtLink to="/dashboard/enquiries" class="card__link">View all</NuxtLink>
        </header>

        <ul v-if="activity.length" class="activity">
          <li v-for="a in activity" :key="a.id" class="activity__item">
            <span class="activity__dot" :class="`is-${a.kind}`" aria-hidden="true" />
            <div class="activity__body">
              <div class="activity__title">{{ a.title }}</div>
              <div class="activity__meta">{{ a.meta }} · {{ a.time }}</div>
            </div>
          </li>
        </ul>
        <DashEmptyState
          v-else
          title="Nothing yet"
          description="New activity will appear here as it happens."
        />
      </section>

      <!-- Right: quick actions -->
      <aside class="card">
        <header class="card__head">
          <h2>Quick actions</h2>
        </header>
        <div class="actions">
          <NuxtLink v-for="qa in quickActions" :key="qa.label" :to="qa.to" class="action">
            <span class="action__icon" aria-hidden="true" v-html="qa.icon" />
            <span class="action__text">
              <span class="action__label">{{ qa.label }}</span>
              <span class="action__desc">{{ qa.desc }}</span>
            </span>
            <svg class="action__arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </NuxtLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { currentUser } = useAuth()

useHead({ title: 'Overview — SaaSWorld Dashboard' })

const role = computed(() => currentUser.value?.role || 'buyer')

function timeOfDayWave(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const greeting = computed(() => {
  const name = currentUser.value?.firstName || 'there'
  const wave = timeOfDayWave(new Date().getHours())
  return `${wave}, ${name}`
})

const eyebrowLabel = computed(() => {
  if (role.value === 'vendor') return 'Vendor overview'
  if (role.value === 'admin') return 'Platform overview'
  return 'Buyer overview'
})

const headerDesc = computed(() => {
  if (role.value === 'vendor') return "Here's how your apps are performing this week."
  if (role.value === 'admin') return 'Snapshot of platform activity and key metrics.'
  return 'Track your shortlisted apps, enquiries, and comparisons.'
})

// Icons
const ICONS = {
  views: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h6a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4h6"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  app: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  compare: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h6M3 12h6M3 18h6"/><path d="M15 6h6M15 12h6M15 18h6"/></svg>',
  plug: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v6M15 4v6M7 10h10v4a5 5 0 0 1-10 0z"/><path d="M12 19v3"/></svg>',
  file: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
}

const stats = computed(() => {
  if (role.value === 'vendor') {
    return [
      { label: 'Listing views · 7d', value: '12,540', delta: '+18.4%', tone: 'up' as const, icon: ICONS.views },
      { label: 'Revenue · MTD', value: '$3,850', delta: '+9.1%', tone: 'up' as const, icon: ICONS.dollar },
      { label: 'New enquiries', value: '24', delta: '+6', tone: 'up' as const, icon: ICONS.inbox },
      { label: 'Active apps', value: '3', delta: '—', tone: 'neutral' as const, icon: ICONS.app }
    ]
  }
  if (role.value === 'admin') {
    return [
      { label: 'Platform visits · 7d', value: '84,210', delta: '+12.3%', tone: 'up' as const, icon: ICONS.views },
      { label: 'Active vendors', value: '348', delta: '+11', tone: 'up' as const, icon: ICONS.app },
      { label: 'Pending reviews', value: '17', delta: '-3', tone: 'down' as const, icon: ICONS.star },
      { label: 'MRR', value: '$42,180', delta: '+4.8%', tone: 'up' as const, icon: ICONS.dollar }
    ]
  }
  return [
    { label: 'Saved apps', value: '8', delta: '+2', tone: 'up' as const, icon: ICONS.star },
    { label: 'Active comparisons', value: '3', delta: '—', tone: 'neutral' as const, icon: ICONS.compare },
    { label: 'Open enquiries', value: '2', delta: '—', tone: 'neutral' as const, icon: ICONS.inbox },
    { label: 'Categories explored', value: '12', delta: '+4', tone: 'up' as const, icon: ICONS.app }
  ]
})

interface Activity { id: string; title: string; meta: string; time: string; kind: 'success' | 'info' | 'warn' }

const activity = computed<Activity[]>(() => {
  if (role.value === 'vendor') {
    return [
      { id: '1', title: 'New enquiry from Acme Corp', meta: 'Slack listing', time: '2h ago', kind: 'success' },
      { id: '2', title: '3 new reviews this week', meta: 'Avg. rating 4.7', time: '1d ago', kind: 'info' },
      { id: '3', title: 'Listing views up 18%', meta: 'HubSpot CRM', time: '2d ago', kind: 'success' },
      { id: '4', title: 'Integration request pending', meta: 'Zapier · review needed', time: '3d ago', kind: 'warn' }
    ]
  }
  if (role.value === 'admin') {
    return [
      { id: '1', title: '12 new vendor signups', meta: 'This week', time: '1h ago', kind: 'success' },
      { id: '2', title: 'Flagged review pending', meta: 'Salesforce listing', time: '4h ago', kind: 'warn' },
      { id: '3', title: 'Payment failed · Stripe', meta: 'Vendor ID 8821', time: '1d ago', kind: 'warn' }
    ]
  }
  return [
    { id: '1', title: 'You saved 3 apps to your shortlist', meta: 'CRM & Sales', time: '2h ago', kind: 'success' },
    { id: '2', title: 'Comparison updated: Slack vs Teams vs Discord', meta: 'Team Collaboration', time: '1d ago', kind: 'info' },
    { id: '3', title: 'Enquiry sent to HubSpot', meta: 'Awaiting response', time: '2d ago', kind: 'info' }
  ]
})

interface QuickAction { label: string; desc: string; to: string; icon: string }

const quickActions = computed<QuickAction[]>(() => {
  if (role.value === 'vendor') {
    return [
      { label: 'Update listing', desc: 'Edit your apps', to: '/dashboard/products', icon: ICONS.app },
      { label: 'View analytics', desc: 'Traffic & conversions', to: '/dashboard/analytics', icon: ICONS.views },
      { label: 'Manage integrations', desc: 'Native & partner', to: '/dashboard/integrations/all', icon: ICONS.plug },
      { label: 'Documents', desc: 'Invoices & contracts', to: '/dashboard/documents', icon: ICONS.file }
    ]
  }
  if (role.value === 'admin') {
    return [
      { label: 'Moderate reviews', desc: '17 pending', to: '/dashboard/reviews', icon: ICONS.star },
      { label: 'Users & roles', desc: 'Manage access', to: '/dashboard/user-management', icon: ICONS.app },
      { label: 'Full admin panel', desc: 'System settings', to: '/admin', icon: ICONS.plug }
    ]
  }
  return [
    { label: 'Compare apps', desc: 'Side-by-side', to: '/dashboard/analytics', icon: ICONS.compare },
    { label: 'My enquiries', desc: 'Track responses', to: '/dashboard/enquiries', icon: ICONS.inbox },
    { label: 'Browse marketplace', desc: '1,200+ apps', to: '/marketplace', icon: ICONS.app },
    { label: 'Set budget alerts', desc: 'Never overspend', to: '/dashboard/budget', icon: ICONS.dollar }
  ]
})
</script>

<style scoped>
.overview { display: flex; flex-direction: column; gap: 1.5rem; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--sw-primary, #ff8838);
  color: #fff;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
  transition: all 0.15s ease;
  border: 0;
  cursor: pointer;
}
.btn-primary:hover { background: var(--sw-primary-hover, #e67326); transform: translateY(-1px); }

.overview__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 1100px) { .overview__stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .overview__stats { grid-template-columns: 1fr; } }

.overview__grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1.25rem;
}
@media (max-width: 1000px) { .overview__grid { grid-template-columns: 1fr; } }

.card {
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 14px;
  overflow: hidden;
}
.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #f0efec;
}
.card__head h2 {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0;
}
.card__link {
  color: var(--sw-primary, #ff8838);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}
.card__link:hover { text-decoration: underline; }

/* Activity */
.activity { list-style: none; margin: 0; padding: 0; }
.activity__item {
  display: flex;
  gap: 0.85rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid #f0efec;
  align-items: flex-start;
}
.activity__item:last-child { border-bottom: 0; }
.activity__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.45rem;
  flex-shrink: 0;
}
.activity__dot.is-success { background: #22c55e; }
.activity__dot.is-info { background: #3b82f6; }
.activity__dot.is-warn { background: var(--sw-primary, #ff8838); }
.activity__body { min-width: 0; flex: 1; }
.activity__title { color: #1e1e1e; font-weight: 500; font-size: 0.92rem; }
.activity__meta { color: #71717a; font-size: 0.8rem; margin-top: 0.15rem; }

/* Actions */
.actions { display: flex; flex-direction: column; padding: 0.5rem; }
.action {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}
.action:hover { background: var(--sw-primary-soft, #fff1e6); }
.action__icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.action:hover .action__icon { background: #fff; }
.action__text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.action__label { font-size: 0.92rem; font-weight: 600; color: #1e1e1e; }
.action__desc { font-size: 0.78rem; color: #71717a; }
.action__arrow { color: #a1a1aa; flex-shrink: 0; transition: all 0.15s ease; }
.action:hover .action__arrow { color: var(--sw-primary, #ff8838); transform: translateX(3px); }
</style>
