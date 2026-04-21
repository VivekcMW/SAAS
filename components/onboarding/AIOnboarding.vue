<template>
  <div class="ai-onboarding">
    <!-- Progress Indicator -->
    <div class="progress-container" v-if="!isCompleted">
      <div class="progress-header">
        <button class="back-button" @click="goBack">
          <UIcon dynamic name="i-heroicons-arrow-left" />
          Change Method
        </button>
        <h2>AI-Powered Listing - Let AI Do The Work</h2>
      </div>
      
      <div class="progress-steps">
        <div 
          v-for="(step, index) in aiSteps" 
          :key="index" 
          class="progress-step" 
          :class="{ 
            'active': currentStep === index, 
            'completed': currentStep > index 
          }"
        >
          <div class="step-indicator">
            <template v-if="currentStep > index">
              <UIcon dynamic name="i-heroicons-check" />
            </template>
            <template v-else>
              {{ index + 1 }}
            </template>
          </div>
          <span class="step-label">{{ step.name }}</span>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-filled" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="submissionError" class="error-banner">
      <UIcon dynamic name="i-heroicons-exclamation-triangle" />
      <span>{{ submissionError }}</span>
    </div>

    <!-- AI Analysis Steps -->
    <div class="ai-steps" v-if="!isCompleted">
      
      <!-- Step 1: Website Analysis -->
      <div class="step-container" v-if="currentStep === 0">
        <div class="step-header">
          <h2>Website Analysis</h2>
          <p>Our AI will analyze your website to create a comprehensive listing</p>
        </div>

        <form @submit.prevent="startAnalysis">
          <div class="form-group">
            <label for="website-url">Website URL*</label>
            <div class="url-input-wrapper">
              <input 
                type="url" 
                id="website-url"
                v-model="websiteUrl" 
                required
                placeholder="https://your-website.com"
                @blur="validateField('websiteUrl')"
                :disabled="isAnalyzing"
                :class="{ 'error': fieldErrors.websiteUrl }"
              />
              <button 
                type="submit"
                class="analyze-btn" 
                :disabled="!websiteUrl || isAnalyzing"
              >
                <template v-if="isAnalyzing">
                  <div class="loading-spinner"></div>
                  Analyzing...
                </template>
                <template v-else>
                  <UIcon dynamic name="i-heroicons-sparkles" />
                  Analyze
                </template>
              </button>
            </div>
            <FieldError 
              field="websiteUrl"
              :errors="getFieldErrors('websiteUrl')" 
              field-id="website-url"
            />
            <p class="field-hint">
              Primary website URL is required for AI analysis
            </p>
          </div>

          <div class="form-group">
            <label>Additional Sources (Optional)</label>
            <p class="field-hint">Provide more URLs to help AI create a comprehensive listing</p>
            
            <div class="additional-urls-grid">
              <div class="form-group">
                <label for="linkedin-url">LinkedIn Company Page</label>
                <input 
                  type="url" 
                  id="linkedin-url"
                  v-model="additionalUrls.linkedin" 
                  placeholder="https://linkedin.com/company/yourcompany"
                  :disabled="isAnalyzing"
                />
              </div>

              <div class="form-group">
                <label for="twitter-url">Twitter/X Profile</label>
                <input 
                  type="url" 
                  id="twitter-url"
                  v-model="additionalUrls.twitter" 
                  placeholder="https://twitter.com/yourcompany"
                  :disabled="isAnalyzing"
                />
              </div>

              <div class="form-group">
                <label for="github-url">GitHub Repository</label>
                <input 
                  type="url" 
                  id="github-url"
                  v-model="additionalUrls.github" 
                  placeholder="https://github.com/yourcompany/product"
                  :disabled="isAnalyzing"
                />
              </div>

              <div class="form-group">
                <label for="producthunt-url">Product Hunt</label>
                <input 
                  type="url" 
                  id="producthunt-url"
                  v-model="additionalUrls.productHunt" 
                  placeholder="https://producthunt.com/products/yourproduct"
                  :disabled="isAnalyzing"
                />
              </div>

              <div class="form-group">
                <label for="docs-url">Documentation</label>
                <input 
                  type="url" 
                  id="docs-url"
                  v-model="additionalUrls.documentation" 
                  placeholder="https://docs.yourcompany.com"
                  :disabled="isAnalyzing"
                />
              </div>

              <div class="form-group">
                <label for="appstore-url">App Store/Play Store</label>
                <input 
                  type="url" 
                  id="appstore-url"
                  v-model="additionalUrls.appStore" 
                  placeholder="https://apps.apple.com/app/yourapp"
                  :disabled="isAnalyzing"
                />
              </div>
            </div>

            <div class="benefits-info">
              <div class="benefits-header">
                <UIcon dynamic name="i-heroicons-sparkles" />
                <span>More sources = Better AI analysis</span>
              </div>
              <ul class="benefits-list">
                <li>Enhanced product descriptions</li>
                <li>Better feature extraction</li>
                <li>More accurate categorization</li>
                <li>Social proof and credibility data</li>
              </ul>
            </div>
          </div>

          <!-- Analysis Progress -->
          <div class="analysis-progress" v-if="isAnalyzing">
            <div class="progress-header">
              <UIcon dynamic name="i-heroicons-cpu-chip" />
              <span>AI Analysis in Progress</span>
            </div>
            <div class="analysis-steps">
              <div 
                v-for="(step, index) in analysisSteps" 
                :key="index"
                class="analysis-step"
                :class="{ 'active': currentAnalysisStep >= index, 'completed': currentAnalysisStep > index }"
              >
                <div class="step-indicator">
                  <UIcon v-if="currentAnalysisStep > index" dynamic name="i-heroicons-check" />
                  <div v-else class="step-number">{{ index + 1 }}</div>
                </div>
                <span>{{ step }}</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Step 2: Review AI Results -->
      <div class="step-container" v-if="currentStep === 1 && analysisResults">
        <div class="step-header">
          <h2>Review AI Analysis Results</h2>
          <p>Our AI has analyzed your website. Review and adjust the extracted information</p>
        </div>

        <form @submit.prevent="nextStep">
          <!-- Basic Information -->
          <div class="form-group">
            <label>Basic Information</label>
            <div class="form-row">
              <div class="form-group">
                <label for="ai-product-name">Product Name*</label>
                <input 
                  type="text"
                  id="ai-product-name"
                  v-model="aiFormData.productName" 
                  required
                  placeholder="Your product name"
                />
              </div>
              <div class="form-group">
                <label for="ai-category">Category*</label>
                <select id="ai-category" v-model="aiFormData.category" required>
                  <option value="">Select a category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="ai-description">Description*</label>
              <textarea 
                id="ai-description"
                v-model="aiFormData.description" 
                required
                rows="3"
                placeholder="Describe your product..."
              ></textarea>
            </div>
          </div>

          <!-- Key Features -->
          <div class="form-group">
            <label>Key Features</label>
            <p class="field-hint">Add or edit the key features of your product</p>
            <div class="features-list">
              <div 
                v-for="(feature, index) in aiFormData.features" 
                :key="index"
                class="feature-item"
              >
                <div class="form-group">
                  <label :for="`feature-title-${index}`">Feature Name</label>
                  <input 
                    :id="`feature-title-${index}`"
                    v-model="feature.title" 
                    placeholder="Feature name" 
                  />
                </div>
                <div class="form-group">
                  <label :for="`feature-desc-${index}`">Description</label>
                  <textarea 
                    :id="`feature-desc-${index}`"
                    v-model="feature.description" 
                    placeholder="Feature description"
                    rows="2"
                  ></textarea>
                </div>
                <button 
                  type="button"
                  @click="removeFeature(index)" 
                  class="remove-feature-btn"
                >
                  <UIcon dynamic name="i-heroicons-x-mark" />
                  Remove
                </button>
              </div>
              <button 
                type="button"
                @click="addFeature" 
                class="add-feature-btn"
              >
                <UIcon dynamic name="i-heroicons-plus" />
                Add Feature
              </button>
            </div>
          </div>

          <!-- Pricing Model -->
          <div class="form-group">
            <label>Pricing Model</label>
            <p class="field-hint">Select the pricing models that apply to your product</p>
            <div class="checkbox-grid">
              <label v-for="feature in pricingFeatures" :key="feature.id" class="checkbox-item">
                <input 
                  type="checkbox" 
                  :value="feature.id"
                  v-model="aiFormData.selectedPricingFeatures"
                  :id="feature.id"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">{{ feature.title }}</span>
                  <span class="checkbox-description">{{ feature.description }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- AI Confidence Score -->
          <div class="confidence-section">
            <div class="confidence-header">
              <UIcon dynamic name="i-heroicons-chart-bar" />
              <span>AI Confidence Score: {{ confidenceScore }}%</span>
            </div>
            <div class="confidence-bar">
              <div class="confidence-fill" :style="{ width: confidenceScore + '%' }"></div>
            </div>
            <p class="field-hint">
              Higher scores indicate more accurate information extraction from your website
            </p>
          </div>
        </form>
      </div>

      <!-- Step 3: Contact Information -->
      <div class="step-container" v-if="currentStep === 2">
        <div class="step-header">
          <h2>Contact Information</h2>
          <p>Provide your contact details to complete the listing</p>
        </div>

        <form @submit.prevent="nextStep">
          <div class="form-row">
            <div class="form-group">
              <label for="contact-name">Contact Name*</label>
              <input 
                type="text" 
                id="contact-name"
                v-model="aiFormData.contactName" 
                required
                placeholder="Your full name"
                @blur="validateField('contactName')"
                :class="{ 'error': fieldErrors.contactName }"
              />
              <FieldError 
                field="contactName"
                :errors="getFieldErrors('contactName')" 
                field-id="contact-name"
              />
            </div>
            <div class="form-group">
              <label for="contact-email">Email Address*</label>
              <input 
                type="email" 
                id="contact-email"
                v-model="aiFormData.contactEmail" 
                required
                placeholder="your@email.com"
                @blur="validateField('contactEmail')"
                :class="{ 'error': fieldErrors.contactEmail }"
              />
              <FieldError 
                field="contactEmail"
                :errors="getFieldErrors('contactEmail')" 
                field-id="contact-email"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="company-name">Company Name*</label>
            <input 
              type="text" 
              id="company-name"
              v-model="aiFormData.companyName" 
              required
              placeholder="Your company name"
              @blur="validateField('companyName')"
              :class="{ 'error': fieldErrors.companyName }"
            />
            <FieldError 
              field="companyName"
              :errors="getFieldErrors('companyName')" 
              field-id="company-name"
            />
          </div>
        </form>
      </div>

      <!-- Step 4: AI Funding Analysis -->
      <div class="step-container" v-if="currentStep === 3">
        <div class="step-header">
          <h2>AI Funding Analysis</h2>
          <p>Let AI analyze your funding needs and suggest optimal investment opportunities</p>
        </div>

        <AIFundingQuestions 
          :form-data="aiFundingFormData"
          @update-data="handleFundingUpdate"
        />
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isSubmitting" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>

    <!-- Success Screen -->
    <div class="success-screen" v-if="isCompleted">
      <div class="success-icon">
        <UIcon dynamic name="i-heroicons-check-circle" color="var(--color-success)" />
      </div>
      <h2>AI-Powered Listing Created!</h2>
      <p>Your product listing has been automatically generated and is now live on SaaSWorld marketplace.</p>
      
      <div class="ai-stats">
        <div class="stat-item">
          <UIcon dynamic name="i-heroicons-clock" />
          <span>Created in {{ analysisTime }}s</span>
        </div>
        <div class="stat-item">
          <UIcon dynamic name="i-heroicons-chart-bar" />
          <span>{{ confidenceScore }}% accuracy</span>
        </div>
        <div class="stat-item">
          <UIcon dynamic name="i-heroicons-star" />
          <span>{{ aiFormData.features.length }} features extracted</span>
        </div>
      </div>
      
      <div class="success-actions">
        <NuxtLink :to="`/app/${productSlug}`" class="btn btn-primary">View Your Listing</NuxtLink>
        <button @click="enhanceListing" class="btn btn-outline">Enhance with AI</button>
        <NuxtLink to="/marketplace" class="btn btn-outline">Browse Marketplace</NuxtLink>
      </div>
    </div>

    <!-- Navigation -->
    <div class="navigation" v-if="!isCompleted">
      <button 
        v-if="currentStep > 0" 
        @click="prevStep" 
        class="btn btn-outline"
      >
        <UIcon dynamic name="i-heroicons-arrow-left" />
        Back
      </button>
      
      <button 
        v-if="currentStep < 3" 
        @click="nextStep" 
        class="btn btn-primary"
        :disabled="!canProceed"
      >
        Continue
        <UIcon dynamic name="i-heroicons-arrow-right" />
      </button>
      
      <button 
        v-if="currentStep === 3" 
        @click="submitAIListing" 
        class="btn btn-primary"
        :disabled="!canSubmit || isSubmitting"
      >
        <template v-if="isSubmitting">
          <div class="loading-spinner"></div>
          Creating Listing...
        </template>
        <template v-else>
          Create Listing
          <UIcon dynamic name="i-heroicons-sparkles" />
        </template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useFormErrors, validationRules } from '~/composables/useFormErrors';
import { useSEO } from '~/composables/useSEO';
import AIFundingQuestions from './AIFundingQuestions.vue';
import type { FormValidationSchema } from '~/composables/useFormErrors';

const props = defineProps<{
  onboardingType: string;
}>();

const emit = defineEmits<{
  goBack: []
}>();

// Initialize form error handling
const {
  errors,
  fieldErrors,
  isSubmitting,
  submissionError,
  hasErrors,
  validateField: validateFieldHandler,
  validateForm,
  clearFieldError,
  clearErrors,
  submitForm,
  getFieldErrors,
  hasFieldError
} = useFormErrors();

// Initialize SEO
const { generateListingSEO, applySEO } = useSEO();

// Loading messages
const loadingMessage = ref('Creating your AI-powered listing...');

// State
const currentStep = ref(0);
const websiteUrl = ref('');
const additionalUrls = ref({
  linkedin: '',
  twitter: '',
  github: '',
  productHunt: '',
  documentation: '',
  appStore: ''
});
const isAnalyzing = ref(false);
const isCompleted = ref(false);
const analysisResults = ref<any>(null);
const currentAnalysisStep = ref(0);
const analysisTime = ref(0);
const productSlug = ref('');

// AI Steps for progress indicator
const aiSteps = [
  { name: 'Website Analysis' },
  { name: 'Review Results' },
  { name: 'Contact Info' },
  { name: 'Funding Analysis' }
];

// Analysis steps for UI feedback
const analysisSteps = [
  'Crawling website content',
  'Extracting product information',
  'Analyzing features and benefits', 
  'Determining pricing model',
  'Generating descriptions',
  'Finalizing results'
];

// Form data structure
const aiFormData = reactive({
  productName: '',
  description: '',
  category: '',
  features: [] as Array<{ title: string; description: string }>,
  selectedPricingFeatures: [] as string[],
  contactName: '',
  contactEmail: '',
  companyName: '',
  websiteUrl: '',
  createdViaAI: true,
  aiConfidenceScore: 0,
  fundingPreferences: null as any
});

// Funding form data for AIFundingQuestions component
const aiFundingFormData = reactive({
  productName: '',
  shortDescription: '',
  category: '',
  fundingPreferences: null
});

// Validation schema for AI form
const validationSchema: FormValidationSchema = {
  websiteUrl: [
    validationRules.required('Website URL is required'),
    validationRules.url('Please enter a valid website URL starting with http:// or https://')
  ],
  contactName: [
    validationRules.required('Contact name is required'),
    validationRules.minLength(2, 'Contact name must be at least 2 characters')
  ],
  contactEmail: [
    validationRules.required('Email address is required'),
    validationRules.email('Please enter a valid email address')
  ],
  companyName: [
    validationRules.required('Company name is required'),
    validationRules.minLength(2, 'Company name must be at least 2 characters')
  ]
};

// Field validation wrapper
const validateField = (fieldName: string) => {
  const value = fieldName === 'websiteUrl' ? websiteUrl.value : aiFormData[fieldName as keyof typeof aiFormData];
  validateFieldHandler(fieldName, value, validationSchema[fieldName]);
};

// Options
const categories = [
  'Work & Productivity',
  'Marketing & Sales', 
  'Engineering & Development',
  'Design & Creative',
  'Finance',
  'AI',
  'Health & Fitness',
  'E-commerce',
  'Education & Learning',
  'Social & Community'
];

const pricingFeatures = [
  {
    id: 'free-tier',
    title: 'Free Tier',
    description: 'Basic features available at no cost'
  },
  {
    id: 'freemium',
    title: 'Freemium Model',
    description: 'Free with premium upgrade options'
  },
  {
    id: 'subscription',
    title: 'Subscription Based',
    description: 'Monthly or yearly recurring payments'
  },
  {
    id: 'one-time',
    title: 'One-time Payment',
    description: 'Single purchase for lifetime access'
  },
  {
    id: 'usage-based',
    title: 'Usage Based',
    description: 'Pay per use or consumption'
  },
  {
    id: 'tiered',
    title: 'Tiered Pricing',
    description: 'Multiple plans with different features'
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'Custom pricing for large organizations'
  },
  {
    id: 'contact-sales',
    title: 'Contact for Pricing',
    description: 'Pricing available on request'
  }
];

// Computed
const confidenceScore = computed(() => aiFormData.aiConfidenceScore || 85);

const canProceed = computed(() => {
  if (currentStep.value === 0) return analysisResults.value !== null;
  if (currentStep.value === 1) return aiFormData.productName && aiFormData.description;
  if (currentStep.value === 2) return aiFormData.contactName && aiFormData.contactEmail && aiFormData.companyName;
  return true;
});

const canSubmit = computed(() => {
  return aiFormData.contactName && aiFormData.contactEmail && aiFormData.companyName;
});

// Progress calculation
const progress = computed(() => {
  return ((currentStep.value + 1) / aiSteps.length) * 100;
});

// Methods
const goBack = () => {
  emit('goBack');
};

// Handle funding data updates from AIFundingQuestions
const handleFundingUpdate = (data: any) => {
  // Update the AI form data with funding preferences
  if (data.fundingPreferences) {
    aiFormData.fundingPreferences = data.fundingPreferences;
  }
};

const startAnalysis = async () => {
  if (!websiteUrl.value) return;
  
  isAnalyzing.value = true;
  currentAnalysisStep.value = 0;
  
  try {
    // Collect all URLs for analysis
    const urlsToAnalyze = {
      primary: websiteUrl.value,
      additional: {} as Record<string, string>
    };
    
    // Add additional URLs if provided
    const keys = Object.keys(additionalUrls.value) as Array<keyof typeof additionalUrls.value>;
    keys.forEach(key => {
      if (additionalUrls.value[key].trim()) {
        urlsToAnalyze.additional[key] = additionalUrls.value[key].trim();
      }
    });
    
    // Simulate AI analysis steps (longer if more URLs provided)
    const totalSteps = analysisSteps.length + (Object.keys(urlsToAnalyze.additional).length > 0 ? 1 : 0);
    for (let i = 0; i < analysisSteps.length; i++) {
      currentAnalysisStep.value = i;
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }
    
    // Mock AI analysis result - in real implementation, this would call your AI API
    const mockResult = await mockAIAnalysis(websiteUrl.value, urlsToAnalyze.additional);
    
    analysisResults.value = mockResult;
    Object.assign(aiFormData, mockResult);
    aiFormData.websiteUrl = websiteUrl.value;
    
    analysisTime.value = Math.round(totalSteps * 0.8 + Math.random() * 2);
    
    nextStep();
  } catch (error) {
    console.error('AI Analysis failed:', error);
    alert('Failed to analyze website. Please try again or use manual entry.');
  } finally {
    isAnalyzing.value = false;
  }
};

const mockAIAnalysis = async (url: string, additionalUrls: any = {}) => {
  // This is a mock function - replace with actual AI API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Enhanced confidence score based on additional sources
  const baseConfidence = 85;
  const additionalUrlsCount = Object.keys(additionalUrls).length;
  const bonusConfidence = Math.min(additionalUrlsCount * 2, 10);
  const finalConfidence = baseConfidence + bonusConfidence + Math.floor(Math.random() * 5);
  
  // Enhanced description based on additional sources
  let enhancedDescription = 'A comprehensive analytics platform that helps businesses track user behavior, monitor performance metrics, and make data-driven decisions.';
  
  if (additionalUrls.linkedin) {
    enhancedDescription += ' With a strong professional presence on LinkedIn, this established company serves enterprise clients.';
  }
  
  if (additionalUrls.github) {
    enhancedDescription += ' The platform features open-source components and active developer community support.';
  }
  
  if (additionalUrls.productHunt) {
    enhancedDescription += ' Featured on Product Hunt with positive community feedback and growing user adoption.';
  }
  
  return {
    productName: 'SaaS Analytics Platform',
    description: enhancedDescription,
    category: 'Work & Productivity',
    features: [
      { title: 'Real-time Analytics', description: 'Monitor your metrics in real-time with live dashboards' },
      { title: 'Custom Reports', description: 'Create personalized reports with drag-and-drop functionality' },
      { title: 'Data Visualization', description: 'Beautiful charts and graphs to visualize your data' },
      ...(additionalUrls.github ? [{ title: 'Developer API', description: 'Robust API for custom integrations and extensions' }] : []),
      ...(additionalUrls.appStore ? [{ title: 'Mobile Apps', description: 'Native iOS and Android applications for on-the-go access' }] : [])
    ],
    selectedPricingFeatures: ['freemium', 'tiered'],
    aiConfidenceScore: Math.min(finalConfidence, 98),
    analysisDepth: additionalUrlsCount > 0 ? 'Enhanced' : 'Standard',
    sourcesAnalyzed: {
      primary: url,
      additional: additionalUrls
    }
  };
};

const nextStep = () => {
  if (currentStep.value < 3) {
    // Sync data for funding questions step
    if (currentStep.value === 2) {
      aiFundingFormData.productName = aiFormData.productName;
      aiFundingFormData.shortDescription = aiFormData.description;
      aiFundingFormData.category = aiFormData.category;
    }
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const addFeature = () => {
  aiFormData.features.push({ title: '', description: '' });
};

const removeFeature = (index: number) => {
  aiFormData.features.splice(index, 1);
};

const submitAIListing = async () => {
  // Validate all form fields before submission
  const formDataToValidate = {
    websiteUrl: websiteUrl.value,
    contactName: aiFormData.contactName,
    contactEmail: aiFormData.contactEmail,
    companyName: aiFormData.companyName
  };

  const isValid = validateForm(formDataToValidate, validationSchema);
  
  if (!isValid) {
    // Scroll to first error
    const firstErrorElement = document.querySelector('.error');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  // Update form data with validated websiteUrl
  aiFormData.websiteUrl = websiteUrl.value;

  // Submit with error handling
  await submitForm(
    async () => {
      loadingMessage.value = 'Creating your AI-powered listing...';
      
      const response = await $fetch('/api/ai-listing/submit', {
        method: 'POST',
        body: aiFormData
      });
      
      return response;
    },
    {
      onSuccess: (response: any) => {
        if (response.success) {
          isCompleted.value = true;
          productSlug.value = response.data?.publicUrl?.split('/').pop() || `ai-${Date.now()}`;
        }
      },
      onError: (error: any) => {
        console.error('AI listing submission failed:', error);
        // Error is automatically handled by the composable
      }
    }
  );
};

const enhanceListing = () => {
  // Navigate to complete profile form with AI-generated data
  navigateTo(`/list-product/enhance/${productSlug.value}`);
};

// SEO Management: Update SEO when category changes
watch(() => aiFormData.category, (newCategory) => {
  if (newCategory) {
    const seoConfig = generateListingSEO(newCategory, aiFormData.productName)
    applySEO(seoConfig)
  }
}, { immediate: false })

// SEO Management: Update SEO when product name changes
watch(() => aiFormData.productName, (newProductName) => {
  if (newProductName && aiFormData.category) {
    const seoConfig = generateListingSEO(aiFormData.category, newProductName)
    applySEO(seoConfig)
  }
}, { immediate: false })

// Initialize SEO on mount
onMounted(() => {
  const seoConfig = generateListingSEO()
  applySEO(seoConfig)
});
</script>

<style scoped>
.ai-onboarding {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

.progress-container {
  margin-bottom: var(--spacing-xl);
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.progress-step::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: var(--color-gray-200);
  z-index: -1;
}

.progress-step:last-child::after {
  display: none;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.step-label {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--color-gray-600);
}

.progress-step.active .step-indicator {
  background-color: var(--primary-color);
  color: var(--light-color);
}

.progress-step.active .step-label {
  color: var(--primary-color);
  font-weight: 600;
}

.progress-step.completed .step-indicator {
  background-color: var(--color-success);
  color: var(--light-color);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--color-gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.progress-filled {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: 1px solid var(--color-gray-300);
  color: var(--text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--fs-sm);
}

.back-button:hover {
  background: var(--color-gray-50);
  color: var(--text-primary);
}

/* Step Container Styles */
.step-container {
  background: var(--light-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.step-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.step-header h2 {
  font-size: var(--fs-title);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.step-header p {
  color: var(--text-secondary);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
}

/* Form Styles */
.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: var(--fs-sm);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--fs-base);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: var(--light-color);
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: var(--color-error);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.field-hint {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
  line-height: var(--lh-ui);
}

/* URL Input Wrapper */
.url-input-wrapper {
  display: flex;
  gap: var(--spacing-sm);
  align-items: stretch;
}

.url-input-wrapper input {
  flex: 1;
}

.analyze-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  white-space: nowrap;
}

.analyze-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Additional URLs Grid */
.additional-urls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

/* Benefits Info */
.benefits-info {
  background: var(--bg-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.benefits-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits-list li {
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: var(--fs-sm);
}

.benefits-list li::before {
  content: "✓";
  color: var(--color-success);
  margin-right: var(--spacing-xs);
  font-weight: bold;
}

/* Features List */
.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.feature-item {
  background: var(--bg-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  position: relative;
}

.remove-feature-btn {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: var(--color-error);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--fs-caption);
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.remove-feature-btn:hover {
  background: var(--color-error-dark);
}

.add-feature-btn {
  background: var(--color-success);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.add-feature-btn:hover {
  background: var(--color-success-dark);
}

/* Checkbox Grid */
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
}

.checkbox-item input {
  width: auto;
  margin: 0;
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.checkbox-title {
  font-weight: 600;
  color: var(--text-primary);
}

.checkbox-description {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

/* Confidence Section */
.confidence-section {
  background: var(--bg-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.confidence-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
  font-weight: 600;
}

.confidence-bar {
  width: 100%;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.confidence-fill {
  height: 100%;
  background: var(--color-success);
  transition: width 0.3s ease;
}

/* Analysis Progress */
.analysis-progress {
  background: var(--bg-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.progress-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
  font-weight: 600;
}

.analysis-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.analysis-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.analysis-step.active,
.analysis-step.completed {
  opacity: 1;
}

.analysis-step .step-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-caption);
  transition: all 0.3s ease;
}

.analysis-step.active .step-indicator {
  background: var(--primary-color);
  color: white;
}

.analysis-step.completed .step-indicator {
  background: var(--color-success);
  color: white;
}

.progress-header h2 {
  font-size: var(--fs-title);
  color: var(--primary-color);
  margin: 0;
}

.step-card {
  background: var(--light-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.step-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.step-icon {
  width: 64px;
  height: 64px;
  background: var(--primary-color-light);
  color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-title);
  margin: 0 auto var(--spacing-md);
}

.step-header h3 {
  font-size: var(--fs-title);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.step-header p {
  color: var(--text-secondary);
  font-size: var(--fs-base);
}

.url-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.url-input-wrapper input {
  flex: 1;
  border: 2px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
  font-size: var(--fs-base);
  padding: var(--spacing-md);
  transition: border-color 0.2s ease;
}

.url-input-wrapper input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb, 255, 136, 56), 0.1);
}

.analyze-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  font-size: var(--fs-base);
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 48px;
}

.analyze-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 136, 56, 0.3);
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Additional URLs Section */
.additional-urls {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
}

.additional-urls h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--fs-body-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.additional-urls-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--fs-sm);
}

.url-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.url-grid .form-group {
  margin-bottom: 0;
}

.url-grid label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.url-grid label svg {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.url-grid input {
  width: 100%;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--fs-base);
  transition: border-color 0.2s ease;
}

.url-grid input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb, 255, 136, 56), 0.1);
}

.url-grid input:disabled {
  background: var(--color-gray-100);
  cursor: not-allowed;
}

.urls-benefits {
  background: var(--color-gray-50);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  border-left: 4px solid var(--primary-color);
}

.benefits-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  font-size: var(--fs-sm);
}

.benefits-title svg {
  width: 16px;
  height: 16px;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xs);
}

.benefits-list li {
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  position: relative;
  padding-left: var(--spacing-md);
}

.benefits-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 768px) {
  .url-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .url-input-wrapper {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .analyze-btn {
    width: 100%;
    justify-content: center;
  }
  
  .benefits-list {
    grid-template-columns: 1fr;
  }
  
  .additional-urls {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
  }
}

@media (max-width: 576px) {
  .url-grid label {
    font-size: var(--fs-sm);
  }
  
  .url-grid input {
    font-size: var(--fs-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .additional-urls h4 {
    font-size: var(--fs-base);
  }
  
  .benefits-title {
    font-size: var(--fs-sm);
  }
  
  .benefits-list li {
    font-size: var(--fs-caption);
  }
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.analysis-preview {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-gray);
  border-radius: var(--border-radius-md);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
  font-weight: 600;
}

.analysis-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.analysis-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.analysis-step.active {
  opacity: 1;
  color: var(--primary-color);
}

.analysis-step.completed {
  opacity: 1;
  color: var(--color-success);
}

.step-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-caption);
  transition: all 0.3s ease;
}

.analysis-step.active .step-indicator {
  background: var(--primary-color);
  color: white;
}

.analysis-step.completed .step-indicator {
  background: var(--color-success);
  color: white;
}

.ai-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.result-section {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.result-section h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.result-item.full-width {
  grid-column: 1 / -1;
}

.result-item label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--fs-sm);
}

.result-item input,
.result-item textarea,
.result-item select {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--fs-base);
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.feature-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: var(--spacing-sm);
  align-items: start;
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: var(--color-gray-100);
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.1);
}

.feature-item input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--fs-base);
  font-weight: 500;
  transition: border-color 0.2s ease;
}

.feature-item input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.feature-item textarea {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--fs-sm);
  line-height: var(--lh-ui);
  resize: vertical;
  min-height: 60px;
  transition: border-color 0.2s ease;
}

.feature-item textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.remove-btn {
  background: var(--color-error);
  color: white;
  border: none;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-feature-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  align-self: start;
}

.pricing-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.pricing-feature-checkbox {
  position: relative;
  cursor: pointer;
}

.pricing-feature-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-button {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  transition: all 0.2s ease;
  min-height: 80px;
}

.checkbox-button:hover {
  border-color: var(--primary-color);
  background: var(--color-background-hover);
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.1);
}

.pricing-feature-checkbox input[type="checkbox"]:checked + .checkbox-button {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15);
}

.checkbox-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  transition: all 0.2s ease;
}

.pricing-feature-checkbox input[type="checkbox"]:checked + .checkbox-button .checkbox-icon {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pricing-feature-checkbox input[type="checkbox"]:not(:checked) + .checkbox-button .checkbox-icon svg {
  opacity: 0;
}

.pricing-feature-checkbox input[type="checkbox"]:checked + .checkbox-button .checkbox-icon svg {
  opacity: 1;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.feature-title {
  font-weight: 600;
  color: var(--color-text);
  font-size: var(--fs-base);
  line-height: var(--lh-ui);
}

.feature-description {
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
  line-height: var(--lh-ui);
}

.confidence-indicator {
  background: var(--bg-gray);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
}

.confidence-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.confidence-score {
  font-size: var(--fs-title);
  font-weight: bold;
  color: var(--color-success);
}

.confidence-bar {
  height: 8px;
  background: var(--color-gray-200);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.confidence-fill {
  height: 100%;
  background: var(--color-success);
  transition: width 0.3s ease;
}

.confidence-note {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin: 0;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input {
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--fs-base);
}

.field-hint {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-xl);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: var(--light-color);
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--light-color);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Success Screen */
.success-screen {
  background: var(--light-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xxl);
  text-align: center;
}

.success-icon {
  font-size: var(--fs-hero);
  margin-bottom: var(--spacing-lg);
}

.success-screen h2 {
  font-size: var(--fs-heading);
  color: var(--color-success);
  margin-bottom: var(--spacing-md);
}

.success-screen p {
  font-size: var(--fs-body-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.ai-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin: var(--spacing-xl) 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
}

.stat-item svg {
  color: var(--primary-color);
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .ai-onboarding {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .progress-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .progress-header h2 {
    font-size: var(--fs-title-sm);
  }
  
  .result-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .navigation {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .navigation .btn {
    width: 100%;
  }
  
  .ai-stats {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .success-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .success-actions .btn {
    width: 100%;
    max-width: 300px;
  }
}

/* Error Handling Styles */
.error-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-error-light, #FEE2E2);
  border: 1px solid var(--color-error, #EF4444);
  border-radius: var(--border-radius-md);
  color: var(--color-error-dark, #DC2626);
  margin-bottom: var(--spacing-lg);
}

.form-group input.error,
.form-group textarea.error,
.form-group select.error {
  border-color: var(--color-error, #EF4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-overlay .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

.loading-overlay p {
  color: var(--text-primary);
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
