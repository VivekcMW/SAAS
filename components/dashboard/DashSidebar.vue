<template>
  <aside class="dash-sidebar" :class="{ 'is-collapsed': collapsed }">
    <div class="dash-sidebar__head">
      <NuxtLink to="/" class="dash-sidebar__logo" aria-label="SaaSWorld home">
        <span class="dash-sidebar__logo-mark">S</span>
        <span v-if="!collapsed" class="dash-sidebar__logo-text">SaaSWorld</span>
      </NuxtLink>
      <button
        type="button"
        class="dash-sidebar__collapse"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="$emit('toggle')"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path :d="collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Role badge -->
    <div v-if="!collapsed && role" class="dash-sidebar__role">
      <span class="dash-sidebar__role-dot" :class="`is-${role}`" aria-hidden="true" />
      <span class="dash-sidebar__role-label">{{ roleLabel }}</span>
    </div>

    <nav class="dash-sidebar__nav" aria-label="Dashboard navigation">
      <template v-for="group in groups" :key="group.title">
        <div v-if="!collapsed" class="dash-sidebar__group">{{ group.title }}</div>
        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="dash-sidebar__link"
          :class="{ 'is-active': isActive(item.to) }"
          :title="collapsed ? item.label : undefined"
        >
          <span class="dash-sidebar__icon" aria-hidden="true" v-html="item.icon" />
          <span v-if="!collapsed" class="dash-sidebar__label">{{ item.label }}</span>
          <span v-if="!collapsed && item.badge" class="dash-sidebar__badge">{{ item.badge }}</span>
        </NuxtLink>
      </template>
    </nav>

    <div class="dash-sidebar__foot">
      <button type="button" class="dash-sidebar__link dash-sidebar__logout" @click="$emit('logout')" :title="collapsed ? 'Sign out' : undefined">
        <span class="dash-sidebar__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        </span>
        <span v-if="!collapsed" class="dash-sidebar__label">Sign out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NavItem {
  to: string
  label: string
  icon: string
  badge?: string | number
}
interface NavGroup {
  title: string
  items: NavItem[]
}

const props = defineProps<{
  role: 'buyer' | 'vendor' | 'admin' | null
  collapsed: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'logout'): void
}>()

const route = useRoute()

const roleLabel = computed(() => {
  if (props.role === 'buyer') return 'Buyer workspace'
  if (props.role === 'vendor') return 'Vendor workspace'
  if (props.role === 'admin') return 'Admin console'
  return ''
})

function isActive(to: string) {
  if (to === '/dashboard/overview') return route.path === '/dashboard' || route.path.startsWith('/dashboard/overview')
  return route.path === to || route.path.startsWith(to + '/')
}

// Icons as inline SVG strings for speed + brand consistency
const ICONS = {
  home: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>',
  saved: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  compare: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h6M3 12h6M3 18h6"/><path d="M15 6h6M15 12h6M15 18h6"/><path d="M9 3v18M15 3v18"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  card: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  apps: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  chart: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>',
  plug: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v6M15 4v6M7 10h10v4a5 5 0 0 1-10 0z"/><path d="M12 19v3"/></svg>',
  team: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/></svg>',
  file: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  budget: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h6a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4h6"/></svg>'
}

const buyerGroups: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      { to: '/dashboard/overview', label: 'Overview', icon: ICONS.home },
      { to: '/dashboard/products', label: 'Saved apps', icon: ICONS.saved },
      { to: '/dashboard/compare', label: 'Compare', icon: ICONS.compare },
      { to: '/dashboard/enquiries', label: 'Enquiries', icon: ICONS.inbox },
      { to: '/dashboard/reviews', label: 'Reviews', icon: ICONS.star }
    ]
  },
  {
    title: 'Discover',
    items: [
      { to: '/dashboard/recommendations', label: 'Recommendations', icon: ICONS.apps },
      { to: '/dashboard/deals', label: 'Deals', icon: ICONS.budget },
      { to: '/dashboard/digest', label: 'Weekly digest', icon: ICONS.chart }
    ]
  },
  {
    title: 'Account',
    items: [
      { to: '/dashboard/profile', label: 'Profile', icon: ICONS.user },
      { to: '/dashboard/billing', label: 'Billing', icon: ICONS.card }
    ]
  }
]

const vendorGroups: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      { to: '/dashboard/overview', label: 'Overview', icon: ICONS.home },
      { to: '/dashboard/products', label: 'Listings', icon: ICONS.apps },
      { to: '/dashboard/leads', label: 'Leads', icon: ICONS.inbox },
      { to: '/dashboard/reviews', label: 'Reviews', icon: ICONS.star }
    ]
  },
  {
    title: 'Grow',
    items: [
      { to: '/dashboard/analytics', label: 'Analytics', icon: ICONS.chart },
      { to: '/dashboard/promotions', label: 'Promotions', icon: ICONS.budget },
      { to: '/dashboard/similar-vendors', label: 'Similar vendors', icon: ICONS.compare }
    ]
  },
  {
    title: 'AI Studio',
    items: [
      { to: '/dashboard/copilot', label: 'Copilot', icon: ICONS.chart, badge: 'AI' },
      { to: '/dashboard/content-assistant', label: 'Content assistant', icon: ICONS.file, badge: 'AI' },
      { to: '/dashboard/insights', label: 'Insights', icon: ICONS.saved, badge: 'AI' }
    ]
  },
  {
    title: 'Account',
    items: [
      { to: '/dashboard/profile', label: 'Company profile', icon: ICONS.user },
      { to: '/dashboard/billing', label: 'Billing & plan', icon: ICONS.card },
      { to: '/dashboard/team', label: 'Team & API', icon: ICONS.team }
    ]
  }
]

const adminGroups: NavGroup[] = [
  {
    title: 'Platform',
    items: [
      { to: '/dashboard/overview', label: 'Overview', icon: ICONS.home },
      { to: '/dashboard/users', label: 'Users', icon: ICONS.team },
      { to: '/dashboard/products', label: 'Apps', icon: ICONS.apps },
      { to: '/dashboard/revenue', label: 'Revenue', icon: ICONS.card }
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/dashboard/pending-apps', label: 'Pending approvals', icon: ICONS.file },
      { to: '/dashboard/support', label: 'Support', icon: ICONS.inbox }
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/dashboard/activity', label: 'Activity log', icon: ICONS.file },
      { to: '/dashboard/settings', label: 'Settings', icon: ICONS.user }
    ]
  }
]

const groups = computed<NavGroup[]>(() => {
  if (props.role === 'vendor') return vendorGroups
  if (props.role === 'admin') return adminGroups
  return buyerGroups
})
</script>

<style scoped>
.dash-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 248px;
  background: #fff;
  border-right: 1px solid #f0efec;
  display: flex;
  flex-direction: column;
  z-index: 40;
  transition: width 0.2s ease;
}
.dash-sidebar.is-collapsed { width: 68px; }

.dash-sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid #f0efec;
  min-height: 68px;
}
.dash-sidebar__logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #1e1e1e;
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  min-width: 0;
}
.dash-sidebar__logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--sw-primary, #ff8838);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}
.dash-sidebar__logo-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dash-sidebar__collapse {
  background: transparent;
  border: 1px solid #f0efec;
  border-radius: 6px;
  color: #71717a;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.dash-sidebar__collapse:hover { color: var(--sw-primary, #ff8838); border-color: var(--sw-primary, #ff8838); }

.dash-sidebar__role {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #fbfaf8;
  border-bottom: 1px solid #f0efec;
  font-size: 0.78rem;
  color: #52525b;
  font-weight: 500;
}
.dash-sidebar__role-dot { width: 8px; height: 8px; border-radius: 50%; }
.dash-sidebar__role-dot.is-buyer { background: #22c55e; }
.dash-sidebar__role-dot.is-vendor { background: var(--sw-primary, #ff8838); }
.dash-sidebar__role-dot.is-admin { background: #8b5cf6; }

.dash-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dash-sidebar__group {
  padding: 14px 10px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #a1a1aa;
  text-transform: uppercase;
}
.dash-sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: #52525b;
  font-size: 0.92rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
  background: transparent;
  border: 0;
  width: 100%;
  cursor: pointer;
  font-family: inherit;
}
.dash-sidebar__link:hover { background: #fbfaf8; color: #1e1e1e; }
.dash-sidebar__link.is-active {
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
}
.dash-sidebar__link.is-active .dash-sidebar__icon { color: var(--sw-primary, #ff8838); }
.dash-sidebar__icon {
  width: 20px;
  height: 20px;
  color: #71717a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dash-sidebar__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dash-sidebar__badge {
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
}

.dash-sidebar.is-collapsed .dash-sidebar__nav { padding: 12px 8px 20px; }
.dash-sidebar.is-collapsed .dash-sidebar__link { justify-content: center; padding: 10px 8px; }

.dash-sidebar__foot {
  padding: 10px 12px 16px;
  border-top: 1px solid #f0efec;
}
.dash-sidebar__logout { color: #52525b; }
.dash-sidebar__logout:hover { background: #fef2f2; color: #dc2626; }
.dash-sidebar__logout:hover .dash-sidebar__icon { color: #dc2626; }

/* Mobile — hide sidebar by default, overlay when open */
@media (max-width: 900px) {
  .dash-sidebar { transform: translateX(-100%); transition: transform 0.2s ease; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15); }
  .dash-sidebar.is-collapsed { transform: translateX(0); width: 248px; }
}
</style>
