<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Funding & Investment Preferences</h2>
      <p>Tell us about your funding goals and investor preferences to connect you with the right opportunities</p>
    </div>

    <form @submit.prevent="submitStep">
      <!-- Funding Interest Section -->
      <AccordionSection
        title="Funding Interest"
        :default-expanded="true"
        :show-status="true"
        :status="fundingInterestStatus"
        :required="false"
      >
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
              ? 'Great! We\'ll help you connect with relevant investors and funding opportunities.' 
              : 'No problem! You can always update your funding preferences later.' 
            }}
          </p>
        </div>

        <!-- Funding Details (only show if seeking funding) -->
        <div v-if="localData.seekingFunding" class="funding-details">
          <div class="form-row">
            <div class="form-group">
              <label for="fundingStage">Funding Stage*</label>
              <select id="fundingStage" v-model="localData.fundingStage" required>
                <option value="">Select funding stage</option>
                <option 
                  v-for="(stage, key) in FUNDING_STAGES" 
                  :key="key" 
                  :value="key"
                  :disabled="key === 'not-seeking'"
                >
                  {{ stage.label }} - {{ stage.description }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="timeframe">Funding Timeframe*</label>
              <select id="timeframe" v-model="localData.timeframe" required>
                <option value="">Select timeframe</option>
                <option value="1-3-months">1-3 months</option>
                <option value="3-6-months">3-6 months</option>
                <option value="6-12-months">6-12 months</option>
                <option value="12+ months">12+ months</option>
              </select>
            </div>
          </div>

          <!-- Funding Amount Range -->
          <div class="form-group">
            <label>Funding Amount Range*</label>
            <div class="amount-inputs">
              <div class="currency-input">
                <select v-model="localData.fundingAmount.currency" class="currency-select">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div class="amount-range">
                <input 
                  type="number" 
                  v-model.number="localData.fundingAmount.min" 
                  placeholder="Minimum amount"
                  :min="0"
                  :max="localData.fundingAmount.max || 1000000000"
                  required
                />
                <span class="range-separator">to</span>
                <input 
                  type="number" 
                  v-model.number="localData.fundingAmount.max" 
                  placeholder="Maximum amount"
                  :min="localData.fundingAmount.min || 0"
                  :max="1000000000"
                  required
                />
              </div>
            </div>
            <div class="suggested-range" v-if="localData.fundingStage && FUNDING_STAGES[localData.fundingStage]">
              <p class="range-hint">
                Typical {{ FUNDING_STAGES[localData.fundingStage].label }} range: 
                {{ formatCurrency(FUNDING_STAGES[localData.fundingStage].typicalRange.min) }} - 
                {{ formatCurrency(FUNDING_STAGES[localData.fundingStage].typicalRange.max) }}
              </p>
            </div>
          </div>
        </div>
      </AccordionSection>

      <!-- Investor Preferences (only show if seeking funding) -->
      <AccordionSection
        v-if="localData.seekingFunding"
        title="Investor Preferences"
        :default-expanded="true"
        :show-status="true"
        :status="investorPreferencesStatus"
        :required="true"
      >
        <div class="form-group">
          <label>Preferred Investor Types*</label>
          <div class="checkbox-grid">
            <label 
              v-for="(type, key) in INVESTOR_TYPES" 
              :key="key" 
              class="checkbox-item"
            >
              <input 
                type="checkbox" 
                :value="key" 
                v-model="localData.investorTypes"
              />
              <span class="checkbox-label">
                <strong>{{ type.label }}</strong>
                <small>{{ type.description }}</small>
              </span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Use of Funds*</label>
          <div class="checkbox-grid">
            <label 
              v-for="(label, key) in USE_OF_FUNDS_OPTIONS" 
              :key="key" 
              class="checkbox-item"
            >
              <input 
                type="checkbox" 
                :value="key" 
                v-model="localData.useOfFunds"
              />
              <span class="checkbox-label">{{ label }}</span>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="geographicPreference">Geographic Preference</label>
            <input 
              type="text" 
              id="geographicPreference" 
              v-model="geographicInput"
              @keydown.enter.prevent="addGeographicPreference"
              placeholder="Add regions/countries (press Enter to add)"
            />
            <div class="tag-list" v-if="localData.geographicPreference.length > 0">
              <span 
                v-for="(location, index) in localData.geographicPreference" 
                :key="index" 
                class="tag"
              >
                {{ location }}
                <button type="button" @click="removeGeographicPreference(index)" class="tag-remove">×</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="industryExpertise">Industry Expertise Preference</label>
            <input 
              type="text" 
              id="industryExpertise" 
              v-model="industryInput"
              @keydown.enter.prevent="addIndustryExpertise"
              placeholder="Add industries (press Enter to add)"
            />
            <div class="tag-list" v-if="localData.industryExpertise.length > 0">
              <span 
                v-for="(industry, index) in localData.industryExpertise" 
                :key="index" 
                class="tag"
              >
                {{ industry }}
                <button type="button" @click="removeIndustryExpertise(index)" class="tag-remove">×</button>
              </span>
            </div>
          </div>
        </div>
      </AccordionSection>

      <!-- Business Traction (only show if seeking funding) -->
      <AccordionSection
        v-if="localData.seekingFunding"
        title="Business Traction & Metrics"
        :default-expanded="true"
        :show-status="true"
        :status="tractionStatus"
        :required="true"
      >
        <div class="form-row">
          <div class="form-group">
            <label for="currentRevenue">Current Revenue Stage*</label>
            <select id="currentRevenue" v-model="localData.currentRevenue" required>
              <option value="">Select revenue stage</option>
              <option 
                v-for="(label, key) in REVENUE_RANGES" 
                :key="key" 
                :value="key"
              >
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="customerCount">Customer Count</label>
            <input 
              type="number" 
              id="customerCount" 
              v-model.number="localData.businessMetrics.customerCount" 
              placeholder="Number of customers"
              min="0"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="currentTraction">Current Traction & Achievements*</label>
          <textarea 
            id="currentTraction" 
            v-model="localData.currentTraction" 
            required 
            placeholder="Describe your key achievements, growth metrics, partnerships, awards, etc."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Key Milestones</label>
          <div class="milestone-input">
            <input 
              type="text" 
              v-model="milestoneInput"
              @keydown.enter.prevent="addMilestone"
              placeholder="Add milestone (press Enter to add)"
            />
          </div>
          <div class="tag-list" v-if="localData.keyMilestones.length > 0">
            <span 
              v-for="(milestone, index) in localData.keyMilestones" 
              :key="index" 
              class="tag milestone-tag"
            >
              {{ milestone }}
              <button type="button" @click="removeMilestone(index)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </AccordionSection>

      <!-- Previous Funding (only show if seeking funding) -->
      <AccordionSection
        v-if="localData.seekingFunding"
        title="Previous Funding History"
        :default-expanded="false"
        :show-status="true"
        :status="fundingHistoryStatus"
      >
        <div class="form-group">
          <label class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="localData.previousFunding.hasRaised"
              @change="onPreviousFundingToggle"
            />
            <span class="checkbox-label">We have raised funding before</span>
          </label>
        </div>

        <div v-if="localData.previousFunding.hasRaised" class="previous-funding-details">
          <div class="form-row">
            <div class="form-group">
              <label for="totalRaised">Total Amount Raised</label>
              <input 
                type="number" 
                id="totalRaised" 
                v-model.number="localData.previousFunding.totalRaised" 
                placeholder="Total amount raised to date"
                min="0"
              />
            </div>

            <div class="form-group">
              <label for="lastRound">Last Funding Round</label>
              <input 
                type="text" 
                id="lastRound" 
                v-model="localData.previousFunding.lastRound" 
                placeholder="e.g., Seed, Series A"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="lastRoundDate">Last Round Date</label>
              <input 
                type="date" 
                id="lastRoundDate" 
                v-model="localData.previousFunding.lastRoundDate"
              />
            </div>

            <div class="form-group">
              <label for="investors">Previous Investors</label>
              <input 
                type="text" 
                v-model="investorInput"
                @keydown.enter.prevent="addInvestor"
                placeholder="Add investor names (press Enter to add)"
              />
            </div>
          </div>

          <div class="tag-list" v-if="localData.previousFunding.investors.length > 0">
            <span 
              v-for="(investor, index) in localData.previousFunding.investors" 
              :key="index" 
              class="tag investor-tag"
            >
              {{ investor }}
              <button type="button" @click="removeInvestor(index)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </AccordionSection>

      <!-- Communication Preferences (only show if seeking funding) -->
      <AccordionSection
        v-if="localData.seekingFunding"
        title="Communication Preferences"
        :default-expanded="false"
        :show-status="true"
        :status="communicationStatus"
      >
        <div class="form-group">
          <label>Preferred Meeting Format</label>
          <div class="checkbox-grid horizontal">
            <label class="checkbox-item">
              <input type="checkbox" value="virtual" v-model="localData.preferredMeetingFormat" />
              <span class="checkbox-label">Virtual Meetings</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" value="in-person" v-model="localData.preferredMeetingFormat" />
              <span class="checkbox-label">In-Person Meetings</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" value="hybrid" v-model="localData.preferredMeetingFormat" />
              <span class="checkbox-label">Hybrid Approach</span>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="localData.openToAdvice" />
              <span class="checkbox-label">Open to strategic advice and guidance</span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="localData.openToMentorship" />
              <span class="checkbox-label">Interested in mentorship opportunities</span>
            </label>
          </div>
        </div>
      </AccordionSection>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import AccordionSection from '~/components/AccordionSection.vue';
import type { FundingPreferences } from '~/types/funding';
import { 
  DEFAULT_FUNDING_PREFERENCES, 
  FUNDING_STAGES, 
  INVESTOR_TYPES, 
  USE_OF_FUNDS_OPTIONS,
  REVENUE_RANGES,
  FundingValidation
} from '~/types/funding';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// Create local data with funding preferences
const localData = reactive<FundingPreferences>({
  ...DEFAULT_FUNDING_PREFERENCES,
  ...(props.formData.fundingPreferences || {})
});

// Input fields for dynamic lists
const geographicInput = ref('');
const industryInput = ref('');
const milestoneInput = ref('');
const investorInput = ref('');

// Watch for changes and emit updates
watch(localData, (newVal) => {
  emit('update-data', { fundingPreferences: { ...newVal } });
}, { deep: true });

// Computed status indicators
const fundingInterestStatus = computed(() => {
  if (!localData.seekingFunding) return 'complete';
  
  const required = ['fundingStage', 'timeframe'];
  const hasRequiredFields = required.every(field => {
    const value = localData[field as keyof FundingPreferences];
    return value && value.toString().trim() !== '';
  });
  
  const hasValidAmount = localData.fundingAmount.min > 0 && localData.fundingAmount.max >= localData.fundingAmount.min;
  
  return (hasRequiredFields && hasValidAmount) ? 'complete' : 'required';
});

const investorPreferencesStatus = computed(() => {
  if (!localData.seekingFunding) return 'complete';
  
  const hasInvestorTypes = localData.investorTypes.length > 0;
  const hasUseOfFunds = localData.useOfFunds.length > 0;
  
  return (hasInvestorTypes && hasUseOfFunds) ? 'complete' : 'required';
});

const tractionStatus = computed(() => {
  if (!localData.seekingFunding) return 'complete';
  
  const hasRevenue = localData.currentRevenue && localData.currentRevenue.trim() !== '';
  const hasTraction = localData.currentTraction && localData.currentTraction.trim() !== '';
  
  return (hasRevenue && hasTraction) ? 'complete' : 'required';
});

const fundingHistoryStatus = computed(() => {
  if (!localData.seekingFunding) return 'complete';
  if (!localData.previousFunding.hasRaised) return 'complete';
  
  const hasBasicInfo = localData.previousFunding.totalRaised > 0 && localData.previousFunding.lastRound;
  return hasBasicInfo ? 'complete' : 'incomplete';
});

const communicationStatus = computed(() => {
  if (!localData.seekingFunding) return 'complete';
  
  const hasPreferences = localData.preferredMeetingFormat.length > 0;
  return hasPreferences ? 'complete' : 'incomplete';
});

// Event handlers
const onFundingToggle = () => {
  if (!localData.seekingFunding) {
    // Reset funding-related fields when toggling off
    localData.fundingStage = '';
    localData.investorTypes = [];
    localData.useOfFunds = [];
    localData.fundingAmount = { min: 0, max: 0, currency: 'USD' };
  }
};

const onPreviousFundingToggle = () => {
  if (!localData.previousFunding.hasRaised) {
    // Reset previous funding fields
    localData.previousFunding.totalRaised = 0;
    localData.previousFunding.lastRound = '';
    localData.previousFunding.lastRoundDate = '';
    localData.previousFunding.investors = [];
  }
};

// Dynamic list management
const addGeographicPreference = () => {
  if (geographicInput.value.trim()) {
    localData.geographicPreference.push(geographicInput.value.trim());
    geographicInput.value = '';
  }
};

const removeGeographicPreference = (index: number) => {
  localData.geographicPreference.splice(index, 1);
};

const addIndustryExpertise = () => {
  if (industryInput.value.trim()) {
    localData.industryExpertise.push(industryInput.value.trim());
    industryInput.value = '';
  }
};

const removeIndustryExpertise = (index: number) => {
  localData.industryExpertise.splice(index, 1);
};

const addMilestone = () => {
  if (milestoneInput.value.trim()) {
    localData.keyMilestones.push(milestoneInput.value.trim());
    milestoneInput.value = '';
  }
};

const removeMilestone = (index: number) => {
  localData.keyMilestones.splice(index, 1);
};

const addInvestor = () => {
  if (investorInput.value.trim()) {
    localData.previousFunding.investors.push(investorInput.value.trim());
    investorInput.value = '';
  }
};

const removeInvestor = (index: number) => {
  localData.previousFunding.investors.splice(index, 1);
};

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: localData.fundingAmount.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const submitStep = () => {
  emit('update-data', { fundingPreferences: { ...localData } });
  emit('submit-step');
};

// Validation function for parent component
const validateForm = () => {
  if (!localData.seekingFunding) return true;
  
  return FundingValidation.isComplete(localData);
};

// Expose validation to parent
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

/* Funding Toggle Section */
.funding-toggle-section {
  margin-bottom: var(--spacing-xl);
}

.toggle-container {
  margin-bottom: var(--spacing-md);
}

.toggle-label {
  display: flex;
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
  margin: var(--spacing-sm) 0;
}

/* Form styling */
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

input, textarea, select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

/* Amount inputs */
.amount-inputs {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.currency-input {
  flex-shrink: 0;
}

.currency-select {
  width: 80px;
  padding: var(--spacing-md);
}

.amount-range {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex: 1;
}

.range-separator {
  color: var(--text-secondary);
  font-weight: 500;
}

.suggested-range {
  margin-top: var(--spacing-sm);
}

.range-hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

/* Checkbox grid */
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.checkbox-grid.horizontal {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  margin: 0;
  flex-shrink: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  flex: 1;
  line-height: 1.4;
}

.checkbox-label strong {
  color: var(--text-primary);
}

.checkbox-label small {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* Standalone checkbox items (not in grid) */
.form-group > .checkbox-item {
  border: none;
  padding: var(--spacing-sm) 0;
  background: transparent;
}

.form-group > .checkbox-item:hover {
  background: transparent;
  border: none;
}

/* Checkbox grid styling */
.checkbox-grid .checkbox-item {
  border: 1px solid var(--color-gray-200);
  padding: var(--spacing-md);
  background: var(--light-color);
}

.checkbox-grid .checkbox-item:hover {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

/* Tags */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 10px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border: 1px solid rgba(var(--primary-color-rgb), 0.3);
  border-radius: var(--border-radius-md);
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.milestone-tag {
  background-color: rgba(var(--color-green-500-rgb), 0.1);
  border-color: rgba(var(--color-green-500-rgb), 0.3);
  color: var(--color-green-700);
}

.investor-tag {
  background-color: rgba(var(--color-blue-500-rgb), 0.1);
  border-color: rgba(var(--color-blue-500-rgb), 0.3);
  color: var(--color-blue-700);
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.tag-remove:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Previous funding details */
.previous-funding-details {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-gray);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
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
  
  .checkbox-grid {
    grid-template-columns: 1fr;
  }
  
  .amount-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .amount-range {
    flex-direction: column;
  }
}
</style>
