<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Funding Interest</h2>
      <p>Quick questions about your funding goals (optional)</p>
    </div>

    <form @submit.prevent="submitStep">
      <!-- Main Funding Toggle -->
      <div class="funding-toggle-section">
        <div class="toggle-container">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              v-model="localData.seekingFunding" 
              @change="onFundingToggle"
              class="toggle-input"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-text">
              {{ localData.seekingFunding ? 'Yes, I am seeking funding' : 'Not seeking funding at this time' }}
            </span>
          </label>
        </div>
        
        <p class="funding-description">
          {{ localData.seekingFunding 
            ? 'Great! Answer a few quick questions to help us connect you with investors.' 
            : 'No problem! You can always update this later in your profile.' 
          }}
        </p>
      </div>

      <!-- Quick Funding Questions (only show if seeking funding) -->
      <div v-if="localData.seekingFunding" class="funding-questions">
        <div class="form-row">
          <div class="form-group">
            <label for="fundingStage">What stage are you at?*</label>
            <select id="fundingStage" v-model="localData.fundingStage" required>
              <option value="">Select stage</option>
              <option value="pre-seed">Pre-Seed (Idea to prototype)</option>
              <option value="seed">Seed (Early traction)</option>
              <option value="series-a">Series A (Scaling up)</option>
              <option value="series-b">Series B+ (Growth stage)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="timeframe">When do you need funding?*</label>
            <select id="timeframe" v-model="localData.timeframe" required>
              <option value="">Select timeframe</option>
              <option value="1-3-months">Within 3 months</option>
              <option value="3-6-months">3-6 months</option>
              <option value="6-12-months">6-12 months</option>
              <option value="12+ months">12+ months</option>
            </select>
          </div>
        </div>

        <!-- Funding Amount Slider -->
        <div class="form-group">
          <label>How much funding do you need?*</label>
          <div class="amount-slider-container">
            <div class="slider-inputs">
              <div class="amount-input-group">
                <span class="currency-symbol">$</span>
                <input 
                  type="number" 
                  v-model.number="localData.fundingAmount.min" 
                  placeholder="Min amount"
                  :max="localData.fundingAmount.max || 10000000"
                  min="0"
                  required
                  class="amount-input"
                />
              </div>
              <span class="amount-separator">to</span>
              <div class="amount-input-group">
                <span class="currency-symbol">$</span>
                <input 
                  type="number" 
                  v-model.number="localData.fundingAmount.max" 
                  placeholder="Max amount"
                  :min="localData.fundingAmount.min || 0"
                  max="10000000"
                  required
                  class="amount-input"
                />
              </div>
            </div>
            
            <!-- Quick amount buttons -->
            <div class="quick-amounts">
              <button 
                type="button" 
                v-for="range in quickAmountRanges" 
                :key="range.label"
                @click="setQuickAmount(range)"
                class="quick-amount-btn"
                :class="{ active: isQuickAmountActive(range) }"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Investor Types (max 3) -->
        <div class="form-group">
          <label>What type of investors are you looking for?* (Choose up to 3)</label>
          <div class="investor-grid">
            <label 
              v-for="(type, key) in QUICK_INVESTOR_TYPES" 
              :key="key" 
              class="investor-option"
              :class="{ 
                selected: localData.investorTypes.includes(key),
                disabled: !localData.investorTypes.includes(key) && localData.investorTypes.length >= 3
              }"
            >
              <input 
                type="checkbox" 
                :value="key" 
                v-model="localData.investorTypes"
                :disabled="!localData.investorTypes.includes(key) && localData.investorTypes.length >= 3"
              />
              <div class="investor-card">
                <div class="investor-icon">
                  <UIcon :name="type.icon" />
                </div>
                <div class="investor-label">{{ type.label }}</div>
                <div class="investor-desc">{{ type.description }}</div>
              </div>
            </label>
          </div>
          <p class="selection-hint">{{ localData.investorTypes.length }}/3 selected</p>
        </div>

        <!-- Use of Funds (multiselect dropdown) -->
        <div class="form-group">
          <label>What will you use the funding for?* (Choose main areas)</label>
          <div class="custom-multiselect" :class="{ active: isUseOfFundsDropdownOpen }" ref="useOfFundsMultiselectRef">
            <div class="multiselect-input" @click="toggleUseOfFundsDropdown">
              <div v-if="localData.useOfFunds.length === 0" class="placeholder">
                Select funding uses
              </div>
              <div v-else class="selected-options">
                <span class="selected-count">{{ localData.useOfFunds.length }} selected</span>
              </div>
              <div class="dropdown-icon">
                <span>{{ isUseOfFundsDropdownOpen ? '▲' : '▼' }}</span>
              </div>
            </div>
            
            <div v-if="isUseOfFundsDropdownOpen" class="dropdown-container">
              <div class="options-container">
                <div 
                  v-for="(label, key) in QUICK_USE_OF_FUNDS" 
                  :key="key" 
                  class="option-item"
                  @click.stop="toggleUseOfFunds(key)"
                >
                  <div class="checkbox" :class="{ checked: isUseOfFundsSelected(key) }">
                    <span v-if="isUseOfFundsSelected(key)">✓</span>
                  </div>
                  <span>{{ label }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="selected-items" v-if="localData.useOfFunds.length > 0">
            <div 
              v-for="(item, index) in localData.useOfFunds" 
              :key="index" 
              class="selected-tag"
            >
              <span>{{ QUICK_USE_OF_FUNDS[item] }}</span>
              <button 
                type="button" 
                class="remove-tag-btn"
                @click="removeUseOfFunds(item)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Skip Option -->
      <div class="skip-section">
        <button type="button" @click="skipFunding" class="skip-btn">
          Skip funding questions for now
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import type { QuickFundingPreferences } from '~/types/funding';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// Quick funding data structure
const localData = reactive<QuickFundingPreferences>({
  seekingFunding: props.formData.fundingPreferences?.seekingFunding || false,
  fundingStage: props.formData.fundingPreferences?.fundingStage || '',
  fundingAmount: {
    min: props.formData.fundingPreferences?.fundingAmount?.min || 0,
    max: props.formData.fundingPreferences?.fundingAmount?.max || 0,
    currency: 'USD'
  },
  investorTypes: props.formData.fundingPreferences?.investorTypes || [],
  timeframe: props.formData.fundingPreferences?.timeframe || '3-6-months',
  useOfFunds: props.formData.fundingPreferences?.useOfFunds || []
});

// Multiselect dropdown state
const isUseOfFundsDropdownOpen = ref(false);
const useOfFundsMultiselectRef = ref<HTMLElement | null>(null);

// Quick investor types with SVG icons
const QUICK_INVESTOR_TYPES = {
  'angel': {
    label: 'Angel Investors',
    description: 'Individual investors',
    icon: 'i-heroicons-user-circle'
  },
  'vc': {
    label: 'VC Firms',
    description: 'Venture capital',
    icon: 'i-heroicons-building-office'
  },
  'accelerator': {
    label: 'Accelerators',
    description: 'Programs + funding',
    icon: 'i-heroicons-rocket-launch'
  },
  'corporate-vc': {
    label: 'Corporate VC',
    description: 'Strategic investors',
    icon: 'i-heroicons-building-office-2'
  },
  'crowdfunding': {
    label: 'Crowdfunding',
    description: 'Public platforms',
    icon: 'i-heroicons-users'
  },
  'government': {
    label: 'Grants',
    description: 'Government funding',
    icon: 'i-heroicons-building-library'
  }
};

// Quick use of funds options
const QUICK_USE_OF_FUNDS = {
  'product-development': 'Product Development',
  'marketing': 'Marketing & Sales',
  'hiring': 'Team Growth',
  'operations': 'Operations'
};

// Quick amount ranges
const quickAmountRanges = [
  { label: '$10K - $100K', min: 10000, max: 100000 },
  { label: '$100K - $500K', min: 100000, max: 500000 },
  { label: '$500K - $1M', min: 500000, max: 1000000 },
  { label: '$1M - $5M', min: 1000000, max: 5000000 },
  { label: '$5M+', min: 5000000, max: 50000000 }
];

// Watch for changes
watch(localData, (newVal) => {
  emit('update-data', { 
    fundingPreferences: {
      ...newVal,
      // Set defaults for fields not in quick form
      geographicPreference: [],
      industryExpertise: [],
      currentRevenue: 'pre-revenue',
      revenueProjections: { year1: 0, year2: 0, year3: 0 },
      currentTraction: '',
      keyMilestones: [],
      previousFunding: {
        hasRaised: false,
        totalRaised: 0,
        lastRound: '',
        lastRoundDate: '',
        investors: []
      },
      businessMetrics: {
        monthlyActiveUsers: 0,
        monthlyRecurringRevenue: 0,
        customerCount: 0,
        churnRate: 0,
        growthRate: 0
      },
      teamStrengths: [],
      advisors: [],
      preferredMeetingFormat: ['virtual'],
      openToAdvice: true,
      openToMentorship: true,
      pitchDeck: '',
      businessPlan: '',
      financialProjections: '',
      preferredCommunication: ['email'],
      timezone: '',
      availabilityNotes: ''
    }
  });
}, { deep: true });

// Event handlers
const onFundingToggle = () => {
  if (!localData.seekingFunding) {
    // Reset funding fields
    localData.fundingStage = '';
    localData.investorTypes = [];
    localData.useOfFunds = [];
    localData.fundingAmount = { min: 0, max: 0, currency: 'USD' };
    localData.timeframe = '3-6-months';
  }
};

const setQuickAmount = (range: { min: number; max: number }) => {
  localData.fundingAmount.min = range.min;
  localData.fundingAmount.max = range.max;
};

const isQuickAmountActive = (range: { min: number; max: number }) => {
  return localData.fundingAmount.min === range.min && localData.fundingAmount.max === range.max;
};

const skipFunding = () => {
  localData.seekingFunding = false;
  onFundingToggle();
  submitStep();
};

const submitStep = () => {
  emit('submit-step');
};

// Multiselect dropdown functions
const toggleUseOfFundsDropdown = (event: Event) => {
  event.stopPropagation();
  isUseOfFundsDropdownOpen.value = !isUseOfFundsDropdownOpen.value;
};

const isUseOfFundsSelected = (key: string) => {
  return localData.useOfFunds.includes(key as any);
};

const toggleUseOfFunds = (key: string) => {
  const index = localData.useOfFunds.indexOf(key as any);
  if (index === -1) {
    localData.useOfFunds.push(key as any);
  } else {
    localData.useOfFunds.splice(index, 1);
  }
};

const removeUseOfFunds = (key: string) => {
  const index = localData.useOfFunds.indexOf(key as any);
  if (index !== -1) {
    localData.useOfFunds.splice(index, 1);
  }
};

// Close dropdown when clicking outside
const closeDropdownOnClickOutside = (event: MouseEvent) => {
  if (!isUseOfFundsDropdownOpen.value) return;
  
  if (useOfFundsMultiselectRef.value && !useOfFundsMultiselectRef.value.contains(event.target as Node)) {
    isUseOfFundsDropdownOpen.value = false;
  }
};

// Register and unregister click event listener
onMounted(() => {
  document.addEventListener('click', closeDropdownOnClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownOnClickOutside);
});

// Validation
const validateForm = () => {
  if (!localData.seekingFunding) return true;
  
  return !!(
    localData.fundingStage &&
    localData.fundingAmount.min > 0 &&
    localData.fundingAmount.max >= localData.fundingAmount.min &&
    localData.investorTypes.length > 0 &&
    localData.useOfFunds.length > 0 &&
    localData.timeframe
  );
};

// Expose validation
defineExpose({
  validateForm
});
</script>

<style scoped>
.step-container {
  padding: var(--spacing-xl);
}

.step-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.step-header h2 {
  font-size: 1.75rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.step-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* Funding Toggle */
.funding-toggle-section {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.toggle-container {
  margin-bottom: var(--spacing-md);
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 1.1rem;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 50px;
  height: 24px;
  background-color: var(--color-gray-300);
  border-radius: 24px;
  transition: background-color 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(26px);
}

.funding-description {
  color: var(--text-secondary);
  font-style: italic;
}

/* Form styling */
.funding-questions {
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: flex;
  gap: var(--spacing-lg);
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

select, input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

select:focus, input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

/* Amount inputs */
.amount-slider-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.slider-inputs {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.amount-input-group {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  flex: 1;
}

.currency-symbol {
  background-color: var(--bg-gray);
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-weight: 500;
  border-right: 1px solid var(--color-gray-300);
}

.amount-input {
  border: none;
  border-radius: 0;
  margin: 0;
}

.amount-input:focus {
  box-shadow: none;
}

.amount-input-group:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.amount-separator {
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.quick-amount-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  background-color: white;
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.quick-amount-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.quick-amount-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* Investor grid */
.investor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.investor-option {
  cursor: pointer;
}

.investor-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.investor-option input {
  display: none;
}

.investor-card {
  border: 2px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  text-align: center;
  transition: all 0.2s ease;
  background-color: white;
}

.investor-option:hover:not(.disabled) .investor-card {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.investor-option:hover:not(.disabled) .investor-icon {
  background-color: var(--primary-color);
}

.investor-option:hover:not(.disabled) .investor-icon svg {
  color: white;
}

.investor-option.selected .investor-card {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.investor-option.selected .investor-icon {
  background-color: var(--primary-color);
}

.investor-option.selected .investor-icon svg {
  color: white;
}

.investor-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border-radius: 50%;
  margin: 0 auto var(--spacing-sm);
  transition: all 0.2s ease;
}

.investor-icon svg {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.investor-label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.investor-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Multiselect dropdown styling */
.custom-multiselect {
  position: relative;
  width: 100%;
}

.multiselect-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--light-color);
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  height: calc(1rem + 2 * var(--spacing-md) + 2px);
}

.multiselect-input:hover {
  border-color: var(--color-gray-400);
}

.custom-multiselect.active .multiselect-input {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.placeholder {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: normal;
}

.selected-options {
  display: flex;
  align-items: center;
  height: 100%;
}

.selected-count {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
  line-height: normal;
}

.dropdown-icon {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--spacing-sm);
  transition: transform 0.2s ease;
  height: 100%;
}

.active .dropdown-icon {
  color: var(--primary-color);
}

.dropdown-container {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 300px;
  background-color: var(--light-color);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: 100;
  overflow: hidden;
  animation: dropdown-fade-in 0.2s ease;
}

.options-container {
  max-height: 280px;
  overflow-y: auto;
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.option-item:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-gray-400);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox.checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 10px;
  background-color: rgba(var(--primary-color-rgb), 0.08);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: var(--border-radius-md);
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.remove-tag-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  margin-left: 2px;
}

.remove-tag-btn:hover {
  background-color: rgba(var(--primary-color-rgb), 0.15);
}

@keyframes dropdown-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.selection-hint {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: var(--spacing-sm);
}

/* Use of funds grid */
.use-of-funds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-sm);
}

.funds-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.funds-option:hover {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.funds-option.selected {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.funds-option input {
  width: auto;
  margin: 0;
}

.funds-label {
  font-weight: 500;
  color: var(--text-primary);
}

/* Skip section */
.skip-section {
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
}

.skip-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
  padding: var(--spacing-sm) var(--spacing-md);
  transition: color 0.2s ease;
}

.skip-btn:hover {
  color: var(--primary-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .slider-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .investor-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .use-of-funds-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-amounts {
    justify-content: center;
  }
}
</style>
