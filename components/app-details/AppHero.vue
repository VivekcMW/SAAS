<script setup lang="ts">
import { computed } from 'vue'

interface Pricing {
  type: 'free' | 'trial' | 'paid' | 'contact'
  value?: number
  period?: string
}

interface App {
  id: string
  slug?: string
  name: string
  logo: string
  provider: string
  description: string
  rating: number
  reviewCount: number
  tags?: string[]
  pricing: Pricing
  category?: string
  featured?: boolean
  trending?: boolean
  sponsored?: boolean
  screenshots?: { url: string; caption?: string }[]
  analytics?: { activeUsers?: number }
  performance?: { uptime?: number }
  lastUpdated?: string
  version?: string
}

interface Props {
  app: App
  verdict?: string
  inSaved?: boolean
  inCompare?: boolean
  canAddMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  inSaved: false,
  inCompare: false,
  canAddMore: true
})

defineEmits<{
  trial: []
  demo: []
  save: []
  share: []
  compare: []
}>()

const priceLabel = computed(() => {
  const p = props.app.pricing
  if (p.type === 'free') return 'Free'
  if (p.type === 'contact') return 'Custom pricing'
  if (p.type === 'trial') return 'Free trial'
  if (p.value) {
    const suffix = p.period ? `/${p.period}` : ''
    return `from $${p.value}${suffix}`
  }
  return 'Paid'
})

const ctaLabel = computed(() => {
  if (props.app.pricing.type === 'free') return 'Get started — it\'s free'
  if (props.app.pricing.type === 'contact') return 'Talk to sales'
  return 'Start free trial'
})

const ctaSubLabel = computed(() => {
  if (props.app.pricing.type === 'free') return 'No credit card required'
  if (props.app.pricing.type === 'contact') return 'Custom pricing for your team'
  return 'Cancel anytime · No credit card'
})

const heroImage = computed(() => props.app.screenshots?.[0]?.url ?? '')

const formattedUsers = computed(() => {
  const n = props.app.analytics?.activeUsers ?? 0
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  if (n > 0) return String(n)
  return '10K+'
})

const valueProps = computed(() => {
  const p = props.app.pricing
  let primary: { icon: string; label: string }
  if (p.type === 'free') primary = { icon: 'heroicons:gift', label: 'Free forever plan' }
  else if (p.type === 'trial') primary = { icon: 'heroicons:bolt', label: '14-day free trial' }
  else if (p.type === 'contact') primary = { icon: 'heroicons:building-office-2', label: 'Built for enterprise' }
  else primary = { icon: 'heroicons:bolt', label: 'Setup in minutes' }

  return [
    primary,
    { icon: 'heroicons:shield-check', label: 'SOC 2 Type II compliant' },
    { icon: 'heroicons:users', label: `${formattedUsers.value} active users` }
  ]
})
</script>

<template>
  <section class="app-hero">
    <!-- Top trust bar -->
    <div class="hero-trust">
      <div class="trust-item">
        <Icon name="heroicons:check-badge" class="trust-icon verified" />
        <span>Verified vendor</span>
      </div>
      <span class="trust-sep">·</span>
      <div class="trust-item">
        <Icon name="heroicons:signal" class="trust-icon" />
        <span>{{ app.performance?.uptime ?? 99.9 }}% uptime</span>
      </div>
      <span v-if="app.lastUpdated" class="trust-sep">·</span>
      <div v-if="app.lastUpdated" class="trust-item">
        <Icon name="heroicons:clock" class="trust-icon" />
        <span>Updated {{ app.lastUpdated }}</span>
      </div>
    </div>

    <div class="hero-grid">
      <!-- Left: branding + headline + CTAs -->
      <div class="hero-left">
        <div class="brand-row">
          <div class="logo-wrap">
            <img :src="app.logo" :alt="`${app.name} logo`" class="logo-img">
          </div>
          <div class="brand-text">
            <p class="provider-pill">by {{ app.provider }}</p>
            <div class="hero-badges">
              <Badge v-if="verdict" variant="sponsored">{{ verdict }}</Badge>
              <Badge v-else-if="app.featured" variant="sponsored">Editor's Pick</Badge>
              <Badge v-if="app.trending" variant="trending">Trending</Badge>
            </div>
          </div>
        </div>

        <h1 class="hero-title">{{ app.name }}</h1>
        <p class="hero-tagline">{{ app.description }}</p>

        <!-- Social proof + price line -->
        <div class="hero-meta">
          <div class="meta-rating">
            <Rating :model-value="app.rating" :show-value="true" readonly size="md" />
            <span class="meta-count">{{ app.reviewCount.toLocaleString() }} reviews</span>
          </div>
          <span class="meta-sep">·</span>
          <span class="meta-price">{{ priceLabel }}</span>
        </div>

        <!-- Value props -->
        <ul class="value-props">
          <li v-for="vp in valueProps" :key="vp.label">
            <Icon :name="vp.icon" />
            <span>{{ vp.label }}</span>
          </li>
        </ul>

        <!-- Inline CTAs -->
        <div class="hero-ctas">
          <Button variant="primary" size="lg" @click="$emit('trial')">
            {{ ctaLabel }}
            <Icon name="heroicons:arrow-right" class="cta-arrow" />
          </Button>
          <Button variant="ghost" size="lg" @click="$emit('demo')">
            <Icon name="heroicons:play-circle" class="demo-icon" />
            Watch 2-min demo
          </Button>
        </div>
        <p class="cta-sub">{{ ctaSubLabel }}</p>

        <!-- Quick actions row -->
        <div class="quick-actions">
          <button type="button" class="qa-btn" :class="{ 'qa-btn--active': props.inSaved }" @click="$emit('save')">
            <Icon :name="props.inSaved ? 'heroicons:heart-solid' : 'heroicons:heart'" />
            {{ props.inSaved ? 'Saved' : 'Save' }}
          </button>
          <button
            type="button"
            class="qa-btn"
            :class="{ 'qa-btn--active': props.inCompare }"
            :disabled="!props.inCompare && !props.canAddMore"
            :title="props.inCompare ? 'Remove from compare' : (!props.canAddMore ? 'Compare list full (4/4)' : 'Add to compare')"
            @click="$emit('compare')"
          >
            <Icon :name="props.inCompare ? 'heroicons:scale-solid' : 'heroicons:scale'" />
            {{ props.inCompare ? 'In Compare' : 'Compare' }}
          </button>
          <slot name="share">
            <button type="button" class="qa-btn" @click="$emit('share')">
              <Icon name="heroicons:share" />
              Share
            </button>
          </slot>
        </div>
      </div>

      <!-- Right: hero preview / screenshot -->
      <div class="hero-right">
        <div class="preview-card">
          <div class="preview-chrome">
            <span class="dot dot-r" />
            <span class="dot dot-y" />
            <span class="dot dot-g" />
            <span class="preview-url">{{ app.provider.toLowerCase().replaceAll(/\s+/g, '') }}.com</span>
          </div>
          <div class="preview-body">
            <img v-if="heroImage" :src="heroImage" :alt="`${app.name} preview`" class="preview-img">
            <div v-else class="preview-placeholder">
              <img :src="app.logo" :alt="app.name" class="preview-logo">
              <p class="preview-name">{{ app.name }}</p>
              <p class="preview-mini">Live preview</p>
            </div>
          </div>
        </div>

        <!-- Mini stats below preview -->
        <div class="preview-stats">
          <div class="ps-item">
            <span class="ps-value">{{ formattedUsers }}</span>
            <span class="ps-label">Users</span>
          </div>
          <div class="ps-item">
            <span class="ps-value">{{ app.rating.toFixed(1) }}<Icon name="heroicons:star-solid" class="ps-star" /></span>
            <span class="ps-label">Rating</span>
          </div>
          <div class="ps-item">
            <span class="ps-value">{{ app.performance?.uptime ?? 99.9 }}%</span>
            <span class="ps-label">Uptime</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tag pills row -->
    <div v-if="app.tags?.length" class="hero-tags">
      <span class="tags-label">Best for:</span>
      <Tag v-for="t in app.tags.slice(0, 8)" :key="t" size="sm">{{ t }}</Tag>
    </div>
  </section>
</template>

<style scoped>
.app-hero {
  background: var(--mm-s1);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-xl);
  padding: 28px 32px 24px;
  position: relative;
  overflow: hidden;
}

/* Subtle accent backdrop */
.app-hero::before {
  content: '';
  position: absolute;
  top: -120px;
  right: -120px;
  width: 360px;
  height: 360px;
  background: var(--mm-gold-soft);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}
.app-hero > * { position: relative; z-index: 1; }

/* Trust bar */
.hero-trust {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 0.5px dashed var(--b1);
}
.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--mm-slate);
  font-weight: 500;
}
.trust-icon { width: 14px; height: 14px; color: var(--mm-slate); }
.trust-icon.verified { color: var(--mm-seal); }
.trust-sep { color: var(--b3); font-size: 12px; }

/* Grid */
.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 36px;
  align-items: start;
}

/* Left column */
.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.logo-wrap {
  width: 64px;
  height: 64px;
  border-radius: var(--r-lg);
  border: 0.5px solid var(--b2);
  background: var(--mm-s2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.logo-img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }

.brand-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.provider-pill { margin: 0; font-size: 13px; color: var(--mm-slate); font-weight: 500; }
.hero-badges { display: flex; flex-wrap: wrap; gap: 4px; }

.hero-title {
  margin: 0 0 8px;
  font-size: 36px;
  font-weight: 700;
  color: var(--mm-pearl);
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.hero-tagline {
  margin: 0 0 16px;
  font-size: 17px;
  color: var(--mm-silver);
  line-height: 1.55;
  max-width: 540px;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.meta-rating { display: flex; align-items: center; gap: 8px; }
.meta-count { font-size: 13px; color: var(--mm-slate); }
.meta-sep { color: var(--b3); }
.meta-price { font-size: 14px; color: var(--mm-pearl); font-weight: 600; }

/* Value props */
.value-props {
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.value-props li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--mm-silver);
  font-weight: 500;
}
.value-props li :deep(svg) {
  width: 18px;
  height: 18px;
  color: var(--mm-gold);
  flex-shrink: 0;
}

/* CTAs */
.hero-ctas {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.cta-arrow { width: 16px; height: 16px; margin-left: 4px; }
.demo-icon { width: 18px; height: 18px; margin-right: 4px; }
.cta-sub {
  margin: 0 0 16px;
  font-size: 12px;
  color: var(--mm-slate);
}

.quick-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 0.5px solid var(--b1);
}
.qa-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  color: var(--mm-slate);
  border: 0;
  padding: 6px 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--r-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.qa-btn:hover { background: var(--mm-s3); color: var(--mm-gold); }
.qa-btn--active { background: rgba(212,168,67,.1) !important; color: var(--mm-gold) !important; border-color: rgba(212,168,67,.3) !important; }
.qa-btn:disabled { opacity: .4; cursor: not-allowed; }
.qa-btn :deep(svg) { width: 14px; height: 14px; }

/* Right column: preview card */
.hero-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.preview-card {
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.preview-card:hover {
  box-shadow: var(--shadow-lg);
}

.preview-chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--mm-s3);
  border-bottom: 0.5px solid var(--b1);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}
.dot-r { background: #ff5f57; }
.dot-y { background: #febc2e; }
.dot-g { background: #28c840; }
.preview-url {
  margin-left: 12px;
  font-size: 11px;
  color: var(--mm-slate);
  font-family: ui-monospace, monospace;
}

.preview-body {
  position: relative;
  background: var(--mm-s3);
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
}
.preview-logo {
  width: 56px;
  height: 56px;
  border-radius: var(--r-lg);
  object-fit: contain;
  background: var(--mm-s2);
  padding: 8px;
  border: 0.5px solid var(--b2);
}
.preview-name { margin: 4px 0 0; font-size: 16px; font-weight: 600; color: var(--mm-pearl); }
.preview-mini { margin: 0; font-size: 12px; color: var(--mm-slate); }

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  padding: 12px;
}
.ps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px;
}
.ps-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--mm-pearl);
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.ps-star { width: 14px; height: 14px; color: var(--mm-gold); }
.ps-label { font-size: 11px; color: var(--mm-slate); text-transform: uppercase; letter-spacing: 0.04em; }

/* Tags row */
.hero-tags {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 0.5px solid var(--b1);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.tags-label { font-size: 12px; color: var(--mm-slate); font-weight: 500; margin-right: 4px; }

/* Responsive */
@media (max-width: 900px) {
  .app-hero { padding: 22px 20px 20px; }
  .hero-grid { grid-template-columns: 1fr; gap: 24px; }
  .hero-title { font-size: 28px; }
  .hero-tagline { font-size: 15px; }
  .preview-stats { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 480px) {
  .hero-title { font-size: 24px; }
  .hero-ctas { flex-direction: column; }
  .hero-ctas :deep(button) { width: 100%; }
}
</style>
