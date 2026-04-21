<template>
  <div class="product-onboarding">
    <!-- Progress Indicator -->
    <div class="progress-container">
      <div class="progress-steps">
        <div 
          v-for="(step, index) in steps" 
          :key="index" 
          class="progress-step" 
          :class="{ 
            'active': currentStep === index, 
            'completed': currentStep > index 
          }"
          @click="goToStep(index)"
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
    
    <!-- Step Content -->
    <div class="step-content">
      <transition name="fade" mode="out-in">
        <component 
          :is="currentStepComponent" 
          :key="currentStep"
          :form-data="formData"
          @update-data="updateFormData"
          @submit-step="nextStep"
          @go-back="prevStep"
        ></component>
      </transition>
    </div>

    <!-- Success Screen -->
    <div class="success-screen" v-if="isSubmitted">
      <div class="success-icon">
        <UIcon dynamic name="i-heroicons-check-circle" color="var(--color-success)" />
      </div>
      <h2>Application Submitted Successfully!</h2>
      <p v-if="submissionMessage">{{ submissionMessage }}</p>
      <p v-else>Thank you for registering your product with SaaSWorld. Your application has been received and is being reviewed by our team.</p>
      
      <div v-if="submissionId" class="submission-details">
        <div class="submission-id">
          <strong>Submission ID:</strong> {{ submissionId }}
        </div>
        <p class="submission-note">Please save this ID for your records.</p>
      </div>
      
      <div v-if="submissionNextSteps.length > 0" class="next-steps">
        <h3>What happens next?</h3>
        <ul>
          <li v-for="step in submissionNextSteps" :key="step">{{ step }}</li>
        </ul>
      </div>
      
      <p>We'll send you a confirmation email to <strong>{{ formData.contactEmail }}</strong> with updates.</p>
      
      <div class="success-actions">
        <NuxtLink to="/dashboard" class="btn btn-primary">Go to Dashboard</NuxtLink>
        <NuxtLink to="/marketplace" class="btn btn-outline">Browse Marketplace</NuxtLink>
      </div>
    </div>
  </div>

  <!-- Sticky Step Navigation -->
  <div class="sticky-navigation" v-if="!isSubmitted">
    <div class="sticky-nav-container">
      <div class="step-navigation">
        <button 
          v-if="currentStep > 0" 
          class="btn btn-outline" 
          @click="prevStep"
          type="button"
        >
          <UIcon dynamic name="i-heroicons-arrow-left" />
          Back
        </button>
        <div class="current-step-info">
          <span class="step-number">Step {{ currentStep + 1 }} of {{ steps.length }}</span>
          <span class="step-name">{{ steps[currentStep].name }}</span>
        </div>
        <button 
          v-if="currentStep < steps.length - 1" 
          class="btn btn-primary" 
          @click="validateAndProceed"
          type="button"
        >
          Next
          <UIcon dynamic name="i-heroicons-arrow-right" />
        </button>
        <button 
          v-else 
          class="btn btn-primary" 
          @click="submitForm"
          type="button"
          :disabled="isSubmitting"
        >
          <template v-if="isSubmitting">
            Submitting...
          </template>
          <template v-else>
            Complete Registration
            <UIcon dynamic name="i-heroicons-check" />
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineAsyncComponent } from 'vue';

// Import step components
const BasicInfoStep = defineAsyncComponent(() => import('./steps/BasicInfoStep.vue'));
const CompanyInfoStep = defineAsyncComponent(() => import('./steps/CompanyInfoStep.vue'));
const ProductDetailsStep = defineAsyncComponent(() => import('./steps/ProductDetailsStep.vue'));
const MediaAssetsStep = defineAsyncComponent(() => import('./steps/MediaAssetsStep.vue'));
const FundingPreferencesStep = defineAsyncComponent(() => import('./steps/FundingPreferencesStep.vue'));
const TestimonialsStep = defineAsyncComponent(() => import('./steps/TestimonialsStep.vue'));
const ReviewSubmitStep = defineAsyncComponent(() => import('./steps/ReviewSubmitStep.vue'));

// Define steps
const steps = [
  { name: 'Basic Info', component: BasicInfoStep },
  { name: 'Company, Contact & Creator Info', component: CompanyInfoStep },
  { name: 'Product Details', component: ProductDetailsStep },
  { name: 'Media Assets', component: MediaAssetsStep },
  { name: 'Funding & Investment', component: FundingPreferencesStep },
  { name: 'Testimonials', component: TestimonialsStep },
  { name: 'Review & Submit', component: ReviewSubmitStep }
];

// Form state
const currentStep = ref(0);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const submissionId = ref('');
const submissionMessage = ref('');
const submissionNextSteps = ref<string[]>([]);
interface StepValidation {
  [key: number]: boolean;
}
const stepValidation = ref<StepValidation>({
  0: false, // Basic Info
  1: false, // Company, Contact & Creator Info
  2: false, // Product Details
  3: false, // Media Assets
  4: true,  // Funding & Investment (optional)
  5: false, // Testimonials
  6: true   // Review & Submit (always valid)
});

// Progress calculation
const progress = computed(() => {
  return (currentStep.value / (steps.length - 1)) * 100;
});

// Current component to display
const currentStepComponent = computed(() => {
  return steps[currentStep.value].component;
});  // Form data object
const formData = reactive({
  // Basic Info
  productName: '',
  productWebsite: '',
  shortDescription: '',
  category: [], // Changed from string to array for multiple categories
  searchKeywords: '',
  
  // Company Info
  companyName: '',
  companyWebsite: '',
  companySize: '',
  companyLocation: '',
  founded: '',
  industries: [], // Changed from single industry to array of industries
  
  // Social Links
  socialLinks: {
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    github: ''
  },
  
  // Product Details
  fullDescription: '',
  features: [{ title: '', description: '' }],
  pricingModels: [], // Changed from single pricingModel to array of models
  pricingDetails: '',
  targetAudience: '',
  
  // Platform Support & Application Stage
  platformSupport: [],
  applicationStage: '',
  stageDetails: {
    // Idea stage
    ideaValidation: '',
    expectedLaunch: '',
    
    // MVP stage
    mvpFeatures: '',
    userTesting: '',
    
    // Beta stage
    betaUsers: '',
    feedbackMethods: [],
    
    // Live stage
    activeUsers: '',
    revenueGeneration: '',
    
    // Mature stage
    marketPosition: '',
    expansionPlans: []
  },
  
  // App-specific Details (Missing fields from app landing page)
  appVersion: '1.0.0',
  lastUpdated: '',
  supportedLanguages: [], // Array of languages the app supports
  systemRequirements: {
    minimumOS: '',
    recommendedOS: '',
    storage: '',
    memory: '',
    processor: '',
    browser: []
  },
  
  // Integration & Compatibility
  integrations: [], // Third-party services the app integrates with
  apiAvailable: false,
  webhookSupport: false,
  
  // App Store & Distribution
  appStoreLinks: {
    ios: '',
    android: '',
    web: '',
    desktop: '',
    chrome: '',
    firefox: ''
  },
  
  // Status & Features
  featured: false,
  trending: false,
  verified: false,
  businessModel: '', // freemium, subscription, one-time, etc.
  
  // Analytics & Performance (Optional - for mature products)
  userMetrics: {
    totalUsers: '',
    activeUsers: '',
    monthlyActiveUsers: '',
    retention: ''
  },
  
  // Support & Documentation
  supportChannels: [], // email, chat, phone, community
  documentationLink: '',
  helpCenterLink: '',
  communityForumLink: '',
  statusPageLink: '',
  
  // Security & Compliance
  securityFeatures: [], // 2FA, SSO, encryption, etc.
  complianceStandards: [], // GDPR, SOC2, HIPAA, etc.
  dataResidency: '', // Where data is stored
  
  // What's Included (Specific features for different pricing tiers)
  includedFeatures: [], // Features included in the base plan
  pricingFeatures: [], // Features highlighted in pricing section
  
  // Media Assets
  logo: null,
  screenshots: [],
  videos: [],
  
  // Testimonials
  testimonials: [
    { author: '', company: '', role: '', content: '' }
  ],
  
  // Contact Info
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactRole: '',
  preferredContact: '',
  marketingConsent: false,
  
  // Creator/Team Info
  founderName: '',
  founderTitle: '',
  founderBio: '',
  founderProfilePicture: '',
  founderSocial: {
    linkedin: '',
    twitter: '',
    github: '',
    instagram: '',
    website: '',
    blog: ''
  },
  teamSize: '',
  whyCreated: '',
  teamMembers: [{ 
    name: '', 
    role: '', 
    bio: '',
    profilePicture: '',
    social: {
      linkedin: '',
      twitter: '',
      github: '',
      instagram: '',
      website: '',
      blog: ''
    }
  }],
});

// Step navigation methods
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
    window.scrollTo(0, 0);
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    window.scrollTo(0, 0);
  }
};

const goToStep = (stepIndex: number) => {
  // Only allow going to steps that are complete or the next available step
  if (stepIndex <= currentStep.value + 1 && stepIndex >= 0 && stepIndex < steps.length) {
    currentStep.value = stepIndex;
    window.scrollTo(0, 0);
  }
};

// Form data handling
const updateFormData = (data: any) => {
  // Update the form data with the changes from the step component
  Object.assign(formData, data);
};

// Validation and submission
const validateAndProceed = () => {
  // Call the validation function for the current step
  const stepRef = steps[currentStep.value].component;
  const isValid = true; // In a real application, you would get this from the step component
  
  if (isValid) {
    stepValidation.value[currentStep.value] = true;
    nextStep();
  }
};

const submitForm = async () => {
  try {
    isSubmitting.value = true;
    
    // Submit the form data to the backend API
    console.log('Submitting form data:', formData);
    
    const response = await $fetch('/api/onboarding/submit', {
      method: 'POST',
      body: {
        formData
      }
    });
    
    console.log('API Response:', response);
    
    if (response.success) {
      // Show success state with submission details
      isSubmitted.value = true;
      submissionId.value = response.data.submissionId;
      submissionMessage.value = response.data.message;
      submissionNextSteps.value = response.data.nextSteps;
      window.scrollTo(0, 0);
      
      console.log('Form submitted successfully:', response.data);
    } else {
      throw new Error('Submission failed');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    let errorMessage = 'There was an error submitting your application. Please try again.';
    
    // Handle specific error messages from the API
    if (error && typeof error === 'object') {
      if ('data' in error && error.data) {
        const errorData = error.data as any;
        if (errorData.statusMessage) {
          errorMessage = errorData.statusMessage;
        }
      } else if ('message' in error && error.message) {
        errorMessage = error.message;
      }
    }
    
    alert(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.product-onboarding {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  padding-bottom: 120px; /* Add space for sticky navigation */
}

.progress-container {
  margin-bottom: var(--spacing-xl);
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
  cursor: pointer;
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
  font-size: 0.875rem;
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

.step-content {
  background-color: var(--light-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
  min-height: 400px;
}

/* Sticky Navigation */
.sticky-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--light-color);
  border-top: 1px solid var(--color-gray-200);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  transform: translateY(0);
  animation: slideUpNav 0.3s ease-out;
}

@keyframes slideUpNav {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sticky-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  min-height: 80px;
}

.current-step-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
}

.step-number {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.step-name {
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 600;
  margin-top: 2px;
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

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.sticky-navigation .btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.sticky-navigation .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Success Screen */
.success-screen {
  background-color: var(--light-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xxl);
  text-align: center;
  margin: var(--spacing-xl) 0;
}

.success-icon {
  margin-bottom: var(--spacing-lg);
}

.success-screen h2 {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
}

.success-screen p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.submission-details {
  background-color: var(--color-gray-50);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}

.submission-id {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.submission-note {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.next-steps {
  text-align: left;
  background-color: var(--color-gray-50);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}

.next-steps h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.next-steps ul {
  margin: 0;
  padding-left: var(--spacing-lg);
}

.next-steps li {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .product-onboarding {
    padding-bottom: 140px; /* More space for mobile sticky nav */
  }
  
  .step-navigation {
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) 0;
    min-height: 120px;
  }
  
  .current-step-info {
    order: -1; /* Move step info to top on mobile */
    margin-bottom: var(--spacing-sm);
  }
  
  .step-navigation .btn {
    width: 100%;
    max-width: 200px;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
  
  .success-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .success-actions .btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .product-onboarding {
    padding: var(--spacing-lg) var(--spacing-sm);
    padding-bottom: 140px;
  }
  
  .sticky-nav-container {
    padding: 0 var(--spacing-sm);
  }
  
  .step-label {
    display: none;
  }
  
  .step-navigation .btn {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.875rem;
  }
  
  .current-step-info {
    gap: 1px;
  }
  
  .step-number {
    font-size: 0.75rem;
  }
  
  .step-name {
    font-size: 0.875rem;
  }
}
</style>
