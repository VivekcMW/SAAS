<template>
  <div class="language-region-switcher" :class="{ 'rtl': isRTL }">
    <div class="switcher-trigger" @click="toggleDropdown">
      <div class="current-selection">
        <span class="flag">{{ currentLocale?.flag }}</span>
        <span class="currency">{{ currentCurrency }}</span>
        <UIcon dynamic name="i-heroicons-chevron-down" :class="{ 'open': isOpen }" />
      </div>
    </div>
    
    <Teleport to="body">
      <div v-if="isOpen" class="switcher-overlay" @click="closeDropdown">
        <div class="switcher-dropdown" @click.stop>
          <div class="dropdown-header">
            <h3>{{ $t('footer.language') }} & {{ $t('pricing.currency') }}</h3>
            <button @click="closeDropdown" class="close-btn">
              <UIcon dynamic name="i-heroicons-x-mark" />
            </button>
          </div>
          
          <div class="dropdown-content">
            <div class="regions-grid">
              <button
                v-for="localeOption in availableLocales"
                :key="localeOption.code"
                @click="switchLocale(localeOption.code)"
                class="region-option"
                :class="{ 
                  'active': locale === localeOption.code,
                  'rtl': localeOption.dir === 'rtl' 
                }"
              >
                <div class="region-info">
                  <span class="flag">{{ localeOption.flag }}</span>
                  <div class="details">
                    <span class="language">{{ localeOption.name }}</span>
                    <span class="currency-code">{{ localeOption.currency }}</span>
                  </div>
                </div>
                <UIcon dynamic 
                  v-if="locale === localeOption.code" 
                  name="i-heroicons-check" 
                 
                  class="check-icon" 
                />
              </button>
            </div>
            
            <div class="regional-notice">
              <p>{{ $t('footer.regional_notice', { 
                currency: currentCurrency,
                tax: currentTaxRate,
                compliance: complianceText 
              }) }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, useNuxtApp } from '#imports';
import { useI18n } from 'vue-i18n';

// Handle i18n safely
let locale: any, locales: any, setLocale: any;
try {
  const i18n = useI18n();
  locale = i18n.locale;
  locales = i18n.locales;
  setLocale = i18n.setLocale;
} catch (error) {
  console.warn('i18n not available', error);
  locale = ref('en');
  locales = ref([{ code: 'en', name: 'English' }]);
  setLocale = () => {};
}

// Use the global market from plugin with safety checks
const nuxtApp = useNuxtApp();
let formatCurrency: any, currentRegion: any, getComplianceRequirements: any, isRTL: any;

try {
  // Try to use the global market plugin
  if (nuxtApp.$globalMarket) {
    formatCurrency = nuxtApp.$globalMarket.formatCurrency;
    currentRegion = nuxtApp.$globalMarket.currentRegion;
    getComplianceRequirements = nuxtApp.$globalMarket.getComplianceRequirements;
    isRTL = nuxtApp.$globalMarket.isRTL;
  } else {
    // Fallback implementation if plugin not available
    console.warn('Global market plugin not available in LanguageRegionSwitcher');
    formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
    currentRegion = ref('US');
    getComplianceRequirements = () => [];
    isRTL = computed(() => false);
  }
} catch (error) {
  console.error('Error setting up global market in LanguageRegionSwitcher:', error);
  // Safe fallbacks
  formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  currentRegion = ref('US');
  getComplianceRequirements = () => [];
  isRTL = computed(() => false);
}

// Component state
const isOpen = ref(false);

// Available locales from the i18n config
const availableLocales = computed(() => {
  return locales.value.filter((l: any) => typeof l !== 'string');
});

// Current locale object
const currentLocale = computed(() => {
  return availableLocales.value.find((l: any) => l.code === locale.value);
});

// Current currency display
const currentCurrency = computed(() => {
  return currentRegion.value.currency;
});

const getLocaleName = (code: string) => {
  const found = availableLocales.value.find((l: any) => l.code === code);
  return found?.name || code;
};

// Current tax rate
const currentTaxRate = computed(() => {
  return `${currentRegion.value.tax}%`;
});

// Compliance requirements text
const complianceText = computed(() => {
  const requirements = getComplianceRequirements();
  return requirements.join(', ');
});

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Close dropdown
const closeDropdown = () => {
  isOpen.value = false;
};

// Switch locale and currency
const switchLocale = async (newLocale: string) => {
  try {
    await setLocale(newLocale);
    
    // Store user preference
    const localStorage = window.localStorage;
    if (localStorage) {
      localStorage.setItem('preferred-locale', newLocale);
    }
    
    // Update document direction for RTL languages
    const selectedLocale = availableLocales.value.find((l: any) => l.code === newLocale);
    if (selectedLocale?.dir === 'rtl') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = newLocale;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = newLocale;
    }
    
    closeDropdown();
    
    // Emit event for parent components to react to locale change
    await navigateTo(useRoute().path, { replace: true });
    
  } catch (error) {
    console.error('Failed to switch locale:', error);
  }
};

// Handle outside clicks
const handleOutsideClick = (event: Event) => {
  if (isOpen.value && !(event.target as Element)?.closest?.('.language-region-switcher')) {
    closeDropdown();
  }
};

// Handle escape key
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown();
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscapeKey);
  
  // Load saved preference
  const localStorage = window.localStorage;
  if (localStorage) {
    const savedLocale = localStorage.getItem('preferred-locale');
    if (savedLocale && savedLocale !== locale.value) {
      switchLocale(savedLocale);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<style scoped>
.language-region-switcher {
  position: relative;
  display: inline-block;
}

.switcher-trigger {
  cursor: pointer;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  transition: all 0.2s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
}

.switcher-trigger:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.current-selection {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
}

.flag {
  font-size: 1.125rem;
  line-height: 1;
}

.currency {
  font-weight: 500;
  color: #1f2937;
  flex: 1;
  font-size: 0.875rem;
}

.switcher-trigger svg {
  transition: transform 0.2s ease;
  color: #6b7280;
  width: 16px;
  height: 16px;
}

.switcher-trigger svg.open {
  transform: rotate(180deg);
}

.switcher-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.switcher-dropdown {
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 450px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  animation: fadeIn 0.2s ease;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: #6b7280;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.dropdown-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.regions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.region-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.region-option:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.region-option.active {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.region-option.rtl {
  direction: rtl;
}

.region-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.region-info .flag {
  font-size: 1.5rem;
  line-height: 1;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.language {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.currency-code {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.check-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

.regional-notice {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.5;
}

.regional-notice p {
  margin: 0;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RTL Support */
.language-region-switcher.rtl {
  direction: rtl;
}

.language-region-switcher.rtl .current-selection {
  flex-direction: row-reverse;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .switcher-overlay {
    padding: 0.5rem;
  }
  
  .switcher-dropdown {
    max-height: 90vh;
  }
  
  .dropdown-header,
  .dropdown-content {
    padding: 1rem;
  }
  
  .regions-grid {
    gap: 0.375rem;
  }
  
  .region-option {
    padding: 0.625rem 0.75rem;
  }
}
</style>
