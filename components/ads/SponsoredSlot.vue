<script setup lang="ts">
import { computed, onMounted } from 'vue'

interface SponsoredAd {
  id: string
  slug?: string
  name: string
  logo: string
  provider?: string
  description?: string
  rating?: number
  reviewCount?: number
  category?: string
  pricing?: { type?: string, value?: number, period?: string }
  href: string
}

interface AdResponse { ad: SponsoredAd | null, placement: string }

interface Props {
  placement: 'alternatives' | 'grid' | 'sidebar' | 'compare' | 'banner' | 'embed'
  variant?: 'native-card' | 'compact-tile' | 'banner'
  category?: string
  exclude?: string[]
  /** Optional override headline text for the ad container. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'native-card',
  category: '',
  exclude: () => [],
  label: 'Sponsored'
})

const excludeKey = computed(() => props.exclude.join(','))

const { data } = await useFetch<AdResponse>('/api/ads/slot', {
  query: {
    placement: props.placement,
    category: props.category,
    exclude: excludeKey
  },
  key: `ad-${props.placement}-${props.category}-${excludeKey.value}`
})

const ad = computed(() => data.value?.ad || null)

const priceLabel = computed(() => {
  const p = ad.value?.pricing
  if (!p) return ''
  if (p.type === 'free') return 'Free'
  if (p.type === 'contact') return 'Custom'
  if (p.value) {
    const period = p.period ? `/${p.period}` : ''
    return `$${p.value}${period}`
  }
  return ''
})

// Fire-and-forget impression tracking (no-op stub; wire to analytics later)
function trackImpression() {
  if (!ad.value) return
  if (globalThis.window === undefined) return
  // Example: globalThis.dataLayer?.push({ event: 'sponsored_impression', ad_id: ad.value.id, placement: props.placement })
}

function trackClick() {
  if (!ad.value) return
  // Example: globalThis.dataLayer?.push({ event: 'sponsored_click', ad_id: ad.value.id, placement: props.placement })
}

onMounted(trackImpression)
</script>

<template>
  <div v-if="ad" class="sponsored-slot" :class="`v-${variant}`" :data-placement="placement">
    <!-- Native card: matches AppCard look + "Sponsored" pill -->
    <a
      v-if="variant === 'native-card'"
      :href="ad.href"
      class="ad-card"
      rel="sponsored noopener"
      target="_blank"
      @click="trackClick"
    >
      <header class="ad-head">
        <div class="ad-logo">
          <img :src="ad.logo" :alt="`${ad.name} logo`" />
        </div>
        <div class="ad-titles">
          <h4 class="ad-name">{{ ad.name }}</h4>
          <p v-if="ad.provider" class="ad-provider">by {{ ad.provider }}</p>
        </div>
        <span class="ad-pill">{{ label }}</span>
      </header>
      <p v-if="ad.description" class="ad-desc">{{ ad.description }}</p>
      <footer class="ad-foot">
        <span v-if="ad.rating" class="ad-rating">
          <Icon name="heroicons:star-solid" />
          {{ ad.rating.toFixed(1) }}
          <span v-if="ad.reviewCount" class="ad-count">({{ ad.reviewCount.toLocaleString() }})</span>
        </span>
        <span v-if="priceLabel" class="ad-price">{{ priceLabel }}</span>
        <span class="ad-cta">Try {{ ad.name }} →</span>
      </footer>
    </a>

    <!-- Compact tile: sidebar-friendly -->
    <a
      v-else-if="variant === 'compact-tile'"
      :href="ad.href"
      class="ad-tile"
      rel="sponsored noopener"
      target="_blank"
      @click="trackClick"
    >
      <span class="ad-pill mini">{{ label }}</span>
      <div class="tile-row">
        <div class="tile-logo">
          <img :src="ad.logo" :alt="`${ad.name} logo`" />
        </div>
        <div class="tile-info">
          <h5 class="tile-name">{{ ad.name }}</h5>
          <p v-if="ad.description" class="tile-desc">{{ ad.description }}</p>
        </div>
      </div>
      <div class="tile-meta">
        <span v-if="ad.rating" class="tile-rating">
          <Icon name="heroicons:star-solid" />
          {{ ad.rating.toFixed(1) }}
        </span>
        <span v-if="priceLabel" class="tile-price">{{ priceLabel }}</span>
      </div>
      <span class="tile-cta">Visit {{ ad.name }} →</span>
    </a>

    <!-- Wide banner: top-of-page or compare footer -->
    <a
      v-else-if="variant === 'banner'"
      :href="ad.href"
      class="ad-banner"
      rel="sponsored noopener"
      target="_blank"
      @click="trackClick"
    >
      <span class="ad-pill mini">{{ label }}</span>
      <div class="banner-row">
        <div class="banner-logo">
          <img :src="ad.logo" :alt="`${ad.name} logo`" />
        </div>
        <div class="banner-text">
          <h4 class="banner-name">{{ ad.name }}</h4>
          <p v-if="ad.description" class="banner-desc">{{ ad.description }}</p>
        </div>
        <div class="banner-cta-wrap">
          <span v-if="priceLabel" class="banner-price">{{ priceLabel }}</span>
          <span class="banner-cta">Try free →</span>
        </div>
      </div>
    </a>
  </div>
</template>

<style scoped>
.sponsored-slot { width: 100%; height: 100%; display: flex; }

/* "Sponsored" disclosure pill — required for ad transparency */
.ad-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--r-full);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 0.5px solid var(--mm-gold);
}
.ad-pill.mini {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* ---------- Native card (matches AppCard) ---------- */
.ad-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-lg);
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 100%;
}
.ad-card:hover {
  border-color: var(--mm-gold);
  box-shadow: 0 4px 16px var(--mm-gold-soft);
}

.ad-head { display: flex; align-items: center; gap: 10px; }
.ad-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--r-sm);
  overflow: hidden;
  background: var(--mm-s3);
  flex-shrink: 0;
}
.ad-logo img { width: 100%; height: 100%; object-fit: cover; }

.ad-titles { flex: 1; min-width: 0; padding-right: 80px; }
.ad-name { margin: 0; font-size: 15px; font-weight: 700; color: var(--mm-pearl); font-family: var(--f-ui); }
.ad-provider { margin: 2px 0 0; font-size: 12px; color: var(--mm-slate); }

.ad-card .ad-pill { position: absolute; top: 12px; right: 12px; }

.ad-desc {
  margin: 0;
  font-size: 13px;
  color: var(--mm-silver);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.ad-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  border-top: 0.5px solid var(--b1);
  padding-top: 10px;
  margin-top: auto;
}
.ad-rating { display: inline-flex; align-items: center; gap: 4px; color: var(--mm-pearl); font-weight: 600; }
.ad-rating :deep(svg) { width: 12px; height: 12px; color: var(--mm-gold); }
.ad-count { color: var(--mm-slate); font-weight: 400; margin-left: 2px; }
.ad-price { color: var(--mm-seal); font-weight: 600; }
.ad-cta { margin-left: auto; color: var(--mm-gold); font-weight: 600; }

/* ---------- Compact tile (sidebar) ---------- */
.ad-tile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  position: relative;
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, background-color 150ms ease;
}
.ad-tile:hover { border-color: var(--mm-gold); background: var(--mm-gold-soft); }

.tile-row { display: flex; gap: 8px; align-items: flex-start; padding-top: 8px; }
.tile-logo {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  overflow: hidden;
  background: var(--mm-s3);
  flex-shrink: 0;
}
.tile-logo img { width: 100%; height: 100%; object-fit: cover; }
.tile-info { flex: 1; min-width: 0; }
.tile-name { margin: 0; font-size: 13px; font-weight: 700; color: var(--mm-pearl); font-family: var(--f-ui); }
.tile-desc {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--mm-slate);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tile-meta { display: flex; gap: 10px; font-size: 11px; }
.tile-rating { display: inline-flex; align-items: center; gap: 2px; color: var(--mm-pearl); font-weight: 600; }
.tile-rating :deep(svg) { width: 10px; height: 10px; color: var(--mm-gold); }
.tile-price { color: var(--mm-seal); font-weight: 600; }

.tile-cta { font-size: 12px; color: var(--mm-gold); font-weight: 600; }

/* ---------- Banner ---------- */
.ad-banner {
  display: block;
  position: relative;
  width: 100%;
  flex: 1 1 100%;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  padding: 20px 24px;
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  overflow: hidden;
}
.ad-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--mm-gold-soft);
  opacity: 0.4;
  pointer-events: none;
}
.ad-banner:hover {
  border-color: var(--mm-gold);
  box-shadow: 0 4px 14px var(--mm-gold-soft);
}
/* Override the shared absolute pill position for banners — sit inline, top-left */
.ad-banner .ad-pill.mini {
  position: static;
  display: inline-flex;
  margin-bottom: 10px;
}

.banner-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 2px;
  position: relative;
}
.banner-logo {
  width: 56px;
  height: 56px;
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--mm-s3);
  border: 0.5px solid var(--b2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.banner-logo img { width: 100%; height: 100%; object-fit: contain; }
.banner-text { flex: 1 1 260px; min-width: 0; }
.banner-name { margin: 0; font-size: 17px; font-weight: 700; color: var(--mm-pearl); font-family: var(--f-ui); letter-spacing: -0.01em; }
.banner-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--mm-silver);
  line-height: 1.5;
  max-width: 58ch;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.banner-cta-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  margin-left: auto;
}
.banner-price {
  font-size: 14px;
  color: var(--mm-pearl);
  font-weight: 700;
  white-space: nowrap;
}
.banner-cta {
  display: inline-flex;
  align-items: center;
  background: var(--mm-gold);
  color: #0A0700;
  padding: 10px 18px;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  font-family: var(--f-ui);
  transition: background 150ms ease;
}
.ad-banner:hover .banner-cta { background: var(--mm-goldl); }

@media (max-width: 640px) {
  .ad-banner { padding: 16px; }
  .banner-row { gap: 14px; }
  .banner-cta-wrap { margin-left: 0; width: 100%; justify-content: space-between; }
  .banner-name { font-size: 15px; }
}
</style>
