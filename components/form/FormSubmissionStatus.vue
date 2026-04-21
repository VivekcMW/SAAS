<!--
  FormSubmissionStatus Component
  Shows loading states and submission feedback
-->
<template>
  <div class="form-submission-status">
    <!-- Loading State -->
    <div 
      v-if="isSubmitting" 
      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-center">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
        <span class="text-blue-800 dark:text-blue-200 font-medium">
          {{ loadingMessage }}
        </span>
      </div>
    </div>

    <!-- Success State -->
    <div 
      v-if="showSuccess && successMessage" 
      class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6"
      role="alert"
      aria-live="polite"
    >
      <div class="flex items-start">
        <UIcon 
          dynamic 
          name="i-heroicons-check-circle" 
          class="info-icon text-green-600 dark:text-green-400 mr-3 mt-0.5"
        />
        <div class="flex-1">
          <h3 class="text-green-800 dark:text-green-200 font-semibold mb-1">
            Success!
          </h3>
          <p class="text-green-700 dark:text-green-300 text-sm">
            {{ successMessage }}
          </p>
          <div v-if="successActions.length > 0" class="mt-3 space-x-3">
            <button
              v-for="action in successActions"
              :key="action.label"
              @click="action.handler"
              :class="action.primary 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-white hover:bg-green-50 text-green-800 border border-green-300'"
              class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Warning State -->
    <div 
      v-if="showWarning && warningMessage" 
      class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6"
      role="alert"
      aria-live="polite"
    >
      <div class="flex items-start">
        <UIcon 
          dynamic 
          name="i-heroicons-exclamation-triangle" 
          class="info-icon info-icon-warning mr-3 mt-0.5"
        />
        <div class="flex-1">
          <h3 class="text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
            Warning
          </h3>
          <p class="text-yellow-700 dark:text-yellow-300 text-sm">
            {{ warningMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SuccessAction {
  label: string
  handler: () => void
  primary?: boolean
}

interface Props {
  isSubmitting: boolean
  loadingMessage?: string
  showSuccess?: boolean
  successMessage?: string
  successActions?: SuccessAction[]
  showWarning?: boolean
  warningMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loadingMessage: 'Processing your request...',
  successActions: () => [],
  showSuccess: false,
  showWarning: false
})
</script>

<style scoped>
.form-submission-status > div {
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
