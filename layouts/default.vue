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
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.site-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-main {
  margin-top: 72px; /* Match the fixed navbar height */
  flex: 1;
  min-height: calc(100vh - 72px); /* Full height minus navbar */
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .site-main {
    margin-top: 64px; /* Match mobile navbar height */
    min-height: calc(100vh - 64px);
  }
}
</style>
