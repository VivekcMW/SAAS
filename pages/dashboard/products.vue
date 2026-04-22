<template>
  <div class="products">
    <DashPageHeader
      :title="headerTitle"
      :eyebrow="headerEyebrow"
      :description="headerDesc"
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

    <!-- Stats -->
    <div class="products__stats">
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

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar__search">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input v-model="query" type="text" :placeholder="role === 'vendor' ? 'Search your apps…' : 'Search saved apps…'" />
      </div>
      <div class="toolbar__filters">
        <button
          v-for="f in statusFilters"
          :key="f.key"
          type="button"
          class="chip"
          :class="{ 'is-active': status === f.key }"
          @click="status = f.key"
        >
          {{ f.label }}
          <span class="chip__count">{{ countByStatus(f.key) }}</span>
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="filtered.length" class="grid">
      <article v-for="p in filtered" :key="p.id" class="product-card">
        <header class="product-card__head">
          <div class="product-card__logo" :style="{ background: p.color }">{{ p.logo }}</div>
          <div class="product-card__meta">
            <h3>{{ p.name }}</h3>
            <span class="product-card__cat">{{ p.category }}</span>
          </div>
          <span class="product-card__status" :class="`is-${p.status}`">{{ statusLabel(p.status) }}</span>
        </header>

        <p class="product-card__tagline">{{ p.tagline }}</p>

        <div class="product-card__metrics">
          <div class="metric">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
            <span>{{ formatNumber(p.views) }}</span>
            <small>views</small>
          </div>
          <div class="metric">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#facc15" stroke="#facc15" stroke-width="1.4"/></svg>
            <span>{{ p.rating.toFixed(1) }}</span>
            <small>({{ p.reviews }})</small>
          </div>
          <div v-if="role === 'vendor'" class="metric">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 6v12M9 9h6a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
            <span>${{ formatNumber(p.revenue) }}</span>
            <small>MTD</small>
          </div>
          <div v-else class="metric">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>{{ p.enquiries }}</span>
            <small>enquiries</small>
          </div>
        </div>

        <footer class="product-card__foot">
          <NuxtLink
            v-if="role === 'vendor'"
            :to="`/app/${p.slug}`"
            target="_blank"
            rel="noopener"
            class="btn-outline"
          >
            Preview listing
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M14 4h6v6M20 4L10 14M20 14v6H4V4h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </NuxtLink>
          <NuxtLink v-else :to="`/app/${p.slug}`" class="btn-outline">View details</NuxtLink>
          <button v-if="role === 'vendor'" type="button" class="btn-ghost" @click="onEdit(p)">
            Edit
          </button>
          <button v-else type="button" class="btn-ghost" @click="onRemove(p)">
            Remove
          </button>
        </footer>
      </article>
    </div>

    <DashEmptyState
      v-else
      :title="emptyTitle"
      :description="emptyDesc"
      :icon="emptyIcon"
    >
      <template #actions>
        <NuxtLink v-if="role === 'vendor'" to="/list-product" class="btn-primary">Add your first app</NuxtLink>
        <NuxtLink v-else to="/marketplace" class="btn-primary">Browse marketplace</NuxtLink>
      </template>
    </DashEmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const { currentUser } = useAuth()
useHead({ title: 'Apps — SaaSWorld Dashboard' })

const role = computed(() => currentUser.value?.role || 'buyer')

const headerTitle = computed(() => role.value === 'vendor' ? 'My apps' : 'Saved apps')
const headerEyebrow = computed(() => role.value === 'vendor' ? 'Vendor listings' : 'Your shortlist')
const headerDesc = computed(() => role.value === 'vendor'
  ? 'Manage your SaaSWorld listings, track views and edit details.'
  : "Apps you've saved while exploring the marketplace.")

interface Product {
  id: string
  slug: string
  name: string
  logo: string
  color: string
  category: string
  tagline: string
  status: 'live' | 'draft' | 'pending' | 'saved'
  views: number
  rating: number
  reviews: number
  revenue: number
  enquiries: number
}

const vendorProducts: Product[] = [
  { id: 'v1', slug: 'taskflow-pro', name: 'TaskFlow Pro', logo: 'T', color: '#FFF1E6', category: 'Project management', tagline: 'Visual task boards with AI automation for fast-moving teams.', status: 'live', views: 12540, rating: 4.7, reviews: 238, revenue: 3850, enquiries: 18 },
  { id: 'v2', slug: 'analytics-hub', name: 'Analytics Hub', logo: 'A', color: '#E6F4FF', category: 'Analytics', tagline: 'Unified dashboards across every data source you care about.', status: 'live', views: 8320, rating: 4.5, reviews: 156, revenue: 2410, enquiries: 11 },
  { id: 'v3', slug: 'design-studio', name: 'Design Studio', logo: 'D', color: '#F3E8FF', category: 'Design', tagline: 'Collaborative design system for product teams.', status: 'draft', views: 0, rating: 0, reviews: 0, revenue: 0, enquiries: 0 }
]

const buyerProducts: Product[] = [
  { id: 'b1', slug: 'slack', name: 'Slack', logo: 'S', color: '#F4E4FF', category: 'Team collaboration', tagline: 'Channel-based messaging for teams of every size.', status: 'saved', views: 0, rating: 4.6, reviews: 15420, revenue: 0, enquiries: 0 },
  { id: 'b2', slug: 'hubspot', name: 'HubSpot', logo: 'H', color: '#FFE6E1', category: 'CRM & Sales', tagline: 'CRM, marketing and service in one connected platform.', status: 'saved', views: 0, rating: 4.5, reviews: 9240, revenue: 0, enquiries: 1 },
  { id: 'b3', slug: 'notion', name: 'Notion', logo: 'N', color: '#F5F5F5', category: 'Productivity', tagline: 'Docs, wikis and projects — all in one workspace.', status: 'saved', views: 0, rating: 4.7, reviews: 12100, revenue: 0, enquiries: 0 },
  { id: 'b4', slug: 'figma', name: 'Figma', logo: 'F', color: '#E6F4FF', category: 'Design', tagline: 'Collaborative interface design in the browser.', status: 'saved', views: 0, rating: 4.8, reviews: 18200, revenue: 0, enquiries: 0 },
  { id: 'b5', slug: 'mixpanel', name: 'Mixpanel', logo: 'M', color: '#FFF1E6', category: 'Analytics', tagline: 'Product analytics that help teams make better decisions.', status: 'saved', views: 0, rating: 4.4, reviews: 4820, revenue: 0, enquiries: 1 }
]

const products = computed(() => role.value === 'vendor' ? vendorProducts : buyerProducts)

// Icons
const ICONS = {
  app: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h6a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4h6"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'
}

const stats = computed(() => {
  if (role.value === 'vendor') {
    const live = vendorProducts.filter(p => p.status === 'live').length
    const views = vendorProducts.reduce((a, p) => a + p.views, 0)
    const rev = vendorProducts.reduce((a, p) => a + p.revenue, 0)
    const enq = vendorProducts.reduce((a, p) => a + p.enquiries, 0)
    return [
      { label: 'Total apps', value: String(vendorProducts.length), delta: `${live} live`, tone: 'neutral' as const, icon: ICONS.app },
      { label: 'Views · 7d', value: formatNumber(views), delta: '+12.4%', tone: 'up' as const, icon: ICONS.eye },
      { label: 'Revenue · MTD', value: `$${formatNumber(rev)}`, delta: '+8.1%', tone: 'up' as const, icon: ICONS.dollar },
      { label: 'New enquiries', value: String(enq), delta: '+5', tone: 'up' as const, icon: ICONS.inbox }
    ]
  }
  const enq = buyerProducts.reduce((a, p) => a + p.enquiries, 0)
  const avg = (buyerProducts.reduce((a, p) => a + p.rating, 0) / buyerProducts.length).toFixed(1)
  return [
    { label: 'Saved apps', value: String(buyerProducts.length), delta: '+2 this week', tone: 'up' as const, icon: ICONS.bookmark },
    { label: 'Categories', value: String(new Set(buyerProducts.map(p => p.category)).size), delta: '—', tone: 'neutral' as const, icon: ICONS.app },
    { label: 'Avg. rating', value: avg, delta: '—', tone: 'neutral' as const, icon: ICONS.star },
    { label: 'Open enquiries', value: String(enq), delta: '—', tone: 'neutral' as const, icon: ICONS.inbox }
  ]
})

const statusFilters = computed(() => {
  if (role.value === 'vendor') {
    return [
      { key: 'all', label: 'All' },
      { key: 'live', label: 'Live' },
      { key: 'draft', label: 'Draft' },
      { key: 'pending', label: 'Pending' }
    ]
  }
  return [
    { key: 'all', label: 'All' },
    { key: 'saved', label: 'Saved' }
  ]
})

const query = ref('')
const status = ref<string>('all')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return products.value.filter((p) => {
    if (status.value !== 'all' && p.status !== status.value) return false
    if (q && !(p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q))) return false
    return true
  })
})

function countByStatus(key: string) {
  if (key === 'all') return products.value.length
  return products.value.filter(p => p.status === key).length
}

function statusLabel(s: string) {
  const map: Record<string, string> = { live: 'Live', draft: 'Draft', pending: 'Pending', saved: 'Saved' }
  return map[s] || s
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return String(n)
}

const emptyTitle = computed(() => role.value === 'vendor' ? 'No apps match your filters' : 'Nothing saved yet')
const emptyDesc = computed(() => role.value === 'vendor'
  ? 'Try clearing filters or add a new listing to grow your reach.'
  : 'Save apps while browsing to build your shortlist and compare later.')
const emptyIcon = ICONS.bookmark

function onEdit(p: Product) {
  // NOTE: wire to edit page once available
  navigateTo(`/list-product?edit=${p.slug}`)
}
function onRemove(p: Product) {
  // NOTE: hook to backend — local demo state only
  const idx = buyerProducts.findIndex(x => x.id === p.id)
  if (idx >= 0) buyerProducts.splice(idx, 1)
}
</script>

<style scoped>
.products { display: flex; flex-direction: column; gap: 1.5rem; }

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
  border: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-primary:hover { background: var(--sw-primary-hover, #e67326); transform: translateY(-1px); }

.products__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 1100px) { .products__stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .products__stats { grid-template-columns: 1fr; } }

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.toolbar__search {
  flex: 1;
  min-width: 240px;
  max-width: 380px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem;
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 10px;
  color: #71717a;
}
.toolbar__search:focus-within {
  border-color: var(--sw-primary, #ff8838);
  box-shadow: 0 0 0 3px rgba(255, 136, 56, 0.1);
}
.toolbar__search input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  color: #1e1e1e;
  min-width: 0;
}
.toolbar__filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #52525b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.chip:hover { border-color: #e4e0dc; background: #fbfaf8; }
.chip.is-active {
  background: var(--sw-primary-soft, #fff1e6);
  border-color: var(--sw-primary, #ff8838);
  color: var(--sw-primary, #ff8838);
}
.chip__count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  background: #f4f4f5;
  color: #71717a;
}
.chip.is-active .chip__count { background: #fff; color: var(--sw-primary, #ff8838); }

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.product-card {
  background: #fff;
  border: 1px solid #f0efec;
  border-radius: 14px;
  padding: 1.1rem 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: all 0.15s ease;
}
.product-card:hover {
  border-color: #e4e0dc;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -18px rgba(15, 23, 42, 0.18);
}

.product-card__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.product-card__logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-weight: 700;
  font-size: 1.05rem;
  color: #1e1e1e;
  flex-shrink: 0;
}
.product-card__meta { flex: 1; min-width: 0; }
.product-card__meta h3 {
  font-family: var(--font-heading, 'Poppins', system-ui, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-card__cat {
  font-size: 0.78rem;
  color: #71717a;
}

.product-card__status {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
}
.product-card__status.is-live { background: #dcfce7; color: #15803d; }
.product-card__status.is-draft { background: #f4f4f5; color: #52525b; }
.product-card__status.is-pending { background: #fef9c3; color: #a16207; }
.product-card__status.is-saved { background: var(--sw-primary-soft, #fff1e6); color: var(--sw-primary, #ff8838); }

.product-card__tagline {
  font-size: 0.88rem;
  color: #52525b;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__metrics {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 0;
  border-top: 1px solid #f4f3f0;
  border-bottom: 1px solid #f4f3f0;
  color: #71717a;
  font-size: 0.82rem;
  flex-wrap: wrap;
}
.metric { display: inline-flex; align-items: center; gap: 0.3rem; }
.metric span { font-weight: 600; color: #1e1e1e; }
.metric small { color: #a1a1aa; font-size: 0.75rem; }

.product-card__foot { display: flex; gap: 0.5rem; }

.btn-outline {
  flex: 1;
  padding: 0.55rem 0.85rem;
  background: #fff;
  border: 1px solid #e4e0dc;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e1e1e;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.btn-outline:hover { border-color: var(--sw-primary, #ff8838); color: var(--sw-primary, #ff8838); }

.btn-ghost {
  padding: 0.55rem 0.85rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #52525b;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.btn-ghost:hover { background: #fbfaf8; color: #1e1e1e; }
</style>
