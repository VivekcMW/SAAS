<template>
  <div class="list-product-page">
    <div class="page-header">
      <div class="container">
        <h1>List Your Product on SaaSWorld</h1>
        <p>Get your product or service in front of thousands of potential customers by listing it on our platform.</p>
        
        <!-- Benefits -->
        <div class="benefits">
          <div class="benefit-item">
            <UIcon name="i-heroicons-eye" dynamic />
            <span>Get discovered by thousands of users</span>
          </div>
          <div class="benefit-item">
            <UIcon name="i-heroicons-rocket-launch" dynamic />
            <span>Boost your product visibility</span>
          </div>
          <div class="benefit-item">
            <UIcon name="i-heroicons-chart-bar-square" dynamic />
            <span>Track performance analytics</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Onboarding Options Selection -->
      <OnboardingOptions v-if="!selectedOption" @select-option="handleOptionSelection" />
      
      <!-- Selected Onboarding Flow -->
      <component 
        v-else
        :is="selectedComponent"
        :onboarding-type="selectedOption"
        @go-back="resetSelection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import OnboardingOptions from '~/components/onboarding/OnboardingOptions.vue';
import ProductOnboarding from '~/components/onboarding/ProductOnboarding.vue';
import QuickListOnboarding from '~/components/onboarding/QuickListOnboarding.vue';
import AIOnboarding from '~/components/onboarding/AIOnboarding.vue';

// Onboarding flow selection
const selectedOption = ref<string | null>(null);

const selectedComponent = computed(() => {
  switch (selectedOption.value) {
    case 'quick':
      return QuickListOnboarding;
    case 'complete':
      return ProductOnboarding;
    case 'ai':
      return AIOnboarding;
    default:
      return ProductOnboarding;
  }
});

const handleOptionSelection = (option: string) => {
  selectedOption.value = option;
};

const resetSelection = () => {
  selectedOption.value = null;
};

// SEO
useHead({
  title: 'List Your Product - SaaSWorld Marketplace',
  meta: [
    { 
      name: 'description', 
      content: 'List your SaaS product on SaaSWorld marketplace and get discovered by thousands of potential customers. Choose from Quick List, Complete Profile, or AI-powered listing options.' 
    },
    { name: 'keywords', content: 'list product, saas marketplace, submit application, product listing, saas directory, ai listing' },
    { property: 'og:title', content: 'List Your Product - SaaSWorld Marketplace' },
    { property: 'og:description', content: 'Get your SaaS product in front of thousands of potential customers by listing it on SaaSWorld.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://saasworld.club/list-product' }
  ]
});
</script>

<style scoped>
.list-product-page {
  width: 100%;
}

.page-header {
  background-color: var(--bg-gray);
  padding: var(--spacing-xxl) 0;
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.page-header p {
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto var(--spacing-lg) auto;
}

.benefits {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
  margin-top: var(--spacing-lg);
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.benefit-item svg {
  color: var(--primary-color);
  width: 20px;
  height: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

@media (max-width: 768px) {
  .page-header {
    padding: var(--spacing-xl) 0;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1.1rem;
  }
}
</style>
