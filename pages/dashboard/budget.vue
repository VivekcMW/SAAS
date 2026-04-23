<template>
  <div class="budget-page">
    <!-- Page Header -->
    <div class="page-header compact">
      <div class="header-content">
        <div class="header-row">
          <div class="back-navigation">
            <button @click="goBack" class="back-btn">
              <UIcon dynamic name="i-heroicons-arrow-left" />
              Back
            </button>
          </div>
          <div class="title-section">
            <h1 v-if="promotionData">Promote "{{ promotionData.productName }}"</h1>
            <h1 v-else>Budget & Promotion Center</h1>
            <p v-if="promotionData">Set up your promotion campaign</p>
            <p v-else>Manage your advertising campaigns</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Promotion Setup -->
    <div v-if="promotionData" class="main-content">
      <!-- Product Overview -->
      <div class="promotion-overview">
        <!-- Compact Product Overview -->
        <div class="product-summary-compact">
          <div class="product-info-row">
            <div class="product-basic">
              <h3>{{ promotionData.productName }}</h3>
              <div class="product-meta">
                <span class="category-tag">{{ promotionData.category }}</span>
                <span class="rating-info">
                  <UIcon dynamic name="i-heroicons-star-solid" />
                  {{ promotionData.rating }} ({{ promotionData.reviewCount }})
                </span>
              </div>
            </div>
            <div class="current-stats">
              <div class="stat-item">
                <span class="stat-value">{{ formatNumber(promotionData.currentViews) }}</span>
                <span class="stat-label">Views</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${{ formatNumber(promotionData.currentRevenue) }}</span>
                <span class="stat-label">Revenue</span>
              </div>
            </div>
          </div>
          <div class="promotion-status">
            <span class="status-indicator ready">
              <UIcon dynamic name="i-heroicons-check-circle" />
              Ready for Promotion
            </span>
          </div>
        </div>

        <!-- Dynamic Promotion Potential -->
        <div class="promotion-potential-dynamic">
          <div class="potential-header">
            <h3>Promotion Impact</h3>
            <div class="potential-multiplier">
              <span class="multiplier-badge">{{ calculateMultiplier() }}x Growth</span>
            </div>
          </div>
          <div class="dynamic-metrics">
            <div class="primary-metric">
              <div class="metric-icon">
                <UIcon dynamic name="i-heroicons-rocket-launch" />
              </div>
              <div class="metric-content">
                <div class="metric-main">
                  <span class="metric-number">{{ formatNumber(calculatePotentialImpressions()) }}</span>
                  <span class="metric-period">monthly impressions</span>
                </div>
                <div class="metric-growth">
                  +{{ calculateGrowthPercentage() }}% increase from current
                </div>
              </div>
            </div>
            
            <div class="secondary-metrics">
              <div class="secondary-metric">
                <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
                <div class="metric-data">
                  <span class="value">{{ formatNumber(calculateExpectedClicks()) }}</span>
                  <span class="label">Expected Clicks</span>
                </div>
              </div>
              <div class="secondary-metric">
                <UIcon dynamic name="i-heroicons-currency-dollar" />
                <div class="metric-data">
                  <span class="value">${{ formatNumber(calculateRevenueProjection()) }}</span>
                  <span class="label">Revenue Potential</span>
                </div>
              </div>
              <div class="secondary-metric">
                <UIcon dynamic name="i-heroicons-users" />
                <div class="metric-data">
                  <span class="value">{{ formatNumber(calculateNewUsers()) }}</span>
                  <span class="label">New Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Configuration -->
      <div class="budget-configuration">
        <div class="budget-card">
          <div class="budget-header">
            <h3>Campaign Budget</h3>
            <div class="budget-display">
              <span class="budget-amount">${{ currentBudget }}</span>
              <span class="budget-period">{{ budgetType === 'daily' ? 'per day' : 'total' }}</span>
            </div>
          </div>
          
          <div class="budget-content">
            <div class="budget-input-section">
              <div class="budget-slider-container">
                <div class="budget-controls">
                  <button 
                    class="budget-type-btn" 
                    :class="{ active: budgetType === 'daily' }"
                    @click="budgetType = 'daily'; currentBudget = Math.round(promotionData.suggestedBudget / 30)"
                  >
                    Daily
                  </button>
                  <button 
                    class="budget-type-btn" 
                    :class="{ active: budgetType === 'total' }"
                    @click="budgetType = 'total'; currentBudget = promotionData.suggestedBudget"
                  >
                    Total
                  </button>
                </div>
                <input 
                  type="range" 
                  v-model="currentBudget" 
                  :min="budgetType === 'daily' ? 10 : 100"
                  :max="budgetType === 'daily' ? 500 : 5000"
                  :step="budgetType === 'daily' ? 5 : 50"
                  class="budget-slider"
                />
                <div class="budget-range">
                  <span class="range-min">${{ budgetType === 'daily' ? 10 : 100 }}</span>
                  <span class="suggested-budget">
                    Suggested: ${{ budgetType === 'daily' ? Math.round(promotionData.suggestedBudget / 30) : promotionData.suggestedBudget }}
                  </span>
                  <span class="range-max">${{ budgetType === 'daily' ? 500 : 5000 }}</span>
                </div>
              </div>
              
              <div class="budget-impact">
                <div class="impact-summary">
                  <div class="impact-title">Expected Results</div>
                  <div class="impact-row">
                    <div class="impact-item-compact">
                      <UIcon dynamic name="i-heroicons-eye" />
                      <div class="impact-data">
                        <span class="impact-value">{{ formatNumber(Math.round(currentBudget * (budgetType === 'daily' ? campaignDuration : 1) * 4.2)) }}</span>
                        <span class="impact-label">impressions</span>
                      </div>
                    </div>
                    <div class="impact-item-compact">
                      <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
                      <div class="impact-data">
                        <span class="impact-value">{{ Math.round(currentBudget * (budgetType === 'daily' ? campaignDuration : 1) * 0.08) }}</span>
                        <span class="impact-label">clicks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Campaign Duration -->
        <div class="duration-card-full">
          <div class="duration-header-full">
            <div class="duration-title">
              <h3>Campaign Duration</h3>
              <div class="duration-display">
                <span class="duration-value">{{ campaignDuration }}</span>
                <span class="duration-unit">days</span>
              </div>
            </div>
            <div class="duration-description">
              <span v-if="campaignDuration === 7" class="description-text">Quick promotional boost</span>
              <span v-else-if="campaignDuration === 30" class="description-text">Recommended for optimal results</span>
              <span v-else class="description-text">Long-term growth strategy</span>
            </div>
          </div>
          
          <div class="duration-content">
            <div class="duration-selector-compact">
              <div class="duration-options">
                <button 
                  class="duration-option" 
                  :class="{ active: campaignDuration === 7 }"
                  @click="campaignDuration = 7"
                >
                  <span class="option-number">7</span>
                  <span class="option-unit">days</span>
                </button>
                <button 
                  class="duration-option" 
                  :class="{ active: campaignDuration === 30 }"
                  @click="campaignDuration = 30"
                >
                  <span class="option-number">30</span>
                  <span class="option-unit">days</span>
                </button>
                <button 
                  class="duration-option" 
                  :class="{ active: campaignDuration === 90 }"
                  @click="campaignDuration = 90"
                >
                  <span class="option-number">90</span>
                  <span class="option-unit">days</span>
                </button>
              </div>
            </div>
            
            <div class="duration-impact">
              <div class="impact-metrics-compact">
                <div class="duration-metric-compact">
                  <UIcon dynamic name="i-heroicons-currency-dollar" />
                  <div class="metric-info">
                    <span class="metric-number">${{ Math.round((budgetType === 'daily' ? currentBudget * campaignDuration : currentBudget) / campaignDuration) }}</span>
                    <span class="metric-label">per day</span>
                  </div>
                </div>
                <div class="duration-metric-compact">
                  <UIcon dynamic name="i-heroicons-arrow-trending-up" />
                  <div class="metric-info">
                    <span class="metric-number">{{ calculateROI() }}%</span>
                    <span class="metric-label">ROI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Target Audience & Locations -->
      <div class="targeting-section">
        <div class="targeting-card">
          <div class="targeting-header">
            <h3>Target Locations</h3>
            <div class="location-summary">
              {{ selectedLocations.length }} location{{ selectedLocations.length !== 1 ? 's' : '' }} selected
            </div>
          </div>
          <div class="targeting-content">
            <div class="location-grid">
              <label 
                v-for="location in availableLocations" 
                :key="location.code"
                class="location-option"
                :class="{ active: selectedLocations.includes(location.code) }"
              >
                <input 
                  type="checkbox" 
                  :value="location.code" 
                  v-model="selectedLocations"
                />
                <div class="location-content">
                  <div class="location-flag">{{ location.flag }}</div>
                  <div class="location-info">
                    <span class="location-name">{{ location.name }}</span>
                    <span class="location-reach">~{{ location.reach }} potential reach</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Campaign Summary -->
        <div class="campaign-summary-card">
          <div class="summary-header">
            <h3>Campaign Summary</h3>
          </div>
          <div class="summary-content">
            <div class="summary-metrics">
              <div class="summary-metric">
                <span class="metric-label">Total Investment</span>
                <span class="metric-value">
                  ${{ formatNumber(budgetType === 'daily' ? currentBudget * campaignDuration : currentBudget) }}
                </span>
              </div>
              <div class="summary-metric">
                <span class="metric-label">Expected Duration</span>
                <span class="metric-value">{{ campaignDuration }} days</span>
              </div>
              <div class="summary-metric">
                <span class="metric-label">Target Locations</span>
                <span class="metric-value">{{ selectedLocations.length }} regions</span>
              </div>
              <div class="summary-metric">
                <span class="metric-label">Estimated ROI</span>
                <span class="metric-value">{{ calculateROI() }}%</span>
              </div>
            </div>
            
            <div class="campaign-actions">
              <button class="btn btn-secondary" @click="saveDraft">
                <UIcon dynamic name="i-heroicons-document" />
                Save as Draft
              </button>
              <button class="btn btn-primary" @click="launchCampaign">
                <UIcon dynamic name="i-heroicons-rocket-launch" />
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Default Budget Center (when no promotion data) -->
    <div v-else class="budget-center">
      <div class="center-content">
        <div class="center-icon">
          <UIcon dynamic name="i-heroicons-currency-dollar" />
        </div>
        <h3>Budget & Promotion Center</h3>
        <p>Manage your advertising campaigns and promotional budgets</p>
        <NuxtLink to="/dashboard/products" class="btn btn-primary">
          <UIcon dynamic name="i-heroicons-squares-2x2" />
          View Products to Promote
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';

// Guard: buyers shouldn't see the promotion/budget tool
const { currentUser } = useAuth()
watchEffect(() => {
  if (import.meta.client && currentUser.value?.role === 'buyer') {
    navigateTo('/dashboard/overview', { replace: true })
  }
})

// SEO and meta tags
useSeoMeta({
  title: 'Budget & Promotion - Promote Your Products',
  description: 'Set up promotional campaigns and manage your advertising budget to reach more customers.',
  keywords: 'promotion, advertising, budget, campaign, marketing, product promotion'
});

// Page layout (dashboard shell is provided by pages/dashboard.vue)
definePageMeta({
  layout: false
});

// State
const budgetType = ref('daily');
const currentBudget = ref(50);
const campaignDuration = ref(30);
const selectedLocations = ref(['US', 'CA', 'GB', 'AU']);
const promotionData = ref<any>(null);

// Available locations
const availableLocations = ref([
  { code: 'US', name: 'United States', flag: '🇺🇸', reach: '250M' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', reach: '35M' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', reach: '60M' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', reach: '25M' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', reach: '80M' },
  { code: 'FR', name: 'France', flag: '🇫🇷', reach: '65M' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', reach: '125M' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', reach: '6M' }
]);

// Initialize promotion data from query params
onMounted(() => {
  const route = useRoute();
  if (route.query.promote === 'true' && route.query.data) {
    try {
      promotionData.value = JSON.parse(atob(route.query.data as string));
      // Set initial budget based on suggested budget
      currentBudget.value = Math.round(promotionData.value.suggestedBudget / 30);
    } catch (error) {
      console.error('Error parsing promotion data:', error);
    }
  }
});

// Computed properties
const calculateROI = () => {
  if (!promotionData.value) return 0;
  const investment = budgetType.value === 'daily' ? currentBudget.value * campaignDuration.value : currentBudget.value;
  const expectedRevenue = investment * 2.8; // Estimated 2.8x return
  return Math.round(((expectedRevenue - investment) / investment) * 100);
};

const calculateMultiplier = () => {
  if (!promotionData.value) return 1;
  const baseBudget = promotionData.value.suggestedBudget;
  const actualBudget = budgetType.value === 'daily' ? currentBudget.value * campaignDuration.value : currentBudget.value;
  const multiplier = Math.max(1, actualBudget / baseBudget);
  return Math.round(multiplier * 10) / 10; // Round to 1 decimal
};

const calculatePotentialImpressions = () => {
  if (!promotionData.value) return 0;
  const baseImpressions = promotionData.value.potentialImpressions;
  const budgetMultiplier = calculateMultiplier();
  const locationMultiplier = selectedLocations.value.length / 4; // Base of 4 locations
  return Math.round(baseImpressions * budgetMultiplier * locationMultiplier);
};

const calculateGrowthPercentage = () => {
  if (!promotionData.value) return 0;
  const potentialImpressions = calculatePotentialImpressions();
  const currentViews = promotionData.value.currentViews;
  return Math.round((potentialImpressions / currentViews) * 100);
};

const calculateExpectedClicks = () => {
  const impressions = calculatePotentialImpressions();
  const avgCTR = 0.035; // 3.5% average CTR
  return Math.round(impressions * avgCTR);
};

const calculateRevenueProjection = () => {
  if (!promotionData.value) return 0;
  const clicks = calculateExpectedClicks();
  const conversionRate = 0.025; // 2.5% conversion rate
  const avgOrderValue = promotionData.value.currentRevenue / (promotionData.value.currentViews * 0.01); // Estimate AOV
  return Math.round(clicks * conversionRate * avgOrderValue);
};

const calculateNewUsers = () => {
  const clicks = calculateExpectedClicks();
  const signupRate = 0.15; // 15% of clicks become users
  return Math.round(clicks * signupRate);
};

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const goBack = () => {
  navigateTo('/dashboard/products');
};

const saveDraft = () => {
  const campaignData = {
    productId: promotionData.value?.productId,
    budgetType: budgetType.value,
    budget: currentBudget.value,
    duration: campaignDuration.value,
    locations: selectedLocations.value,
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  
  console.log('Saving campaign draft:', campaignData);
  // In a real app, this would save to backend
  
  // Show success message and redirect
  alert('Campaign saved as draft successfully!');
  goBack();
};

const launchCampaign = () => {
  const campaignData = {
    productId: promotionData.value?.productId,
    productName: promotionData.value?.productName,
    budgetType: budgetType.value,
    budget: currentBudget.value,
    duration: campaignDuration.value,
    locations: selectedLocations.value,
    totalInvestment: budgetType.value === 'daily' ? currentBudget.value * campaignDuration.value : currentBudget.value,
    expectedROI: calculateROI(),
    status: 'active',
    launchedAt: new Date().toISOString()
  };
  
  console.log('Launching campaign:', campaignData);
  // In a real app, this would create the campaign via API
  
  // Show success message and redirect
  alert(`Campaign launched successfully! Your "${promotionData.value?.productName}" promotion is now live.`);
  goBack();
};
</script>

<style scoped>
.budget-page {
  min-height: 100vh;
  background: #ffffff;
  padding: 0;
  margin-top: 144px;
}

/* Page Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.back-navigation {
  margin-bottom: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: #475569;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e2e8f0;
  color: #374151;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.title-section p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Promotion Overview */
.promotion-overview {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Compact Product Summary */
.product-summary-compact {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  height: fit-content;
}

.product-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.product-basic h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-tag {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #64748b;
}

.rating-info svg {
  color: #fbbf24;
  width: 1rem;
  height: 1rem;
}

.current-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.promotion-status {
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.ready {
  color: #059669;
}

.status-indicator svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* Dynamic Promotion Potential */
.promotion-potential-dynamic {
  background: linear-gradient(135deg, #f0f9ff 0%, #eff6ff 100%);
  border-radius: 0.75rem;
  border: 1px solid #bae6fd;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.promotion-potential-dynamic::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.potential-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.potential-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.multiplier-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.dynamic-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.primary-metric {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e0f2fe;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  flex: 1;
}

.metric-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.metric-content {
  flex: 1;
}

.metric-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.metric-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.metric-period {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.metric-growth {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 600;
  background: #ecfdf5;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  display: inline-block;
}

.secondary-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.secondary-metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #f1f5f9;
}

.secondary-metric svg {
  color: #3b82f6;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.metric-data {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.metric-data .value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.metric-data .label {
  font-size: 0.625rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Budget Configuration */
.budget-configuration {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: stretch;
}

.budget-card,
.duration-card,
.duration-card-full {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.budget-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.budget-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.budget-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.budget-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
}

.budget-period {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.budget-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: #f8fafc;
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.budget-type-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.budget-type-btn.active {
  background: white;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.budget-slider-container {
  margin-bottom: 1.5rem;
  flex: 1;
}

.budget-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  margin-bottom: 0.75rem;
  appearance: none;
  -webkit-appearance: none;
}

.budget-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  border: 2px solid white;
}

.budget-range {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #64748b;
}

.range-min,
.range-max {
  color: #9ca3af;
}

.suggested-budget {
  color: #10b981;
  font-weight: 600;
  background: #ecfdf5;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.budget-impact {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: auto;
}

.impact-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.impact-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.impact-row {
  display: flex;
  gap: 0.75rem;
}

.impact-item-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  flex: 1;
}

.impact-item-compact svg {
  color: #3b82f6;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.impact-data {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.impact-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.impact-label {
  font-size: 0.625rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Simplified Duration */
.duration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.duration-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.duration-display {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.duration-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.duration-unit {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.duration-selector {
  margin-bottom: 1rem;
}

.duration-track {
  position: relative;
  height: 60px;
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.duration-markers {
  display: flex;
  justify-content: space-between;
  height: 100%;
}

.duration-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  margin: 0 0.25rem;
  padding: 0.5rem;
}

.duration-marker.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.marker-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.marker-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.duration-marker.active .marker-value {
  color: #3b82f6;
}

.duration-marker.active .marker-label {
  color: #2563eb;
}

.duration-description {
  text-align: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.description-text {
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
}

/* Targeting Section */
.targeting-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.targeting-card,
.campaign-summary-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
}

.targeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.targeting-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.location-summary {
  font-size: 0.875rem;
  color: #64748b;
}

.location-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.location-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.location-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.location-option input {
  margin: 0;
}

.location-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.location-flag {
  font-size: 1.25rem;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.location-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}

.location-reach {
  font-size: 0.75rem;
  color: #64748b;
}

/* Campaign Summary */
.summary-header {
  margin-bottom: 1.5rem;
}

.summary-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.summary-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.summary-metric .metric-label {
  font-size: 0.875rem;
  color: #64748b;
}

.summary-metric .metric-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.campaign-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  flex: 1;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #d1d5db;
  flex: 1;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Budget Center (Default) */
.budget-center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.center-content {
  text-align: center;
  max-width: 400px;
}

.center-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem auto;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1.5rem;
}

.center-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.center-content p {
  color: #64748b;
  margin: 0 0 2rem 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .promotion-overview,
  .budget-configuration,
  .targeting-section {
    grid-template-columns: 1fr;
  }
  
  .secondary-metrics {
    grid-template-columns: 1fr;
  }
  
  .impact-grid {
    grid-template-columns: 1fr;
  }
  
  .location-grid {
    grid-template-columns: 1fr;
  }
  
  .product-info-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .current-stats {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .budget-page {
    margin-top: 136px;
  }
  
  .page-header,
  .main-content {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .promotion-overview {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .primary-metric {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .secondary-metrics {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .secondary-metric {
    justify-content: center;
  }
  
  .budget-configuration {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .campaign-actions {
    flex-direction: column;
  }
  
  .duration-markers {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .duration-marker {
    margin: 0;
  }
  
  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Enhanced Duration Card Styles for Budget Configuration */
.duration-card-full {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  transition: all 0.3s ease;
}

.duration-card-full:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.duration-header-full {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.duration-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.duration-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.duration-title h3 {
  font-size: 1.125rem;
  color: #334155;
  margin: 0;
}

.duration-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.duration-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0ea5e9;
}

.duration-unit {
  font-size: 0.75rem;
  color: #64748b;
}

.description-text {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

.duration-selector-compact {
  margin-bottom: 1rem;
}

.duration-options {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.duration-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.25rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.duration-option.active {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.option-number {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.option-unit {
  font-size: 0.625rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.duration-option.active .option-number {
  color: #0ea5e9;
}

.duration-option.active .option-unit {
  color: #0284c7;
}

.duration-impact {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.impact-metrics-compact {
  display: flex;
  gap: 0.75rem;
}

.duration-metric-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.5rem;
  border: 1px solid rgba(226, 232, 240, 0.5);
  flex: 1;
}

.duration-metric-compact svg {
  width: 1rem;
  height: 1rem;
  color: #0ea5e9;
  flex-shrink: 0;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  line-height: 1;
}

.metric-label {
  font-size: 0.625rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
