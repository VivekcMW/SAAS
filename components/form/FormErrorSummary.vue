<!--
  FormErrorSummary Component
  Displays all form errors in a summary at the top or bottom of forms
-->
<template>
  <div 
    v-if="hasVisibleErrors" 
    class="form-error-summary bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
    role="alert"
    aria-labelledby="error-summary-title"
  >
    <!-- Error Summary Title -->
    <div class="flex items-center mb-3">
      <UIcon 
        dynamic 
        name="i-heroicons-exclamation-circle" 
        class="info-icon info-icon-error mr-2"
      />
      <h3 id="error-summary-title" class="text-red-800 dark:text-red-200 font-semibold">
        {{ title }}
      </h3>
    </div>

    <!-- Error List -->
    <div class="space-y-2">
      <!-- Submission Errors -->
      <div v-if="submissionErrors.length > 0" class="space-y-1">
        <p 
          v-for="error in submissionErrors" 
          :key="`submission-${error.message}`"
          class="text-red-700 dark:text-red-300 text-sm"
        >
          {{ error.message }}
        </p>
      </div>

      <!-- Field Validation Errors -->
      <div v-if="showValidationErrors && validationErrors.length > 0" class="space-y-1">
        <p class="text-red-700 dark:text-red-300 text-sm font-medium mb-2">
          Please fix the following issues:
        </p>
        <ul class="error-list error-list-interactive">
          <li 
            v-for="error in validationErrors" 
            :key="`validation-${error.field}-${error.message}`"
            class="error-list-item"
          >
            <button
              v-if="error.field && focusOnClick"
              @click="focusField(error.field)"
              class="hover:underline focus:underline focus:outline-none"
            >
              {{ formatFieldError(error) }}
            </button>
            <span v-else>{{ formatFieldError(error) }}</span>
          </li>
        </ul>
      </div>

      <!-- Network Errors -->
      <div v-if="networkErrors.length > 0" class="space-y-1">
        <p 
          v-for="error in networkErrors" 
          :key="`network-${error.message}`"
          class="text-red-700 dark:text-red-300 text-sm"
        >
          {{ error.message }}
        </p>
        <p class="text-red-600 dark:text-red-400 text-xs mt-2">
          Check your internet connection and try again.
        </p>
      </div>
    </div>

    <!-- Retry Button for Submission Errors -->
    <div v-if="showRetryButton && (submissionErrors.length > 0 || networkErrors.length > 0)" class="mt-4">
      <button
        @click="$emit('retry')"
        class="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
      >
        <svg 
          class="w-4 h-4 mr-1.5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormError } from '~/composables/useFormErrors'

interface Props {
  errors: FormError[]
  title?: string
  showValidationErrors?: boolean
  showRetryButton?: boolean
  focusOnClick?: boolean
}

interface Emits {
  (e: 'retry'): void
  (e: 'focus-field', field: string): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Please correct the following errors:',
  showValidationErrors: true,
  showRetryButton: true,
  focusOnClick: true
})

const emit = defineEmits<Emits>()

// Computed properties
const hasVisibleErrors = computed(() => props.errors.length > 0)

const submissionErrors = computed(() => 
  props.errors.filter(error => error.type === 'submission' || error.type === 'server')
)

const validationErrors = computed(() => 
  props.errors.filter(error => error.type === 'validation')
)

const networkErrors = computed(() => 
  props.errors.filter(error => error.type === 'network')
)

// Methods
const formatFieldError = (error: FormError): string => {
  if (!error.field) return error.message
  
  // Convert field names to user-friendly labels
  const fieldLabels: Record<string, string> = {
    'name': 'App Name',
    'email': 'Email Address',
    'website': 'Website URL',
    'description': 'Description',
    'categories': 'Categories',
    'pricingModels': 'Pricing Models',
    'pricing': 'Pricing',
    'features': 'Features',
    'screenshots': 'Screenshots',
    'logo': 'Logo',
    'password': 'Password',
    'confirmPassword': 'Confirm Password',
    'company': 'Company Name',
    'phone': 'Phone Number'
  }
  
  const fieldLabel = fieldLabels[error.field] || error.field
  return `${fieldLabel}: ${error.message}`
}

const focusField = (field: string) => {
  emit('focus-field', field)
  
  // Also try to focus the field directly
  nextTick(() => {
    const element = document.querySelector(`[name="${field}"], #${field}, [data-field="${field}"]`) as HTMLElement
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}
</script>

<style scoped>
.form-error-summary {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
