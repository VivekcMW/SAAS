<template>
  <div ref="bannerEl" class="global-market-banner" v-if="showBanner">
    <div class="banner-content">
      <div class="banner-info">
        <UIcon dynamic name="i-heroicons-globe-alt" />
        <span>{{ bannerMessage }}</span>
      </div>
      <div class="banner-actions">
        <button @click="dismissBanner" class="dismiss-btn" aria-label="Dismiss banner">
          <UIcon dynamic name="i-heroicons-x-mark" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, useNuxtApp } from '#imports';
import { useRuntimeConfig, useRoute } from '#app';

// Create safe fallback values in case the plugin isn't loaded yet
const defaultSettings = {
  name: 'United States',
  currency: 'USD',
  tax: 8.5,
  locale: 'en-US',
  flag: 'us'
};

// Safety wrapper to avoid SSR issues
const currentRegion = ref('US');
const currentRegionSettings = computed(() => {
  try {
    // Try to get from plugin first
    const nuxtApp = useNuxtApp();
    if (nuxtApp.$globalMarket?.currentRegionSettings?.value) {
      return nuxtApp.$globalMarket.currentRegionSettings.value;
    }
    
    // Fallback to config
    const config = useRuntimeConfig();
    const regions = config.public?.regions as Record<string, any> || {};
    return regions[currentRegion.value] || defaultSettings;
  } catch (error) {
    console.error('Error accessing global market settings:', error);
    return defaultSettings;
  }
});

// Safe format currency function
const formatCurrency = (amount: number): string => {
  try {
    const nuxtApp = useNuxtApp();
    if (typeof nuxtApp.$globalMarket?.formatCurrency === 'function') {
      return nuxtApp.$globalMarket.formatCurrency(amount);
    }
  } catch (error) {
    console.error('Error formatting currency:', error);
  }
  return `$${amount.toFixed(2)}`;
};

const bannerEl = ref<HTMLDivElement | null>(null)
const showBanner = ref(false);

// Keep --mm-banner-h CSS variable in sync so Navbar and layout offset correctly
watch(showBanner, async (val) => {
  if (!process.client) return
  if (val) {
    await nextTick()
    const h = bannerEl.value?.offsetHeight ?? 36
    document.documentElement.style.setProperty('--mm-banner-h', `${h}px`)
  } else {
    document.documentElement.style.setProperty('--mm-banner-h', '0px')
  }
})

const bannerMessage = computed(() => {
  const region = currentRegionSettings.value;
  return `Welcome to Moonmart - Global SaaS Marketplace with localized pricing in ${region.currency}`;
});

const dismissBanner = () => {
  showBanner.value = false;
  if (process.client) {
    localStorage.setItem('global-banner-dismissed', 'true');
  }
};

onMounted(() => {
  if (process.client) {
    const route = useRoute();
    // Don't show on homepage — the hero already welcomes users
    if (route.path === '/') return;
    const dismissed = localStorage.getItem('global-banner-dismissed');
    if (!dismissed) {
      setTimeout(() => {
        showBanner.value = true;
      }, 2000);
    }
  }
});
</script>

<style scoped>
.global-market-banner {
  background: var(--mm-s3, #1F2742);
  color: white;
  padding: 0.5rem 1rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  animation: slideDown 0.3s ease-out;
  font-size: var(--fs-caption);
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.banner-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.dismiss-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s ease;
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 640px) {
  .banner-content {
    padding: 0 1rem;
  }
  
  .banner-info {
    font-size: 0.8rem;
  }
}
</style>
