<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Media Assets</h2>
      <p>Upload your logo and a screenshot to showcase your product</p>
    </div>

    <form @submit.prevent="submitStep">
      <!-- Logo Upload -->
      <div class="form-group">
        <label>Product Logo*</label>
        <div class="upload-container logo-upload" :class="{ 'has-file': logoPreview, 'error': hasFieldError?.('logo') }">
          <div class="upload-preview" v-if="logoPreview">
            <img :src="logoPreview" alt="Logo preview" />
            <button type="button" class="remove-file" @click="removeLogo">
              <UIcon dynamic name="i-heroicons-x-mark" />
            </button>
          </div>
          <div class="upload-placeholder" v-else @click="triggerLogoUpload">
            <div class="upload-icon">
              <UIcon dynamic name="i-heroicons-photo" />
            </div>
            <div class="upload-content">
              <h3>Upload Logo</h3>
              <p>Click to browse or drag and drop</p>
              <p class="upload-specs">PNG, JPG, or SVG • Max 2MB • Square format recommended</p>
            </div>
          </div>
          <input 
            type="file" 
            ref="logoInput"
            accept="image/png, image/jpeg, image/svg+xml"
            @change="handleLogoUpload"
            hidden
          />
        </div>
        <FieldError field="logo" :errors="getFieldErrors?.('logo') || []" />
        <p class="field-hint">Your logo will appear prominently in your product listing and search results</p>
      </div>

            <!-- Screenshot Upload -->
      <div class="form-group">
        <label>Product Screenshot*</label>
        <div class="upload-container screenshot-upload" :class="{ 'has-file': screenshotPreview, 'error': hasFieldError?.('screenshot') }">
          <div class="upload-preview" v-if="screenshotPreview">
            <img :src="screenshotPreview" alt="Screenshot preview" />
            <button type="button" class="remove-file" @click="removeScreenshot">
              <UIcon dynamic name="i-heroicons-x-mark" />
            </button>
          </div>
          <div class="upload-placeholder" v-else @click="triggerScreenshotUpload">
            <div class="upload-icon">
              <UIcon dynamic name="i-heroicons-computer-desktop" />
            </div>
            <div class="upload-content">
              <h3>Upload Screenshot</h3>
              <p>Show your product in action</p>
              <p class="upload-specs">PNG or JPG • Max 5MB • 16:9 or 4:3 ratio recommended</p>
            </div>
          </div>
          <input 
            type="file" 
            ref="screenshotInput"
            accept="image/png, image/jpeg"
            @change="handleScreenshotUpload"
            hidden
          />
        </div>
        <FieldError field="screenshot" :errors="getFieldErrors?.('screenshot') || []" />
        <p class="field-hint">Choose your best screenshot that showcases your product's key features</p>
      </div>

      <!-- Upload Tips -->
      <div class="upload-tips">
        <h4>
          <UIcon dynamic name="i-heroicons-light-bulb" />
          Pro Tips for Better Listings
        </h4>
        <ul>
          <li>Use high-quality, clear images that represent your brand</li>
          <li>Ensure your logo is readable at small sizes</li>
          <li>Screenshots should show your product's main interface or dashboard</li>
          <li>Avoid cluttered or busy screenshots - focus on key features</li>
        </ul>
      </div>

      <!-- Progress Indicator -->
      <div class="form-progress">
        <div class="progress-text">
          <UIcon dynamic name="i-heroicons-photo" />
          <span>Step 2 of 3 - Visual assets for your listing</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
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

// Refs
const logoInput = ref<HTMLInputElement>();
const screenshotInput = ref<HTMLInputElement>();
const logoPreview = ref<string | null>(null);
const screenshotPreview = ref<string | null>(null);

// Local form data
const localData = reactive({
  logo: props.formData.logo || null,
  screenshot: props.formData.screenshot || null
});

// File upload handlers
const triggerLogoUpload = () => {
  logoInput.value?.click();
};

const triggerScreenshotUpload = () => {
  screenshotInput.value?.click();
};

const handleLogoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, or SVG file');
      return;
    }
    
    localData.logo = file;
    logoPreview.value = URL.createObjectURL(file);
  }
};

const handleScreenshotUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Screenshot file size must be less than 5MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PNG or JPG file');
      return;
    }
    
    localData.screenshot = file;
    screenshotPreview.value = URL.createObjectURL(file);
  }
};

const removeLogo = () => {
  localData.logo = null;
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value);
    logoPreview.value = null;
  }
  if (logoInput.value) {
    logoInput.value.value = '';
  }
};

const removeScreenshot = () => {
  localData.screenshot = null;
  if (screenshotPreview.value) {
    URL.revokeObjectURL(screenshotPreview.value);
    screenshotPreview.value = null;
  }
  if (screenshotInput.value) {
    screenshotInput.value.value = '';
  }
};

// Watch for changes and emit updates
watch(localData, (newVal) => {
  emit('updateData', { ...newVal });
}, { deep: true });

// Initialize previews if files exist
onMounted(() => {
  if (props.formData.logo) {
    logoPreview.value = URL.createObjectURL(props.formData.logo);
  }
  if (props.formData.screenshot) {
    screenshotPreview.value = URL.createObjectURL(props.formData.screenshot);
  }
});

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

.form-group {
  margin-bottom: var(--spacing-xl);
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-size: 1rem;
}

.upload-container {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-lg);
  background: var(--bg-gray);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.upload-container:hover {
  border-color: var(--color-success);
  background: var(--color-success-light);
}

.upload-container.has-file {
  border-style: solid;
  border-color: var(--color-success);
  background: var(--light-color);
}

.logo-upload {
  height: 200px;
}

.screenshot-upload {
  height: 300px;
}

.upload-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: var(--spacing-lg);
  text-align: center;
}

.upload-icon {
  font-size: 3rem;
  color: var(--color-success);
  margin-bottom: var(--spacing-md);
}

.upload-content h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.upload-content p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.upload-specs {
  font-size: 0.875rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.upload-preview {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.upload-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.remove-file {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: var(--color-error);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
}

.remove-file:hover {
  background: var(--color-error-dark);
  transform: scale(1.1);
}

.field-hint {
  margin-top: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.upload-tips {
  background: var(--bg-gray);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  border-left: 4px solid var(--color-warning);
}

.upload-tips h4 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-size: 1rem;
}

.upload-tips h4 svg {
  color: var(--color-warning);
  width: 20px;
  height: 20px;
}

.upload-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.upload-tips li {
  position: relative;
  padding-left: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.upload-tips li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-warning);
  font-weight: bold;
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

/* Drag and drop styling */
.upload-container.dragover {
  border-color: var(--color-success);
  background: var(--color-success-light);
  transform: scale(1.02);
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
  
  .logo-upload {
    height: 160px;
  }
  
  .screenshot-upload {
    height: 240px;
  }
  
  .upload-icon {
    font-size: 2.5rem;
  }
  
  .upload-content h3 {
    font-size: 1.1rem;
  }
  
  .upload-content p {
    font-size: 0.9rem;
  }
  
  .upload-specs {
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .step-container {
    padding: var(--spacing-md);
  }
  
  .logo-upload {
    height: 140px;
  }
  
  .screenshot-upload {
    height: 200px;
  }
  
  .upload-placeholder {
    padding: var(--spacing-md);
  }
  
  .upload-icon {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
  }
  
  .upload-content h3 {
    font-size: 1rem;
  }
  
  .upload-tips {
    padding: var(--spacing-md);
  }
  
  .upload-tips h4 {
    font-size: 0.9rem;
  }
  
  .upload-tips li {
    font-size: 0.85rem;
  }
}
</style>
