<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Contact Information</h2>
      <p>Provide your contact details to complete your listing</p>
    </div>

    <form @submit.prevent="submitStep">
      <div class="form-row">
        <div class="form-group">
          <label for="companyName">Company Name*</label>
          <input 
            type="text" 
            id="companyName" 
            v-model="localData.companyName" 
            required 
            placeholder="Your company name"
            :class="{ 'error': hasFieldError?.('companyName') }"
          />
          <FieldError field="companyName" :errors="getFieldErrors?.('companyName') || []" />
          <p class="field-hint">This will appear as the publisher of your product</p>
        </div>

        <div class="form-group">
          <label for="contactName">Contact Name*</label>
          <input 
            type="text" 
            id="contactName" 
            v-model="localData.contactName" 
            required 
            placeholder="Your full name"
            :class="{ 'error': hasFieldError?.('contactName') }"
          />
          <FieldError field="contactName" :errors="getFieldErrors?.('contactName') || []" />
          <p class="field-hint">Primary contact person for this listing</p>
        </div>
      </div>

      <div class="form-group">
        <label for="contactEmail">Email Address*</label>
        <input 
          type="email" 
          id="contactEmail" 
          v-model="localData.contactEmail" 
          required 
          placeholder="your@email.com"
          :class="{ 'error': hasFieldError?.('contactEmail') }"
        />
        <FieldError field="contactEmail" :errors="getFieldErrors?.('contactEmail') || []" />
        <p class="field-hint">We'll send listing updates and notifications to this email</p>
      </div>

      <!-- Optional Enhancement Note -->
      <div class="enhancement-note">
        <div class="note-icon">
          <UIcon dynamic name="i-heroicons-information-circle" class="info-icon" />
        </div>
        <div class="note-content">
          <h4>Want to enhance your listing?</h4>
          <p>After publishing, you can add more details like:</p>
          <ul>
            <li>Detailed product features and benefits</li>
            <li>Team information and company background</li>
            <li>Customer testimonials and reviews</li>
            <li>Additional screenshots and demo videos</li>
            <li>Integration information and API details</li>
          </ul>
          <p class="note-cta">
            <strong>For now, let's get you listed quickly!</strong> You can always enhance your profile later.
          </p>
        </div>
      </div>

      <!-- Terms and Privacy -->
      <div class="terms-section">
        <h4>Before we publish your listing</h4>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="localData.termsAccepted" 
              required
            />
            <span class="checkmark"></span>
            <span class="checkbox-text">
              I agree to the 
              <a href="/terms" target="_blank">Terms of Service</a> 
              and 
              <a href="/privacy" target="_blank">Privacy Policy</a>
            </span>
          </label>

          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="localData.marketingConsent"
            />
            <span class="checkmark"></span>
            <span class="checkbox-text">
              I'd like to receive helpful tips and updates about SaaSWorld (optional)
            </span>
          </label>
        </div>
      </div>

      <!-- What happens next -->
      <div class="next-steps">
        <h4>
          <UIcon dynamic name="i-heroicons-rocket-launch" />
          What happens next?
        </h4>
        <div class="steps-list">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <strong>Instant Publishing</strong>
              <p>Your listing goes live immediately and becomes searchable</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <strong>Quality Review</strong>
              <p>Our team reviews your listing within 24 hours for quality assurance</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <strong>Start Getting Discovered</strong>
              <p>Users can immediately find and explore your product</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="form-progress">
        <div class="progress-text">
          <UIcon dynamic name="i-heroicons-user-circle" />
          <span>Step 3 of 3 - Ready to publish your listing!</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import FieldError from '~/components/form/FieldError.vue';

const props = defineProps<{
  formData: any;
  formErrors?: Record<string, string[]>;
  hasFieldError?: (field: string) => boolean;
  getFieldErrors?: (field: string) => string[];
}>();

const emit = defineEmits<{
  updateData: [data: any];
  submitStep: [];
  goBack: [];
  validateField: [field: string, value: any];
  clearFieldError: [field: string];
}>();

// Local form data
const localData = reactive({
  companyName: props.formData.companyName || '',
  contactName: props.formData.contactName || '',
  contactEmail: props.formData.contactEmail || '',
  termsAccepted: props.formData.termsAccepted || false,
  marketingConsent: props.formData.marketingConsent || false
});

// Watch for changes and emit updates
watch(localData, (newVal) => {
  emit('updateData', { ...newVal });
}, { deep: true });

// Submit the form data
const submitStep = () => {
  emit('updateData', { ...localData });
  emit('submitStep');
};
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
  color: var(--color-success);
  margin-bottom: var(--spacing-sm);
}

.step-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: 1rem;
}

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background: var(--light-color);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(var(--color-success-rgb), 0.1);
}

.field-hint {
  margin-top: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.enhancement-note {
  background: linear-gradient(135deg, var(--color-success-light), #f0f9ff);
  border: 1px solid var(--color-success-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  display: flex;
  gap: var(--spacing-md);
}

.note-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.note-content h4 {
  color: var(--color-success-dark);
  margin-bottom: var(--spacing-sm);
  font-size: 1.1rem;
}

.note-content p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}

.note-content ul {
  margin: var(--spacing-sm) 0;
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
}

.note-content li {
  margin-bottom: var(--spacing-xs);
  font-size: 0.9rem;
}

.note-cta {
  color: var(--color-success-dark);
  font-size: 0.95rem;
  margin-top: var(--spacing-sm);
}

.terms-section {
  background: var(--bg-gray);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.terms-section h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-size: 1.1rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-400);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 1px;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: var(--color-success);
  border-color: var(--color-success);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.checkbox-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.checkbox-text a {
  color: var(--color-success);
  text-decoration: underline;
}

.checkbox-text a:hover {
  color: var(--color-success-dark);
}

.next-steps {
  background: var(--bg-gray);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  border-left: 4px solid var(--color-success);
}

.next-steps h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-size: 1.1rem;
}

.next-steps h4 svg {
  color: var(--color-success);
  width: 20px;
  height: 20px;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.step-item {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: 0.95rem;
}

.step-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.form-progress {
  padding: var(--spacing-lg);
  background: var(--bg-gray);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--color-success);
}

.progress-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
}

.progress-text svg {
  color: var(--color-success);
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .step-header h2 {
    font-size: 1.5rem;
  }
  
  .step-header p {
    font-size: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .enhancement-note {
    flex-direction: column;
    text-align: center;
  }
  
  .note-icon {
    align-self: center;
  }
  
  .steps-list {
    gap: var(--spacing-sm);
  }
  
  .step-item {
    gap: var(--spacing-sm);
  }
  
  .step-number {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .step-container {
    padding: var(--spacing-md);
  }
  
  .enhancement-note,
  .terms-section,
  .next-steps {
    padding: var(--spacing-md);
  }
  
  .note-content h4,
  .terms-section h4,
  .next-steps h4 {
    font-size: 1rem;
  }
  
  .note-content li,
  .step-content p {
    font-size: 0.85rem;
  }
  
  .checkbox-text {
    font-size: 0.9rem;
  }
  
  .checkmark {
    width: 18px;
    height: 18px;
  }
}
</style>
