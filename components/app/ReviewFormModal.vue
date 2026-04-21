<!--
  ReviewFormModal Component
  Modal for submitting new reviews
-->
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black bg-opacity-50"
      @click="emit('close')"
    ></div>
    
    <!-- Modal -->
    <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Write a Review
        </h3>
        <button 
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitReview" class="p-6">
        <!-- User Name -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Name *
          </label>
          <input 
            v-model="formData.userName"
            type="text"
            required
            class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
          />
        </div>

        <!-- Email (Optional) -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email (Optional)
          </label>
          <input 
            v-model="formData.userEmail"
            type="email"
            class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Used for verification and to contact you about your review
          </p>
        </div>

        <!-- Rating -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Rating *
          </label>
          <div class="flex items-center gap-4">
            <StarRating 
              :rating="formData.rating"
              size="lg"
              interactive
              @rate="formData.rating = $event"
            />
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ formData.rating > 0 ? `${formData.rating}/5` : 'Select rating' }}
            </span>
          </div>
          <div v-if="ratingError" class="text-red-500 text-sm mt-1">
            Please select a rating
          </div>
        </div>

        <!-- Review Title -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Review Title *
          </label>
          <input 
            v-model="formData.title"
            type="text"
            required
            maxlength="100"
            class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Summarize your experience"
          />
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {{ formData.title.length }}/100
          </div>
        </div>

        <!-- Review Content -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Review *
          </label>
          <textarea 
            v-model="formData.content"
            required
            rows="6"
            maxlength="1000"
            class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your experience with this application..."
          ></textarea>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {{ formData.content.length }}/1000
          </div>
        </div>

        <!-- Platform & Version (Optional) -->
        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform Used
            </label>
            <select 
              v-model="formData.platform"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select platform</option>
              <option value="web">Web</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="windows">Windows</option>
              <option value="mac">Mac</option>
              <option value="linux">Linux</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Version Used
            </label>
            <input 
              v-model="formData.version"
              type="text"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2.1.0"
            />
          </div>
        </div>

        <!-- Review Guidelines -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-blue-900 dark:text-blue-300 mb-2">
            Review Guidelines
          </h4>
          <ul class="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Be honest and constructive in your feedback</li>
            <li>• Focus on your experience with the application</li>
            <li>• Avoid personal attacks or inappropriate language</li>
            <li>• Reviews are moderated and may take time to appear</li>
          </ul>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3">
          <button 
            type="button"
            @click="emit('close')"
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            :disabled="!isFormValid || submitting"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReviewFormData } from '~/types/enhanced-app'

interface Props {
  appId: string
}

interface Emits {
  (e: 'close'): void
  (e: 'submitted'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form data
const formData = reactive<ReviewFormData & { userName: string; userEmail?: string }>({
  rating: 0,
  title: '',
  content: '',
  platform: '',
  version: '',
  userName: '',
  userEmail: ''
})

// Form state
const submitting = ref(false)
const ratingError = ref(false)

// Computed properties
const isFormValid = computed(() => {
  return formData.rating > 0 && 
         formData.title.trim() && 
         formData.content.trim() && 
         formData.userName.trim()
})

// Methods
const submitReview = async () => {
  // Validate rating
  if (formData.rating === 0) {
    ratingError.value = true
    return
  }
  
  ratingError.value = false
  submitting.value = true

  try {
    await $fetch(`/api/apps/${props.appId}/reviews`, {
      method: 'POST',
      body: {
        rating: formData.rating,
        title: formData.title.trim(),
        content: formData.content.trim(),
        platform: formData.platform || undefined,
        version: formData.version || undefined,
        userName: formData.userName.trim(),
        userEmail: formData.userEmail?.trim() || undefined
      }
    })

    // Success notification could be added here
    emit('submitted')
  } catch (error) {
    console.error('Failed to submit review:', error)
    // Error notification could be added here
  } finally {
    submitting.value = false
  }
}

// Watch rating to clear error
watch(() => formData.rating, (newRating) => {
  if (newRating > 0) {
    ratingError.value = false
  }
})

// Prevent background scroll when modal is open
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
