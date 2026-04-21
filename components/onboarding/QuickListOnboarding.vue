<template>
  <div class="quick-onboarding">
    <!-- Progre        <com        <component 
          :is="currentStepComponent" 
          :key="currentStep"
          :form-data="formData"
          :form-errors="Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, [...v]]))"
          :has-field-error="hasFieldError"
          :get-field-errors="getFieldErrors"
          @update-data="updateFormData"
          @submit-step="nextStep"
          @go-back="prevStep"
          @validate-field="validateFieldHandler"
          @clear-field-error="clearFieldError"
        />     :is="currentStepComponent" 
          :key="currentStep"
          :form-data="formData"
          :form-errors="Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, [...v]]))"
          :has-field-error="hasFieldError"
          :get-field-errors="getFieldErrors"
          @update-data="updateFormData"
          @submit-step="nextStep"
          @go-back="prevStep"
          @validate-field="validateFieldHandler"
          @clear-field-error="clearFieldError"
        />-->
    <div class="progress-container">
      <div class="progress-header">
        <button class="back-button" @click="goBack">
          <UIcon dynamic name="i-heroicons-arrow-left" />
          Change Method
        </button>
        <h2>Quick List - Get Listed in 5 Minutes</h2>
      </div>
      
      <div class="progress-steps">
        <div 
          v-for="(step, index) in quickSteps" 
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

    <!-- Global Error Summary -->
        <!-- Error Summary -->
    <FormErrorSummary 
      :errors="[...errors]"
      :show="hasErrors"
      @retry="retrySubmission"
      @focus-field="focusField"
    />

    <!-- Submission Status -->
    <FormSubmissionStatus
      :is-submitting="formIsSubmitting"
      :show-success="showSuccess"
      :loading-message="loadingMessage"
      :success-message="successMessage"
      :success-actions="successActions"
    />
    
    <!-- Step Content -->
    <div class="step-content">
      <transition name="fade" mode="out-in">
        <component 
          :is="currentStepComponent" 
          :key="currentStep"
          :form-data="formData"
          :form-errors="Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, [...v]]))"
          :has-field-error="hasFieldError"
          :get-field-errors="getFieldErrors"
          @update-data="updateFormData"
          @submit-step="nextStep"
          @go-back="prevStep"
          @validate-field="validateFieldHandler"
          @clear-field-error="clearFieldError"
        />
      </transition>
    </div>

    <!-- Auto-save Indicator -->
    <div class="auto-save-indicator" v-if="autoSaveStatus">
      <UIcon dynamic name="i-heroicons-cloud-arrow-up" />
      <span>{{ autoSaveStatus }}</span>
    </div>

    <!-- Success Screen -->
    <div class="success-screen" v-if="isSubmitted">
      <div class="success-icon">
        <UIcon dynamic name="i-heroicons-check-circle" color="var(--color-success)" />
      </div>
      <h2>Product Listed Successfully!</h2>
      <p>Your product is now live on SaaSWorld marketplace. You can enhance your listing anytime by adding more details.</p>
      
      <div class="submission-details">
        <div class="submission-id">
          <strong>Listing ID:</strong> {{ submissionId }}
        </div>
        <p class="submission-note">Your product is immediately searchable and discoverable.</p>
      </div>
      
      <div class="success-actions">
        <NuxtLink :to="`/app/${productSlug}`" class="btn btn-primary">View Your Listing</NuxtLink>
        <button @click="enhanceListing" class="btn btn-outline">Enhance Listing</button>
        <NuxtLink to="/marketplace" class="btn btn-outline">Browse Marketplace</NuxtLink>
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
            <span class="step-number">Step {{ currentStep + 1 }} of {{ quickSteps.length }}</span>
            <span class="step-name">{{ quickSteps[currentStep].name }}</span>
          </div>
          <button 
            v-if="currentStep < quickSteps.length - 1" 
            class="btn btn-primary" 
            @click="validateAndProceed"
            type="button"
          >
            Continue
            <UIcon dynamic name="i-heroicons-arrow-right" />
          </button>
          <button 
            v-else 
            class="btn btn-primary" 
            @click="submitForm"
            type="button"
            :disabled="formIsSubmitting"
          >
            <template v-if="formIsSubmitting">
              Publishing...
            </template>
            <template v-else>
              Publish Now
              <UIcon dynamic name="i-heroicons-rocket-launch" />
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineAsyncComponent, onMounted } from 'vue';
import { useFormErrors, validationRules, type FormValidationSchema } from '~/composables/useFormErrors';

// Import quick step components
const QuickBasicInfoStep = defineAsyncComponent(() => import('./steps/QuickBasicInfoStep.vue'));
const QuickMediaStep = defineAsyncComponent(() => import('./steps/QuickMediaStep.vue'));
const QuickContactStep = defineAsyncComponent(() => import('./steps/QuickContactStep.vue'));
const QuickFundingStep = defineAsyncComponent(() => import('./steps/QuickFundingStep.vue'));

const props = defineProps<{
  onboardingType: string;
}>();

const emit = defineEmits<{
  goBack: []
}>();

// Define quick steps (only 3 steps)
const quickSteps = [
  { name: 'Product Info', component: QuickBasicInfoStep },
  { name: 'Media Assets', component: QuickMediaStep },
  { name: 'Contact Details', component: QuickContactStep },
  { name: 'Funding Interest', component: QuickFundingStep }
];

// Error handling
const {
  errors,
  fieldErrors,
  isSubmitting: formIsSubmitting,
  submissionError,
  hasErrors,
  validationErrors,
  submissionErrors,
  clearErrors,
  clearFieldError,
  addError,
  setSubmissionError,
  validateField,
  validateForm,
  handleApiError,
  submitForm: submitFormWithErrorHandling,
  getFieldErrors,
  hasFieldError
} = useFormErrors();

// Form state
const currentStep = ref(0);
const isSubmitted = ref(false);
const submissionId = ref('');
const productSlug = ref('');
const autoSaveStatus = ref('');

// Additional state for error handling UI
const loadingMessage = ref('Publishing your listing...');
const showSuccess = ref(false);
const successMessage = ref('');
const successActions = ref([
  {
    label: 'View Listing',
    handler: () => navigateTo(`/marketplace/app/${productSlug.value}`),
    primary: true
  },
  {
    label: 'Enhance Listing',
    handler: () => enhanceListing()
  }
]);

// Progress calculation
const progress = computed(() => {
  return (currentStep.value / (quickSteps.length - 1)) * 100;
});

// Current component to display
const currentStepComponent = computed(() => {
  return quickSteps[currentStep.value].component;
});

// Form validation schema
const validationSchema: FormValidationSchema = {
  productName: [
    validationRules.required('Product name is required'),
    validationRules.minLength(2, 'Product name must be at least 2 characters'),
    validationRules.maxLength(100, 'Product name must be less than 100 characters')
  ],
  productWebsite: [
    validationRules.required('Product website is required'),
    validationRules.url('Please enter a valid website URL')
  ],
  shortDescription: [
    validationRules.required('Short description is required'),
    validationRules.minLength(20, 'Description must be at least 20 characters'),
    validationRules.maxLength(500, 'Description must be less than 500 characters')
  ],
  categories: [
    validationRules.required('Please select at least one category'),
    validationRules.minSelection(1, 'Please select at least one category'),
    validationRules.maxSelection(3, 'Please select no more than 3 categories')
  ],
  pricingModels: [
    validationRules.required('Please select at least one pricing model'),
    validationRules.minSelection(1, 'Please select at least one pricing model'),
    validationRules.maxSelection(3, 'Please select no more than 3 pricing models')
  ],
  companyName: [
    validationRules.required('Company name is required'),
    validationRules.minLength(2, 'Company name must be at least 2 characters')
  ],
  contactEmail: [
    validationRules.required('Contact email is required'),
    validationRules.email('Please enter a valid email address')
  ]
};

// Simplified form data for quick listing
const formData = reactive({
  // Step 1: Basic Info
  productName: '',
  productWebsite: '',
  shortDescription: '',
  categories: [] as string[], // Changed from single category to array
  pricingModels: [] as string[], // Changed from basicPricing to array
  
  // Step 2: Media
  logo: null as File | null,
  screenshot: null as File | null,
  
  // Step 3: Contact
  companyName: '',
  contactEmail: '',
  contactName: '',
  
  // Auto-generated/defaults
  listingType: 'quick',
  status: 'active',
  featured: false,
  createdAt: new Date().toISOString()
});

// Auto-save functionality
let autoSaveTimer: NodeJS.Timeout | null = null;

const autoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  
  autoSaveTimer = setTimeout(() => {
    const draftKey = `quick-listing-draft-${Date.now()}`;
    localStorage.setItem(draftKey, JSON.stringify(formData));
    autoSaveStatus.value = 'Draft saved';
    
    setTimeout(() => {
      autoSaveStatus.value = '';
    }, 2000);
  }, 2000);
};

// Step navigation methods
const nextStep = () => {
  if (currentStep.value < quickSteps.length - 1) {
    currentStep.value++;
    clearErrors(); // Clear errors when moving to next step
    autoSave();
    window.scrollTo(0, 0);
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    clearErrors(); // Clear errors when going back
    window.scrollTo(0, 0);
  }
};

const goBack = () => {
  emit('goBack');
};

// Form data handling
const updateFormData = (data: any) => {
  Object.assign(formData, data);
  autoSave();
};

// Error handling methods
const retrySubmission = () => {
  submitForm();
};

const focusField = (field: string) => {
  nextTick(() => {
    const element = document.querySelector(`[name="${field}"], #${field}, [data-field="${field}"]`) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};

const validateFieldHandler = (field: string, value: any) => {
  const rules = validationSchema[field];
  if (rules) {
    const fieldErrors = validateField(field, value, rules);
    if (fieldErrors.length > 0) {
      clearFieldError(field);
      fieldErrors.forEach(message => {
        addError({ field, message, type: 'validation' });
      });
    } else {
      clearFieldError(field);
    }
  }
};

// Validation with enhanced error handling
const validateAndProceed = () => {
  clearErrors();
  
  // Get current step fields for validation
  const currentStepFields = getCurrentStepFields();
  const currentStepSchema: FormValidationSchema = {};
  
  // Build schema for current step only
  currentStepFields.forEach(field => {
    if (validationSchema[field]) {
      currentStepSchema[field] = validationSchema[field];
    }
  });
  
  // Validate current step
  const isValid = validateForm(formData, currentStepSchema);
  
  if (isValid) {
    nextStep();
  } else {
    // Focus first error field
    const firstErrorField = Object.keys(fieldErrors.value)[0];
    if (firstErrorField) {
      focusField(firstErrorField);
    }
  }
};

// Get fields for current step
const getCurrentStepFields = (): string[] => {
  switch (currentStep.value) {
    case 0: // Basic Info
      return ['productName', 'productWebsite', 'shortDescription', 'categories', 'pricingModels'];
    case 1: // Media
      return ['logo', 'screenshot'];
    case 2: // Contact
      return ['companyName', 'contactEmail', 'contactName'];
    default:
      return [];
  }
};

// Form submission with enhanced error handling
const submitForm = async () => {
  // First validate the entire form
  const isValid = validateForm(formData, validationSchema);
  
  if (!isValid) {
    // Focus first error field
    const firstErrorField = Object.keys(fieldErrors.value)[0];
    if (firstErrorField) {
      focusField(firstErrorField);
    }
    return;
  }

  // Submit with error handling
  await submitFormWithErrorHandling(
    async () => {
      loadingMessage.value = 'Submitting your listing...';
      
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'logo' && key !== 'screenshot') {
          const value = formData[key as keyof typeof formData];
          if (Array.isArray(value)) {
            submitData.append(key, JSON.stringify(value));
          } else {
            submitData.append(key, value as string);
          }
        }
      });
      
      // Add files
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }
      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot);
      }
      
      // Submit to API
      const response = await $fetch('/api/quick-listing/submit', {
        method: 'POST',
        body: submitData
      });
      
      return response;
    },
    {
      onSuccess: (response) => {
        if (response.success) {
          isSubmitted.value = true;
          submissionId.value = response.data?.listingId || `quick-${Date.now()}`;
          productSlug.value = response.data?.slug || formData.productName.toLowerCase().replace(/\s+/g, '-');
          
          showSuccess.value = true;
          successMessage.value = response.message || 'Your product has been submitted to SaaSWorld for review!';
          
          // Clear form data
          Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key as keyof typeof formData])) {
              (formData[key as keyof typeof formData] as any[]) = [];
            } else {
              (formData as any)[key] = '';
            }
          });
        }
      },
      onError: (error) => {
        console.error('Submission failed:', error);
        // Error is automatically handled by the composable
      }
    }
  );
};
const enhanceListing = () => {
  // Navigate to complete profile form with pre-filled data
  navigateTo(`/list-product/enhance/${submissionId.value}`);
};

// Load draft if available
onMounted(() => {
  const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('quick-listing-draft'));
  if (draftKeys.length > 0) {
    const latestDraft = draftKeys.sort().pop();
    if (latestDraft) {
      try {
        const draftData = JSON.parse(localStorage.getItem(latestDraft) || '{}');
        Object.assign(formData, draftData);
        autoSaveStatus.value = 'Draft restored';
        setTimeout(() => {
          autoSaveStatus.value = '';
        }, 3000);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }
});
</script>

<style scoped>
.quick-onboarding {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  padding-bottom: 120px;
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

.progress-header h2 {
  font-size: var(--fs-title);
  color: var(--primary-color);
  margin: 0;
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
  transition: all 0.2s ease;
}

.step-label {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--color-gray-600);
  text-align: center;
}

.progress-step.active .step-indicator {
  background-color: var(--color-success);
  color: var(--light-color);
}

.progress-step.active .step-label {
  color: var(--color-success);
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
  background-color: var(--color-success);
  transition: width 0.3s ease;
}

.step-content {
  background-color: var(--light-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
  min-height: 400px;
}

.auto-save-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--color-success);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--fs-sm);
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Sticky Navigation */
.sticky-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--color-gray-200);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.sticky-nav-container {
  max-width: 800px;
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
}

.step-number {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.step-name {
  font-size: var(--fs-base);
  color: var(--color-success);
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
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.btn-outline:hover {
  background-color: var(--color-success);
  color: var(--light-color);
}

.btn-primary {
  background-color: var(--color-success);
  color: var(--light-color);
}

.btn-primary:hover {
  background-color: var(--color-success-dark);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  font-size: var(--fs-hero);
}

.success-screen h2 {
  font-size: var(--fs-heading);
  margin-bottom: var(--spacing-md);
  color: var(--color-success);
}

.success-screen p {
  font-size: var(--fs-body-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.submission-details {
  background-color: var(--color-gray-50);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}

.submission-id {
  font-size: var(--fs-body-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.submission-note {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin: 0;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  flex-wrap: wrap;
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
  .quick-onboarding {
    padding-bottom: 140px;
  }
  
  .progress-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .progress-header h2 {
    font-size: var(--fs-title-sm);
  }
  
  .step-navigation {
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) 0;
    min-height: 120px;
  }
  
  .current-step-info {
    order: -1;
    margin-bottom: var(--spacing-sm);
  }
  
  .step-navigation .btn {
    width: 100%;
    max-width: 200px;
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

@media (max-width: 576px) {
  .quick-onboarding {
    padding: var(--spacing-lg) var(--spacing-sm);
    padding-bottom: 140px;
  }
  
  .step-label {
    font-size: var(--fs-caption);
  }
  
  .auto-save-indicator {
    right: 10px;
    top: 10px;
    font-size: var(--fs-caption);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>
