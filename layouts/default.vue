<!-- Default layout for Moonmart -->
<template>
  <div class="site-layout">
    <GlobalMarketBanner />
    <Navbar />
    <main class="site-main">
      <slot />
    </main>
    <Footer />
    <!-- Global Search - Always Available (client-only to avoid SSR hydration mismatch) -->
    <ClientOnly>
      <GlobalSearch />
    </ClientOnly>
    <!-- Global Auth Modal - Always Available -->
    <GlobalAuthModal />
    <!-- GDPR Consent Banner -->
    <ClientOnly>
      <GdprConsentBanner />
    </ClientOnly>
    <!-- Floating compare tray -->
    <ClientOnly>
      <CompareBar />
    </ClientOnly>
    <!-- Mobile bottom navigation -->
    <ClientOnly>
      <MobileBottomNav />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const RTL_LOCALES = new Set(['ar'])
const isRTL = computed(() => RTL_LOCALES.has(locale.value))

// Inject hreflang alternate link tags for all locales on every page
useHreflang()

const route = useRoute()
const BASE_URL = 'https://moonmart.ai'

// Strip pagination + tracking params to build the canonical URL
const canonicalUrl = computed(() => {
  const cleanPath = route.path.replace(/\/+$/, '') || '/'
  return `${BASE_URL}${cleanPath}`
})

useHead({
  htmlAttrs: {
    dir: () => (isRTL.value ? 'rtl' : 'ltr'),
    lang: () => locale.value
  },
  link: [
    { rel: 'canonical', href: () => canonicalUrl.value }
  ]
})
</script>

<style scoped>
.site-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-main {
  margin-top: calc(72px + var(--mm-banner-h, 0px)); /* navbar + optional banner */
  flex: 1;
  min-height: calc(100vh - 72px - var(--mm-banner-h, 0px));
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .site-main {
    margin-top: calc(64px + var(--mm-banner-h, 0px)); /* mobile navbar + optional banner */
    min-height: calc(100vh - 64px - var(--mm-banner-h, 0px));
    padding-bottom: 64px; /* Space for mobile bottom nav */
  }
}
</style>
