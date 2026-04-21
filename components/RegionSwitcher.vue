<template>
  <div class="region-switcher" :class="{ 'rtl': isRTL }">
    <div class="switcher-trigger" @click="toggleDropdown">
      <div class="current-selection">
        <span class="flag">{{ currentSettings?.flag }}</span>
        <span class="currency">{{ currentSettings?.currency }}</span>
        <UIcon dynamic name="i-heroicons-chevron-down" :class="{ 'open': isOpen }" />
      </div>
    </div>
    
    <div v-if="isOpen" class="switcher-dropdown" @click.stop>
      <div class="dropdown-header">
        <h3>Region & Currency</h3>
        <button @click="closeDropdown" class="close-btn">
          <UIcon dynamic name="i-heroicons-x-mark" />
        </button>
      </div>
      
      <div class="dropdown-content">
        <div class="regions-grid">
          <button
            v-for="region in availableRegions"
            :key="region.code"
            @click="selectRegion(region.code)"
            class="region-option"
            :class="{ 
              'active': currentRegion === region.code 
            }"
          >
            <div class="region-info">
              <span class="flag">{{ region.flag }}</span>
              <div class="details">
                <span class="region-name">{{ region.name }}</span>
                <span class="currency-code">{{ region.currency }}</span>
              </div>
            </div>
            <UIcon dynamic 
              v-if="currentRegion === region.code" 
              name="i-heroicons-check" 
             
              class="check-icon" 
            />
          </button>
        </div>
        
        <div class="regional-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Tax Rate:</span>
              <span class="value">{{ currentSettings?.tax }}%</span>
            </div>
            <div class="info-item">
              <span class="label">Currency:</span>
              <span class="value">{{ currentSettings?.currency }}</span>
            </div>
            <div class="info-item">
              <span class="label">Compliance:</span>
              <span class="value">{{ complianceText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Overlay -->
    <div v-if="isOpen" class="dropdown-overlay" @click="closeDropdown"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, useNuxtApp } from '#imports';

// Use the global market from plugin with safety checks
const nuxtApp = useNuxtApp();
const defaultSettings = {
  name: 'United States',
  currency: 'USD', 
  tax: 8.5,
  locale: 'en-US',
  flag: 'us'
};

// Safe references to global market properties
const currentRegion = ref('US');
const currentRegionSettings = computed(() => {
  try {
    return nuxtApp.$globalMarket?.currentRegionSettings?.value || defaultSettings;
  } catch (error) {
    return defaultSettings;
  }
});

// Safe functions
const switchRegion = (newRegion: string) => {
  try {
    if (nuxtApp.$globalMarket?.switchRegion) {
      nuxtApp.$globalMarket.switchRegion(newRegion);
      currentRegion.value = newRegion;
    }
  } catch (error) {
    console.error('Error switching region:', error);
  }
};

const getAvailableRegions = () => {
  try {
    if (nuxtApp.$globalMarket?.getAvailableRegions) {
      return nuxtApp.$globalMarket.getAvailableRegions();
    }
  } catch (error) {
    console.error('Error getting available regions:', error);
  }
  return [
    { code: 'US', name: 'United States', flag: 'us', currency: 'USD', tax: 8.5, locale: 'en-US' },
    { code: 'EU', name: 'European Union', flag: 'eu', currency: 'EUR', tax: 20, locale: 'en-GB' }
  ];
};

const getComplianceRequirements = () => {
  try {
    if (nuxtApp.$globalMarket?.getComplianceRequirements) {
      return nuxtApp.$globalMarket.getComplianceRequirements();
    }
  } catch (error) {
    console.error('Error getting compliance requirements:', error);
  }
  return [];
};

const isRTL = computed(() => {
  try {
    return nuxtApp.$globalMarket?.isRTL?.value || false;
  } catch (error) {
    return false;
  }
});

// Component state
const isOpen = ref(false);

// Available regions
const availableRegions = computed(() => {
  return getAvailableRegions();
});

// Current settings
const currentSettings = computed(() => {
  return currentRegionSettings.value;
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

// Select region
const selectRegion = (regionCode: string) => {
  switchRegion(regionCode);
  closeDropdown();
  
  // Show a brief notification (you could implement a toast system)
  console.log(`Switched to ${regionCode}`);
};

// Handle outside clicks
const handleOutsideClick = (event: Event) => {
  const target = event.target as Element;
  if (isOpen.value && !target?.closest?.('.region-switcher')) {
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
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<style scoped>
.region-switcher {
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
  min-width: 90px;
  position: relative;
  z-index: 10;
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

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 98;
}

.switcher-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-width: 280px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 99;
  border: 1px solid #e5e7eb;
  animation: fadeIn 0.2s ease;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.dropdown-content {
  padding: 0.75rem;
  overflow-y: auto;
  flex: 1;
}

.regions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.region-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.region-option:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.region-option.active {
  background: #f0f9ff;
  border-color: #2563eb;
  color: #2563eb;
}

.region-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.region-info .flag {
  font-size: 1.125rem;
  line-height: 1;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.region-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.currency-code {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
}

.check-icon {
  color: #2563eb;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.regional-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  color: #1e293b;
  font-weight: 600;
}

/* RTL Support */
.region-switcher.rtl {
  direction: rtl;
}

.region-switcher.rtl .switcher-dropdown {
  left: 0;
  right: auto;
}

.region-switcher.rtl .current-selection {
  flex-direction: row-reverse;
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

/* Mobile responsiveness */
@media (max-width: 640px) {
  .switcher-trigger {
    min-width: 80px;
    padding: 0.5rem 0.75rem;
  }
  
  .currency {
    font-size: 0.8rem;
  }
  
  .flag {
    font-size: 1rem;
  }
  
  .switcher-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    min-width: 260px;
    max-width: calc(100vw - 2rem);
  }
  
  .dropdown-content {
    max-height: 60vh;
    padding: 0.5rem;
  }
  
  .regions-grid {
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  .region-option {
    padding: 0.5rem;
  }
  
  .dropdown-header {
    padding: 0.5rem 0.75rem;
  }
}
</style>
