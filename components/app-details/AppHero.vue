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
  <!-- ── BORDERLESS HERO: full-bleed screenshot + open editorial layout ── -->
  <section class="app-hero">

    <!-- Ambient glow blobs (pure atmosphere, no border) -->
    <div class="hero-glow hero-glow--gold" aria-hidden="true" />
    <div class="hero-glow hero-glow--blue" aria-hidden="true" />

    <div class="hero-grid">
      <!-- ══ LEFT: editorial content ══ -->
      <div class="hero-left">

        <!-- Brand row: logo + provider + badges -->
        <div class="brand-row">
          <div class="logo-halo">
            <img :src="app.logo" :alt="`${app.name} logo`" class="logo-img">
          </div>
          <div class="brand-meta">
            <span class="provider-label">
              <Icon name="heroicons:building-office-2" class="prov-icon" />
              {{ app.provider }}
            </span>
            <div class="hero-badges">
              <span v-if="verdict" class="badge badge--gold">
                <Icon name="heroicons:sparkles" />{{ verdict }}
              </span>
              <span v-if="app.trending" class="badge badge--blue">
                <Icon name="heroicons:arrow-trending-up" />Trending
              </span>
              <span class="badge badge--verify">
                <Icon name="heroicons:check-badge" />Verified
              </span>
            </div>
          </div>
        </div>

        <!-- Title -->
        <h1 class="hero-title">{{ app.name }}</h1>
        <p class="hero-tagline">{{ app.description }}</p>

        <!-- Rating + price inline -->
        <div class="hero-meta">
          <Rating :model-value="app.rating" :show-value="true" readonly size="md" />
          <span class="meta-count">{{ app.reviewCount.toLocaleString() }} reviews</span>
          <span class="meta-dot" />
          <span class="meta-price">{{ priceLabel }}</span>

        </div>

        <!-- Value props: 3 check rows -->
        <ul class="value-props">
          <li v-for="vp in valueProps" :key="vp.label">
            <span class="vp-check"><Icon name="heroicons:check" /></span>
            <span>{{ vp.label }}</span>
          </li>
        </ul>

        <!-- Primary CTA -->
        <div class="hero-ctas">
          <Button variant="primary" size="lg" @click="$emit('trial')">
            {{ ctaLabel }}
            <Icon name="heroicons:arrow-right" class="cta-arrow" />
          </Button>
          <Button variant="ghost" size="lg" @click="$emit('demo')">
            <Icon name="heroicons:play-circle" class="demo-icon" />
            Watch demo
          </Button>
        </div>
        <p class="cta-sub">{{ ctaSubLabel }}</p>

        <!-- Utility actions: save / compare / share — minimal ghost style -->
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

      <!-- ══ RIGHT: immersive full-bleed screenshot ══ -->
      <div class="hero-right">
        <!-- Browser chrome bar -->
        <div class="screen-chrome">
          <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
          <span class="screen-url">{{ app.provider.toLowerCase().replaceAll(/\s+/g, '') }}.com</span>
          <span class="screen-live">
            <span class="live-dot" />LIVE
          </span>
        </div>

        <!-- Screenshot panel — no border box, depth via shadow only -->
        <div class="screen-panel">
          <img v-if="heroImage" :src="heroImage" :alt="`${app.name} interface`" class="screen-img">
          <div v-else class="screen-empty">
            <img :src="app.logo" :alt="app.name" class="screen-empty-logo">
            <p class="screen-empty-name">{{ app.name }}</p>
          </div>
          <!-- Left fade so screenshot blends into page -->
          <div class="screen-fade" aria-hidden="true" />
        </div>

        <!-- Stats anchor strip below screenshot -->
        <div class="screen-stats">
          <div class="ss-item">
            <span class="ss-val">{{ formattedUsers }}</span>
            <span class="ss-lbl">Users</span>
          </div>
          <div class="ss-sep" />
          <div class="ss-item">
            <span class="ss-val">{{ app.rating.toFixed(1) }}<Icon name="heroicons:star-solid" class="ss-star" /></span>
            <span class="ss-lbl">Rating</span>
          </div>
          <div class="ss-sep" />
          <div class="ss-item">
            <span class="ss-val">{{ app.version || 'v3.0' }}</span>
            <span class="ss-lbl">Version</span>
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
/* ── BASE: no card, no border, blends into page ── */
.app-hero {
  position: relative;
  padding: 40px 0 32px;
  overflow: hidden;
}

/* ── AMBIENT GLOW BLOBS ── */
.hero-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.18;
  z-index: 0;
}
.hero-glow--gold {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, #D4A843 0%, transparent 70%);
  top: -160px;
  right: -80px;
}
.hero-glow--blue {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, #4A80D4 0%, transparent 70%);
  bottom: -100px;
  left: -60px;
}
.app-hero > *:not(.hero-glow) { position: relative; z-index: 1; }

/* ── GRID ── */
.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 48px;
  align-items: center;
}
.hero-grid > * { min-width: 0; }

/* ══ LEFT COLUMN ══ */
.brand-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

/* Logo with soft gold shadow halo */
.logo-halo {
  width: 72px;
  height: 72px;
  border-radius: var(--r-xl);
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 0 0 4px rgba(212, 168, 67, 0.08), 0 8px 24px rgba(0, 0, 0, 0.3);
}
.logo-img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }

.brand-meta { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.provider-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--mm-slate);
  font-weight: 500;
  letter-spacing: 0.02em;
}
.prov-icon { width: 13px; height: 13px; }

.hero-badges { display: flex; flex-wrap: wrap; gap: 5px; }
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 8px;
  border-radius: var(--r-full);
}
.badge :deep(svg) { width: 12px; height: 12px; }
.badge--gold { background: #2A2212; color: #E8C060; border: 0.5px solid rgba(212,168,67,0.3); }
.badge--blue { background: #161E33; color: #8AB4F8; border: 0.5px solid rgba(74,128,212,0.3); }
.badge--verify { background: #112220; color: #3DBFB0; border: 0.5px solid rgba(42,157,143,0.3); }

.hero-title {
  margin: 0 0 10px;
  font-size: 40px;
  font-weight: 800;
  color: var(--mm-pearl);
  line-height: 1.1;
  letter-spacing: -0.025em;
}
.hero-tagline {
  margin: 0 0 20px;
  font-size: 17px;
  color: var(--mm-silver);
  line-height: 1.6;
  max-width: 480px;
}

/* Rating + meta row */
.hero-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.meta-count { font-size: 13px; color: var(--mm-slate); }
.meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--b3); }
.meta-price { font-size: 14px; color: var(--mm-pearl); font-weight: 700; }


/* Value props */
.value-props {
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.value-props li {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--mm-silver);
  font-weight: 500;
}
.vp-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1F1A0E;
  color: #E8C060;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.vp-check :deep(svg) { width: 12px; height: 12px; }

/* CTAs */
.hero-ctas {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.cta-arrow { width: 16px; height: 16px; margin-left: 4px; }
.demo-icon { width: 18px; height: 18px; margin-right: 4px; }
.cta-sub { margin: 0 0 20px; font-size: 12px; color: var(--mm-slate); }

/* Quick action buttons */
.quick-actions {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}
.qa-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  color: var(--mm-slate);
  border: 0;
  padding: 7px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--r-sm);
  transition: background 0.15s, color 0.15s;
}
.qa-btn :deep(svg) { width: 14px; height: 14px; }
.qa-btn:hover { background: var(--mm-s2); color: var(--mm-gold); }
.qa-btn--active { background: rgba(212,168,67,.1); color: var(--mm-gold); }
.qa-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ══ RIGHT COLUMN: full-bleed screenshot ══ */
.hero-right {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Chrome bar */
.screen-chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background: #1A1F2E;
  border-radius: var(--r-lg) var(--r-lg) 0 0;
}
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-r { background: #ff5f57; }
.dot-y { background: #febc2e; }
.dot-g { background: #28c840; }
.screen-url {
  flex: 1;
  margin-left: 10px;
  font-size: 11px;
  color: var(--mm-slate);
  font-family: ui-monospace, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.screen-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #28c840;
  margin-left: 8px;
  flex-shrink: 0;
}
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #28c840;
  animation: pulse-live 2s ease-in-out infinite;
}
@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* Screenshot panel: depth via shadow, no border */
.screen-panel {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #141921;
  border-radius: 0 0 var(--r-lg) var(--r-lg);
  overflow: hidden;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 0.5px rgba(255, 255, 255, 0.04) inset;
}
.screen-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 400ms ease;
}
.screen-panel:hover .screen-img { transform: scale(1.015); }

.screen-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.screen-empty-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: var(--r-lg);
  background: var(--mm-s2);
  padding: 10px;
}
.screen-empty-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--mm-silver);
  margin: 0;
}

/* Left edge fade: screenshot bleeds into text column */
.screen-fade {
  position: absolute;
  inset: 0;
  left: 0;
  width: 80px;
  background: linear-gradient(to right, var(--mm-bg) 0%, transparent 100%);
  pointer-events: none;
}

/* Stats strip directly below screenshot, no border */
.screen-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 16px 20px;
  background: rgba(20, 25, 33, 0.6);
  border-radius: 0 0 var(--r-lg) var(--r-lg);
  margin-top: -1px;
}
.ss-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px 0;
}
.ss-sep {
  width: 0.5px;
  height: 28px;
  background: var(--b1);
  flex-shrink: 0;
}
.ss-val {
  font-size: 20px;
  font-weight: 700;
  color: var(--mm-pearl);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1;
}
.ss-star { width: 14px; height: 14px; color: var(--mm-gold); }
.ss-lbl { font-size: 11px; color: var(--mm-slate); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }

/* ── TAG PILLS ROW ── */
.hero-tags {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 0.5px solid var(--b1);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.tags-label { font-size: 12px; color: var(--mm-slate); font-weight: 500; margin-right: 4px; }

/* ── RESPONSIVE ── */
@media (max-width: 1000px) {
  .hero-grid { grid-template-columns: 1fr; gap: 36px; }
  .hero-title { font-size: 32px; }
  .screen-fade { display: none; }
}
@media (max-width: 600px) {
  .hero-title { font-size: 26px; }
  .hero-tagline { font-size: 15px; }
  .hero-ctas { flex-direction: column; }
  .hero-ctas :deep(button) { width: 100%; }
  .screen-stats { gap: 0; padding: 12px; }
  .ss-val { font-size: 16px; }
}
</style>
