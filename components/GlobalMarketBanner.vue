<template>
  <header v-if="showBanner" ref="bannerEl" class="gmb" :style="{ background: bannerConfig.bgColor || '#131929' }">
    <div class="gmb__inner">

      <!-- Left: icon + message -->
      <div class="gmb__left">
        <span class="gmb__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </span>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="gmb__msg" v-html="renderedMessage" />
      </div>

      <!-- Right: CTA + dismiss -->
      <div class="gmb__right">
        <NuxtLink v-if="bannerConfig.ctaLabel" :to="bannerConfig.ctaUrl || '/marketplace'" class="gmb__cta" @click="dismissBanner">
          {{ bannerConfig.ctaLabel }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </NuxtLink>
        <button class="gmb__dismiss" aria-label="Dismiss banner" @click="dismissBanner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, useNuxtApp } from '#imports'
import { useRuntimeConfig, useRoute } from '#app'

// ── Banner config from admin API ────────────────────────────────────
interface BannerConfig {
  enabled: boolean
  message: string
  ctaLabel: string
  ctaUrl: string
  showOnHomepage: boolean
  bgColor: string
}

const DEFAULT_CONFIG: BannerConfig = {
  enabled: true,
  message: 'Welcome to Moonmart — Global SaaS Marketplace with localised pricing in {currency}',
  ctaLabel: 'Browse apps',
  ctaUrl: '/marketplace',
  showOnHomepage: false,
  bgColor: '#131929',
}

const bannerConfig = ref<BannerConfig>({ ...DEFAULT_CONFIG })

// ── Localised currency from global market plugin ─────────────────────
const defaultSettings = { currency: 'USD' }
const currentRegionSettings = computed(() => {
  try {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$globalMarket?.currentRegionSettings?.value) {
      return nuxtApp.$globalMarket.currentRegionSettings.value
    }
    const config = useRuntimeConfig()
    const regions = (config.public?.regions ?? {}) as Record<string, { currency: string }>
    return regions['US'] || defaultSettings
  } catch {
    return defaultSettings
  }
})

// Replace {currency} with the visitor's currency code (sanitised — no HTML injection)
const renderedMessage = computed(() => {
  const currency = String(currentRegionSettings.value.currency ?? 'USD').replaceAll(/[^A-Z]/g, '')
  return (bannerConfig.value.message ?? '').replace(
    '{currency}',
    `<strong style="color:#FFC850">${currency}</strong>`
  )
})

// ── Banner show / hide logic ─────────────────────────────────────────
const bannerEl = ref<HTMLElement | null>(null)
const showBanner = ref(false)

watch(showBanner, async (val) => {
  if (!import.meta.client) return
  if (val) {
    await nextTick()
    const h = bannerEl.value?.offsetHeight ?? 40
    document.documentElement.style.setProperty('--mm-banner-h', `${h}px`)
  } else {
    document.documentElement.style.setProperty('--mm-banner-h', '0px')
  }
})

const dismissBanner = () => {
  showBanner.value = false
  if (import.meta.client) {
    localStorage.setItem('global-banner-dismissed', 'true')
  }
}

onMounted(async () => {
  if (!import.meta.client) return

  // Fetch config from admin API (fails silently — falls back to defaults)
  try {
    const data = await $fetch<BannerConfig>('/api/banner-config')
    bannerConfig.value = { ...DEFAULT_CONFIG, ...data }
  } catch {
    // keep defaults
  }

  const route = useRoute()
  const isHomepage = route.path === '/'

  // Respect admin's showOnHomepage toggle
  if (isHomepage && !bannerConfig.value.showOnHomepage) return

  // Respect admin's enabled flag
  if (!bannerConfig.value.enabled) return

  const dismissed = localStorage.getItem('global-banner-dismissed')
  if (!dismissed) {
    setTimeout(() => { showBanner.value = true }, 2000)
  }
})
</script>

<style scoped>
/* ── Banner shell ─────────────────────────────────────────── */
.gmb {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  background: #131929;
  border-bottom: 1px solid rgba(255, 200, 80, 0.18);
  /* thin gold top accent line */
  box-shadow: inset 0 2px 0 0 var(--mm-gold, #FFC850), 0 2px 12px rgba(0, 0, 0, 0.35);
  animation: gmb-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes gmb-in {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}

/* ── Inner layout ─────────────────────────────────────────── */
.gmb__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.55rem 1.5rem;
}

/* ── Left: icon + message ─────────────────────────────────── */
.gmb__left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.gmb__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 200, 80, 0.12);
  color: var(--mm-gold, #FFC850);
  border: 1px solid rgba(255, 200, 80, 0.25);
}

.gmb__msg {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.85);
  flex-wrap: wrap;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gmb__brand {
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
}

.gmb__sep {
  color: rgba(255, 200, 80, 0.5);
  font-weight: 300;
  flex-shrink: 0;
}

.gmb__detail {
  color: rgba(255, 255, 255, 0.62);
  font-weight: 400;
}

.gmb__detail strong {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

/* ── Right: CTA + dismiss ─────────────────────────────────── */
.gmb__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.gmb__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.85rem;
  border-radius: 99px;
  background: var(--mm-gold, #FFC850);
  color: #0A0700;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-decoration: none;
  transition: background 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
}

.gmb__cta:hover {
  background: #ffd670;
  transform: translateX(1px);
}

.gmb__dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
}

.gmb__dismiss:hover {
  background: var(--mm-gold, #FFC850);
  color: #0A0700;
  border-color: transparent;
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 680px) {
  .gmb__inner {
    padding: 0.5rem 1rem;
  }

  .gmb__detail {
    display: none;
  }

  .gmb__sep {
    display: none;
  }
}

@media (max-width: 400px) {
  .gmb__cta {
    display: none;
  }
}
</style>
