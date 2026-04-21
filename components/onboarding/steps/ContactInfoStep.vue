<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Contact Information</h2>
      <p>Provide details about who should be contacted about this product</p>
    </div>

    <form @submit.prevent="submitStep">
      <div class="form-row">
        <div class="form-group">
          <label for="contactName">Contact Name*</label>
          <input 
            type="text" 
            id="contactName" 
            v-model="localData.contactName" 
            required 
            placeholder="Enter your full name"
          />
        </div>

        <div class="form-group">
          <label for="contactRole">Role/Title*</label>
          <input 
            type="text" 
            id="contactRole" 
            v-model="localData.contactRole" 
            required 
            placeholder="E.g., CEO, Marketing Director, etc."
          />
        </div>
      </div>

      <div class="form-group">
        <label for="contactEmail">Email Address*</label>
        <input 
          type="email" 
          id="contactEmail" 
          v-model="localData.contactEmail" 
          required 
          placeholder="Enter your work email"
        />
        <p class="field-hint">This email will be used for communication about your product listing</p>
      </div>

      <div class="form-group">
        <label for="contactPhone">Phone Number</label>
        <input 
          type="tel" 
          id="contactPhone" 
          v-model="localData.contactPhone" 
          placeholder="Enter your phone number"
        />
      </div>

      <div class="section-divider">
        <h3>Additional Notes</h3>
        <p>Any other information we should know about your product</p>
      </div>

      <div class="form-group">
        <label for="additionalNotes">Additional Notes (Optional)</label>
        <textarea 
          id="additionalNotes" 
          v-model="localData.additionalNotes" 
          placeholder="Any additional information or special instructions"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group checkbox-group">
        <input 
          type="checkbox" 
          id="marketingConsent" 
          v-model="localData.marketingConsent"
        />
        <label for="marketingConsent">
          I agree to receive updates, product information, and marketing communications from SaaSWorld. You may unsubscribe at any time.
        </label>
      </div>

      <div class="form-group checkbox-group">
        <input 
          type="checkbox" 
          id="termsAgreement" 
          v-model="localData.termsAgreement" 
          required
        />
        <label for="termsAgreement">
          I certify that I have the necessary rights to register this product and agree to the <NuxtLink to="/terms" target="_blank">Terms of Service</NuxtLink> and <NuxtLink to="/privacy" target="_blank">Privacy Policy</NuxtLink>*
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// Create a local copy of the data
const localData = reactive({
  contactName: props.formData.contactName || '',
  contactEmail: props.formData.contactEmail || '',
  contactPhone: props.formData.contactPhone || '',
  contactRole: props.formData.contactRole || '',
  additionalNotes: props.formData.additionalNotes || '',
  marketingConsent: props.formData.marketingConsent !== undefined ? props.formData.marketingConsent : false,
  termsAgreement: props.formData.termsAgreement !== undefined ? props.formData.termsAgreement : false,
});

// Watch for changes in the local data and emit updates
watch(localData, (newVal) => {
  emit('update-data', { ...newVal });
}, { deep: true });

// Submit the form data
const submitStep = () => {
  emit('update-data', { ...localData });
  emit('submit-step');
};

// Validate the form
const validateForm = () => {
  const requiredFields = ['contactName', 'contactEmail', 'contactRole', 'termsAgreement'];
  
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.contactEmail);
  const phoneValid = !localData.contactPhone || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(localData.contactPhone);
  
  return requiredFields.every(field => {
    if (field === 'termsAgreement') {
      return localData[field] === true;
    } else {
      return localData[field] && localData[field].trim() !== ''
    }
  }) && emailValid && phoneValid;
};

// Expose validateForm to parent
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

.field-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: var(--spacing-sm);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.checkbox-group label {
  font-weight: normal;
  margin-bottom: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.checkbox-group a {
  color: var(--primary-color);
  text-decoration: none;
}

.checkbox-group a:hover {
  text-decoration: underline;
}

.section-divider {
  margin: var(--spacing-xl) 0;
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--spacing-md);
}

.section-divider h3 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-xs);
}

.section-divider p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
