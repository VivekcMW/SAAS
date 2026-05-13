<!--
  ReviewFormModal Component
  Modal for submitting new reviews — uses Moonmart BaseModal, BaseInput, BaseTextarea, BaseSelect, BaseButton
-->
<template>
  <BaseModal :model-value="true" title="Write a Review" size="lg" @close="emit('close')" @update:model-value="emit('close')">
    <form class="rfm-form" @submit.prevent="submitReview">

      <BaseInput
        v-model="formData.userName"
        label="Your Name"
        placeholder="Enter your name"
        required
      />

      <BaseInput
        v-model="formData.userEmail"
        type="email"
        label="Email (Optional)"
        placeholder="your@email.com"
        hint="Used for verification and to contact you about your review"
      />

      <!-- Rating -->
      <div class="rfm-field">
        <span class="rfm-label">Rating <span class="rfm-required">*</span></span>
        <div class="rfm-rating-row">
          <BaseRating v-model="formData.rating" size="lg" />
          <span class="rfm-rating-val">{{ formData.rating > 0 ? `${formData.rating}/5` : 'Select rating' }}</span>
        </div>
        <p v-if="ratingError" class="rfm-error">Please select a rating</p>
      </div>

      <BaseInput
        v-model="formData.title"
        label="Review Title"
        placeholder="Summarize your experience"
        required
        :maxlength="100"
      />

      <BaseTextarea
        v-model="formData.content"
        label="Your Review"
        placeholder="Share your experience with this application..."
        required
        :rows="6"
        :maxlength="1000"
      />

      <div class="rfm-grid">
        <BaseSelect
          v-model="formData.platform"
          label="Platform Used"
          :options="platformOptions"
          placeholder="Select platform"
        />
        <BaseInput
          v-model="formData.version"
          label="Version Used"
          placeholder="e.g., 2.1.0"
        />
      </div>

      <!-- Guidelines -->
      <div class="rfm-notice">
        <p class="rfm-notice-title">Review Guidelines</p>
        <ul class="rfm-notice-list">
          <li>Be honest and constructive in your feedback</li>
          <li>Focus on your experience with the application</li>
          <li>Avoid personal attacks or inappropriate language</li>
          <li>Reviews are moderated and may take time to appear</li>
        </ul>
      </div>

      <div class="rfm-actions">
        <BaseButton variant="ghost" type="button" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="!isFormValid || submitting" :loading="submitting">
          {{ submitting ? 'Submitting…' : 'Submit Review' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import type { ReviewFormData } from '~/types/enhanced-app'

interface Props {
  appId: string
}

interface Emits {
  (e: 'close' | 'submitted'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const platformOptions = [
  { label: 'Web', value: 'web' },
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' },
  { label: 'Windows', value: 'windows' },
  { label: 'Mac', value: 'mac' },
  { label: 'Linux', value: 'linux' },
]

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
  } catch (_error) {
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
</script>

<style scoped>
.rfm-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  padding: var(--sp-6);
}
.rfm-field { display: flex; flex-direction: column; gap: var(--sp-2); }
.rfm-label {
  font-size: var(--t-sm);
  font-weight: 500;
  color: var(--mm-silver);
}
.rfm-required { color: var(--mm-err, #dc2626); margin-left: 2px; }
.rfm-rating-row { display: flex; align-items: center; gap: var(--sp-4); }
.rfm-rating-val {
  font-size: var(--t-md);
  font-weight: 600;
  color: var(--mm-pearl);
}
.rfm-error { font-size: var(--t-xs); color: var(--mm-err, #dc2626); margin: 0; }
.rfm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-4);
}
@media (max-width: 560px) {
  .rfm-grid { grid-template-columns: 1fr; }
}
.rfm-notice {
  background: var(--mm-gold-soft, rgba(212, 168, 67, 0.08));
  border: 0.5px solid var(--mm-border-md);
  border-left: 3px solid var(--mm-gold);
  border-radius: var(--r-md);
  padding: var(--sp-4) var(--sp-5);
}
.rfm-notice-title {
  font-size: var(--t-base);
  font-weight: 600;
  color: var(--mm-pearl);
  margin: 0 0 var(--sp-2);
}
.rfm-notice-list {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}
.rfm-notice-list li {
  font-size: var(--t-sm);
  color: var(--mm-silver);
  line-height: 1.5;
}
.rfm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-3);
}
</style>
