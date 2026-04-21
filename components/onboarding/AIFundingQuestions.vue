<template>
  <div class="ai-funding-section">
    <div class="section-header">
      <h3>Funding Interest</h3>
      <p>Let AI help determine your funding needs</p>
    </div>

    <div class="funding-toggle">
      <label class="toggle-label">
        <input 
          type="checkbox" 
          v-model="localData.seekingFunding"
          @change="onFundingToggle"
          class="toggle-input"
        />
        <span class="toggle-slider"></span>
        <span class="toggle-text">
          {{ localData.seekingFunding ? 'Interested in funding opportunities' : 'Not seeking funding at this time' }}
        </span>
      </label>
    </div>

    <div v-if="localData.seekingFunding" class="ai-suggestions">
        <div class="ai-analysis" v-if="aiSuggestions">
          <div class="ai-header">
            <div class="ai-icon">
              <UIcon name="i-heroicons-cpu-chip" />
            </div>
            <h4>AI Analysis</h4>
            <div class="confidence-score">
              {{ aiSuggestions.confidence }}% confidence
            </div>
          </div>        <div class="suggestions-grid">
          <div class="suggestion-card">
            <label>Suggested Stage</label>
            <select v-model="localData.suggestedStage">
              <option v-for="(stage, key) in FUNDING_STAGES" :key="key" :value="key">
                {{ stage.label }}
              </option>
            </select>
            <small class="ai-reasoning">{{ stageReasoning }}</small>
          </div>

          <div class="suggestion-card">
            <label>Estimated Amount Range</label>
            <div class="amount-display">
              {{ formatCurrency(localData.suggestedAmount.min) }} - 
              {{ formatCurrency(localData.suggestedAmount.max) }}
            </div>
            <small class="ai-reasoning">Based on your product stage and market</small>
          </div>

          <div class="suggestion-card full-width">
            <label>Recommended Investor Types</label>
            <div class="investor-chips">
              <span 
                v-for="type in localData.suggestedInvestorTypes" 
                :key="type" 
                class="investor-chip"
              >
                {{ INVESTOR_TYPES[type]?.label }}
              </span>
            </div>
          </div>
        </div>

        <div class="ai-reasoning-box">
          <h5>Why these suggestions?</h5>
          <p>{{ aiSuggestions.reasoning }}</p>
        </div>

        <div class="suggestion-actions" v-if="!suggestionsAccepted && !showCustomization">
          <button type="button" @click="acceptSuggestions" class="btn btn-primary">
            Accept AI Suggestions
          </button>
          <button type="button" @click="customizeFunding" class="btn btn-outline">
            Customize
          </button>
        </div>

        <!-- Accepted Suggestions Summary -->
        <div v-if="suggestionsAccepted" class="accepted-summary">
          <div class="success-message">
            <UIcon name="i-heroicons-check-circle" />
            <span>AI suggestions accepted successfully!</span>
          </div>
          <div class="accepted-details">
            <h5>Your Funding Profile:</h5>
            <div class="profile-grid">
              <div class="profile-item">
                <strong>Stage:</strong> {{ currentStageLabel }}
              </div>
              <div class="profile-item">
                <strong>Amount:</strong> {{ formatCurrency(localData.suggestedAmount.min) }} - {{ formatCurrency(localData.suggestedAmount.max) }}
              </div>
              <div class="profile-item">
                <strong>Investors:</strong> {{ localData.suggestedInvestorTypes.map(type => INVESTOR_TYPES[type]?.label).join(', ') }}
              </div>
            </div>
            <button type="button" @click="modifyChoices" class="btn btn-outline btn-small">
              <UIcon name="i-heroicons-pencil" />
              Modify Choices
            </button>
          </div>
        </div>

        <!-- Customization Form -->
        <div v-if="showCustomization" class="customization-form">
          <div class="form-header">
            <h5>Customize Your Funding Preferences</h5>
            <p>Adjust the AI suggestions to match your specific needs</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="custom-stage">Funding Stage</label>
              <select id="custom-stage" v-model="localData.suggestedStage">
                <option v-for="(stage, key) in FUNDING_STAGES" :key="key" :value="key">
                  {{ stage.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Amount Range</label>
              <div class="amount-inputs">
                <div class="input-group">
                  <label for="min-amount">Minimum</label>
                  <input 
                    type="number" 
                    id="min-amount"
                    v-model="localData.suggestedAmount.min" 
                    placeholder="50000"
                  />
                </div>
                <div class="input-group">
                  <label for="max-amount">Maximum</label>
                  <input 
                    type="number" 
                    id="max-amount"
                    v-model="localData.suggestedAmount.max" 
                    placeholder="500000"
                  />
                </div>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Investor Types</label>
              <div class="investor-checkboxes">
                <label v-for="(investor, key) in INVESTOR_TYPES" :key="key" class="checkbox-item">
                  <input 
                    type="checkbox" 
                    :value="key"
                    v-model="localData.suggestedInvestorTypes"
                  />
                  <span class="checkbox-label">{{ investor.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="customization-actions">
            <button type="button" @click="saveCustomization" class="btn btn-primary">
              Save Preferences
            </button>
            <button type="button" @click="cancelCustomization" class="btn btn-outline">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div class="generating-analysis" v-else-if="isAnalyzing">
        <div class="loading-animation">
          <div class="loading-spinner"></div>
          <p>Analyzing your product for funding recommendations...</p>
        </div>
      </div>

      <button 
        v-else 
        @click="generateAISuggestions" 
        class="btn btn-primary analyze-btn"
      >
        <UIcon name="i-heroicons-cpu-chip" />
        Analyze My Funding Needs
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { AIFundingPreferences } from '~/types/funding';
import { FUNDING_STAGES, INVESTOR_TYPES } from '~/types/funding';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-data', 'customize-funding']);

// Local data
const localData = reactive<AIFundingPreferences & { suggestedUseOfFunds?: string[] }>({
  seekingFunding: props.formData.fundingPreferences?.seekingFunding || false,
  suggestedStage: props.formData.fundingPreferences?.fundingStage || 'pre-seed',
  suggestedAmount: props.formData.fundingPreferences?.fundingAmount || {
    min: 50000,
    max: 500000,
    currency: 'USD'
  },
  suggestedInvestorTypes: props.formData.fundingPreferences?.investorTypes || ['angel', 'vc'],
  suggestedUseOfFunds: [],
  confidence: 85,
  reasoning: ''
});

const isAnalyzing = ref(false);
const aiSuggestions = ref<any>(null);
const showCustomization = ref(false);
const suggestionsAccepted = ref(false);

// Computed values
const stageReasoning = computed(() => {
  if (localData.suggestedStage && localData.suggestedStage in FUNDING_STAGES) {
    const stage = FUNDING_STAGES[localData.suggestedStage as keyof typeof FUNDING_STAGES];
    return stage ? `${stage.description} - fits your current product stage` : '';
  }
  return '';
});

const currentStageLabel = computed(() => {
  if (localData.suggestedStage && localData.suggestedStage in FUNDING_STAGES) {
    return FUNDING_STAGES[localData.suggestedStage as keyof typeof FUNDING_STAGES]?.label || '';
  }
  return '';
});

// Watch for changes
watch(localData, (newVal) => {
  if (newVal.seekingFunding) {
    const fundingPreferences = {
      seekingFunding: true,
      fundingStage: newVal.suggestedStage,
      fundingAmount: newVal.suggestedAmount,
      investorTypes: newVal.suggestedInvestorTypes,
      timeframe: '3-6-months' as const,
      useOfFunds: ['product-development', 'marketing'] as const,
      // Set defaults for other required fields
      geographicPreference: [],
      industryExpertise: [],
      currentRevenue: 'pre-revenue' as const,
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
      preferredMeetingFormat: ['virtual'] as const,
      openToAdvice: true,
      openToMentorship: true,
      pitchDeck: '',
      businessPlan: '',
      financialProjections: '',
      preferredCommunication: ['email'] as const,
      timezone: '',
      availabilityNotes: ''
    };
    
    emit('update-data', { fundingPreferences });
  } else {
    emit('update-data', { fundingPreferences: null });
  }
}, { deep: true });

// Event handlers
const onFundingToggle = () => {
  if (localData.seekingFunding) {
    // Auto-generate suggestions when funding is enabled
    setTimeout(() => {
      generateAISuggestions();
    }, 500);
  } else {
    aiSuggestions.value = null;
  }
};

const generateAISuggestions = async () => {
  isAnalyzing.value = true;
  
  // Simulate AI analysis based on product data
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate suggestions based on product info
  const productStage = analyzeProductStage();
  const suggestedAmount = calculateFundingAmount(productStage);
  const investorTypes = suggestInvestorTypes(productStage);
  
  aiSuggestions.value = {
    seekingFunding: true,
    suggestedStage: productStage,
    suggestedAmount: suggestedAmount,
    suggestedInvestorTypes: investorTypes,
    confidence: 87,
    reasoning: generateReasoning(productStage, suggestedAmount, investorTypes)
  };
  
  // Update local data with suggestions
  Object.assign(localData, aiSuggestions.value);
  
  isAnalyzing.value = false;
};

const analyzeProductStage = (): AIFundingPreferences['suggestedStage'] => {
  const productName = props.formData.productName || '';
  const description = props.formData.shortDescription || '';
  const hasWebsite = !!props.formData.productWebsite;
  
  // Simple heuristics for demo
  if (!hasWebsite || description.includes('idea') || description.includes('concept')) {
    return 'pre-seed';
  }
  
  if (description.includes('beta') || description.includes('launch') || description.includes('mvp')) {
    return 'seed';
  }
  
  if (description.includes('scaling') || description.includes('growth') || description.includes('expand')) {
    return 'series-a';
  }
  
  return 'seed'; // Default
};

const calculateFundingAmount = (stage: AIFundingPreferences['suggestedStage']) => {
  const ranges = {
    'pre-seed': { min: 25000, max: 250000 },
    'seed': { min: 250000, max: 1500000 },
    'series-a': { min: 1000000, max: 10000000 },
    'series-b': { min: 10000000, max: 30000000 },
    'series-c+': { min: 25000000, max: 100000000 },
    'bridge': { min: 500000, max: 3000000 },
    'not-seeking': { min: 0, max: 0 }
  };
  
  const safeStage = stage && stage in ranges ? stage as keyof typeof ranges : 'seed';
  
  return {
    min: ranges[safeStage]?.min || 100000,
    max: ranges[safeStage]?.max || 1000000,
    currency: 'USD' as const
  };
};

const suggestInvestorTypes = (stage: AIFundingPreferences['suggestedStage']) => {
  const suggestions = {
    'pre-seed': ['angel', 'accelerator'],
    'seed': ['angel', 'vc', 'accelerator'],
    'series-a': ['vc', 'corporate-vc'],
    'series-b': ['vc', 'corporate-vc'],
    'series-c+': ['vc', 'corporate-vc'],
    'bridge': ['vc', 'angel'],
    'not-seeking': []
  };
  
  const safeStage = stage && stage in suggestions ? stage as keyof typeof suggestions : 'seed';
  return suggestions[safeStage] || ['angel', 'vc'];
};

const generateReasoning = (stage: string, amount: any, investors: string[]) => {
  const safeStage = stage && stage in FUNDING_STAGES ? stage as keyof typeof FUNDING_STAGES : 'seed';
  const stageInfo = FUNDING_STAGES[safeStage];
  const investorLabels = investors.map(i => {
    const safeInvestor = i && i in INVESTOR_TYPES ? i as keyof typeof INVESTOR_TYPES : 'angel';
    return INVESTOR_TYPES[safeInvestor]?.label;
  }).filter(Boolean);
  
  return `Based on your product description and current stage, you appear to be in the ${stageInfo?.label} phase. This typically requires ${formatCurrency(amount.min)}-${formatCurrency(amount.max)} to achieve key milestones like product development, early customer acquisition, and team building. ${investorLabels.join(' and ')} investors are most active in this stage.`;
};

const acceptSuggestions = () => {
  suggestionsAccepted.value = true;
  // Emit the accepted data
  emit('update-data', {
    fundingStage: localData.suggestedStage,
    fundingAmount: localData.suggestedAmount,
    investorTypes: localData.suggestedInvestorTypes,
    useOfFunds: localData.suggestedUseOfFunds || [],
    aiSuggestionsAccepted: true
  });
};

const customizeFunding = () => {
  showCustomization.value = true;
};

const modifyChoices = () => {
  suggestionsAccepted.value = false;
  showCustomization.value = true;
};

const saveCustomization = () => {
  showCustomization.value = false;
  suggestionsAccepted.value = true;
  
  // Emit the customized data
  emit('update-data', {
    fundingStage: localData.suggestedStage,
    fundingAmount: localData.suggestedAmount,
    investorTypes: localData.suggestedInvestorTypes,
    useOfFunds: localData.suggestedUseOfFunds || [],
    aiSuggestionsAccepted: false,
    customized: true
  });
};

const cancelCustomization = () => {
  showCustomization.value = false;
  // Reset to original suggestions
  generateAISuggestions();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
</script>

<style scoped>
.ai-funding-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.section-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Toggle styling */
.funding-toggle {
  margin-bottom: var(--spacing-lg);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  font-weight: 500;
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

/* AI Analysis */
.ai-analysis {
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.05), rgba(var(--color-blue-500-rgb), 0.05));
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.ai-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border-radius: 50%;
}

.ai-icon svg {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

.ai-header h4 {
  margin: 0;
  color: var(--text-primary);
  flex: 1;
}

.confidence-score {
  background: var(--color-green-100);
  color: var(--color-green-700);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.suggestion-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
}

.suggestion-card.full-width {
  grid-column: 1 / -1;
}

.suggestion-card label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.suggestion-card select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
}

.amount-display {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.investor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.investor-chip {
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: var(--border-radius-md);
  font-size: 0.85rem;
  font-weight: 500;
}

.ai-reasoning {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-style: italic;
}

.ai-reasoning-box {
  background: rgba(var(--color-blue-50-rgb), 0.5);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
}

.ai-reasoning-box h5 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.ai-reasoning-box p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.suggestion-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.btn-outline {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-outline:hover {
  background: var(--primary-color);
  color: white;
}

/* Analyzing state */
.generating-analysis {
  text-align: center;
  padding: var(--spacing-xl);
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.analyze-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .suggestion-actions {
    flex-direction: column;
  }
  
  .ai-header {
    flex-wrap: wrap;
  }
}
/* Customization Form Styles */
.customization-form {
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.form-header {
  margin-bottom: var(--spacing-lg);
}

.form-header h5 {
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.form-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
}

.form-grid {
  display: grid;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: 0.9rem;
}

.form-group select,
.form-group input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-primary-alpha);
}

.amount-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.investor-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
}

.checkbox-item input[type="checkbox"] {
  margin: 0;
  accent-color: var(--accent-primary);
}

.checkbox-label {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.customization-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.customization-actions .btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: 0.9rem;
}

.btn.btn-outline {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.btn.btn-outline:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .amount-inputs {
    grid-template-columns: 1fr;
  }
  
  .investor-checkboxes {
    grid-template-columns: 1fr;
  }
  
  .customization-actions {
    flex-direction: column;
  }
}
</style>
