<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Product Information</h2>
      <p>Tell us the basics about your product or service</p>
    </div>

    <form @submit.prevent="submitStep">
      <div class="form-group">
        <label for="productName">Product/Service Name*</label>
        <input 
          type="text" 
          id="productName" 
          name="productName"
          v-model="localData.productName" 
          required 
          placeholder="Enter your product or service name"
          :class="{ 'error': hasFieldError('productName') }"
          @blur="validateField('productName', localData.productName)"
          @input="clearFieldError('productName')"
        />
        <FieldError field="productName" :errors="getFieldErrors('productName')" />
        <p class="field-hint">This will be the main title of your listing</p>
      </div>

      <div class="form-group">
        <label for="productWebsite">Website URL*</label>
        <input 
          type="url" 
          id="productWebsite" 
          name="productWebsite"
          v-model="localData.productWebsite" 
          required 
          placeholder="https://your-website.com"
          :class="{ 'error': hasFieldError('productWebsite') }"
          @blur="validateField('productWebsite', localData.productWebsite)"
          @input="clearFieldError('productWebsite')"
        />
        <FieldError field="productWebsite" :errors="getFieldErrors('productWebsite')" />
        <p class="field-hint">Link to your product's homepage or landing page</p>
      </div>

      <div class="form-group">
        <label for="shortDescription">Short Description*</label>
        <textarea 
          id="shortDescription" 
          name="shortDescription"
          v-model="localData.shortDescription" 
          required 
          placeholder="Briefly describe what your product does and its main benefit (max 160 characters)"
          rows="3"
          maxlength="160"
          :class="{ 'error': hasFieldError('shortDescription') }"
          @blur="validateField('shortDescription', localData.shortDescription)"
          @input="clearFieldError('shortDescription')"
        ></textarea>
        <FieldError field="shortDescription" :errors="getFieldErrors('shortDescription')" />
        <p class="field-hint">
          {{ localData.shortDescription.length }}/160 characters - This appears in search results
        </p>
      </div>

      <div class="form-group">
        <label for="category">Category*</label>
        <div class="custom-multiselect" :class="{ active: isCategoryDropdownOpen, error: hasFieldError('categories') }" ref="categoryMultiselectRef">
          <div class="multiselect-input" @click="toggleCategoryDropdown">
            <div v-if="localData.categories.length === 0" class="placeholder">
              Select categories
            </div>
            <div v-else class="selected-options">
              <span class="selected-count">{{ localData.categories.length }} selected</span>
            </div>
            <div class="dropdown-icon">
              <span>{{ isCategoryDropdownOpen ? '▲' : '▼' }}</span>
            </div>
          </div>
          
          <div v-if="isCategoryDropdownOpen" class="dropdown-container">
            <div class="search-container">
              <input 
                type="text" 
                placeholder="Search categories..." 
                v-model="categorySearchQuery" 
                @click.stop
                ref="categorySearchInput"
              />
              <div class="dropdown-actions">
                <button 
                  type="button" 
                  class="action-btn" 
                  @click.stop="selectAllCategories"
                >
                  Select All
                </button>
                <button 
                  type="button" 
                  class="action-btn" 
                  @click.stop="clearAllCategories"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div class="options-container">
              <div 
                v-for="category in filteredCategories" 
                :key="category" 
                class="option-item"
                @click.stop="toggleCategory(category)"
              >
                <div class="checkbox" :class="{ checked: isCategorySelected(category) }">
                  <span v-if="isCategorySelected(category)">✓</span>
                </div>
                <span>{{ category }}</span>
              </div>
              
              <div v-if="filteredCategories.length === 0" class="no-results">
                No categories found matching your search
              </div>
            </div>
          </div>
        </div>
        
        <div class="selected-items" v-if="localData.categories.length > 0">
          <div 
            v-for="(category, index) in localData.categories" 
            :key="index" 
            class="item-tag"
          >
            <span>{{ category }}</span>
            <button 
              type="button" 
              class="remove-item-btn"
              @click="removeCategory(category)"
            >
              ✕
            </button>
          </div>
        </div>
        <FieldError field="categories" :errors="getFieldErrors('categories')" />
        <p class="field-hint">Choose categories that best describe your product</p>
      </div>

      <div class="form-group">
        <label for="basicPricing">Pricing Model*</label>
        <div class="custom-multiselect" :class="{ active: isPricingDropdownOpen, error: hasFieldError('pricingModels') }" ref="pricingMultiselectRef">
          <div class="multiselect-input" @click="togglePricingDropdown">
            <div v-if="localData.pricingModels.length === 0" class="placeholder">
              Select pricing models
            </div>
            <div v-else class="selected-options">
              <span class="selected-count">{{ localData.pricingModels.length }} selected</span>
            </div>
            <div class="dropdown-icon">
              <span>{{ isPricingDropdownOpen ? '▲' : '▼' }}</span>
            </div>
          </div>
          
          <div v-if="isPricingDropdownOpen" class="dropdown-container">
            <div class="search-container">
              <input 
                type="text" 
                placeholder="Search pricing models..." 
                v-model="pricingSearchQuery" 
                @click.stop
                ref="pricingSearchInput"
              />
              <div class="dropdown-actions">
                <button 
                  type="button" 
                  class="action-btn" 
                  @click.stop="selectAllPricingModels"
                >
                  Select All
                </button>
                <button 
                  type="button" 
                  class="action-btn" 
                  @click.stop="clearAllPricingModels"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div class="options-container">
              <div 
                v-for="option in filteredPricingOptions" 
                :key="option.value" 
                class="option-item pricing-option-item"
                @click.stop="togglePricingModel(option.value)"
              >
                <div class="checkbox" :class="{ checked: isPricingModelSelected(option.value) }">
                  <span v-if="isPricingModelSelected(option.value)">✓</span>
                </div>
                <div class="option-content">
                  <span class="option-title">{{ option.label }}</span>
                  <span class="option-description">{{ option.description }}</span>
                </div>
              </div>
              
              <div v-if="filteredPricingOptions.length === 0" class="no-results">
                No pricing models found matching your search
              </div>
            </div>
          </div>
        </div>
        
        <div class="selected-items" v-if="localData.pricingModels.length > 0">
          <div 
            v-for="(model, index) in localData.pricingModels" 
            :key="index" 
            class="item-tag"
          >
            <span>{{ getPricingLabel(model) }}</span>
            <button 
              type="button" 
              class="remove-item-btn"
              @click="removePricingModel(model)"
            >
              ✕
            </button>
          </div>
        </div>
        <FieldError field="pricingModels" :errors="getFieldErrors('pricingModels')" />
        <p class="field-hint">Select all pricing models that apply to your product</p>
      </div>

      <!-- Progress Indicator -->
      <div class="form-progress">
        <div class="progress-text">
          <UIcon dynamic name="i-heroicons-information-circle" class="info-icon info-icon-success" />
          <span>Step 1 of 3 - Basic product information</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';

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

// Error handling methods passed from parent
const hasFieldError = (field: string): boolean => {
  return props.hasFieldError ? props.hasFieldError(field) : false;
};

const getFieldErrors = (field: string): string[] => {
  return props.getFieldErrors ? props.getFieldErrors(field) : [];
};

const validateField = (field: string, value: any) => {
  emit('validateField', field, value);
};

const clearFieldError = (field: string) => {
  emit('clearFieldError', field);
};

// Local form data
const localData = reactive({
  productName: props.formData.productName || '',
  productWebsite: props.formData.productWebsite || '',
  shortDescription: props.formData.shortDescription || '',
  categories: props.formData.categories && props.formData.categories.length > 0 
    ? [...props.formData.categories] 
    : [],
  pricingModels: props.formData.pricingModels && props.formData.pricingModels.length > 0 
    ? [...props.formData.pricingModels] 
    : []
});

// Categories
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
  'Social & Community',
  'Platforms'
];

// Pricing options
const pricingOptions = [
  {
    value: 'free',
    label: 'Free',
    description: 'Completely free to use'
  },
  {
    value: 'freemium',
    label: 'Freemium',
    description: 'Free with premium features'
  },
  {
    value: 'paid',
    label: 'Paid',
    description: 'Subscription or one-time payment'
  },
  {
    value: 'contact',
    label: 'Contact for Pricing',
    description: 'Custom pricing or enterprise'
  }
];

// Category dropdown functionality
const isCategoryDropdownOpen = ref(false);
const categorySearchQuery = ref('');
const categorySearchInput = ref<HTMLInputElement | null>(null);
const categoryMultiselectRef = ref<HTMLElement | null>(null);

// Pricing dropdown functionality
const isPricingDropdownOpen = ref(false);
const pricingSearchQuery = ref('');
const pricingSearchInput = ref<HTMLInputElement | null>(null);
const pricingMultiselectRef = ref<HTMLElement | null>(null);

// Computed properties for filtered options
const filteredCategories = computed(() => {
  if (!categorySearchQuery.value) {
    return categories;
  }
  
  const query = categorySearchQuery.value.toLowerCase();
  return categories.filter(category => 
    category.toLowerCase().includes(query)
  );
});

const filteredPricingOptions = computed(() => {
  if (!pricingSearchQuery.value) {
    return pricingOptions;
  }
  
  const query = pricingSearchQuery.value.toLowerCase();
  return pricingOptions.filter(option => 
    option.label.toLowerCase().includes(query) || 
    option.description.toLowerCase().includes(query)
  );
});

// Category methods
const toggleCategoryDropdown = (event: Event) => {
  event.stopPropagation();
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
  
  if (isCategoryDropdownOpen.value) {
    setTimeout(() => {
      if (categorySearchInput.value) {
        categorySearchInput.value.focus();
      }
    }, 100);
  } else {
    categorySearchQuery.value = '';
  }
};

const isCategorySelected = (category: string) => {
  return localData.categories.includes(category);
};

const toggleCategory = (category: string) => {
  const index = localData.categories.indexOf(category);
  if (index === -1) {
    localData.categories.push(category);
  } else {
    localData.categories.splice(index, 1);
  }
};

const removeCategory = (category: string) => {
  const index = localData.categories.indexOf(category);
  if (index !== -1) {
    localData.categories.splice(index, 1);
  }
};

const selectAllCategories = () => {
  const categoriesToAdd = filteredCategories.value.filter(
    category => !localData.categories.includes(category)
  );
  
  if (categoriesToAdd.length > 0) {
    localData.categories.push(...categoriesToAdd);
  }
};

const clearAllCategories = () => {
  localData.categories = [];
};

// Pricing methods
const togglePricingDropdown = (event: Event) => {
  event.stopPropagation();
  isPricingDropdownOpen.value = !isPricingDropdownOpen.value;
  
  if (isPricingDropdownOpen.value) {
    setTimeout(() => {
      if (pricingSearchInput.value) {
        pricingSearchInput.value.focus();
      }
    }, 100);
  } else {
    pricingSearchQuery.value = '';
  }
};

const isPricingModelSelected = (model: string) => {
  return localData.pricingModels.includes(model);
};

const togglePricingModel = (model: string) => {
  const index = localData.pricingModels.indexOf(model);
  if (index === -1) {
    localData.pricingModels.push(model);
  } else {
    localData.pricingModels.splice(index, 1);
  }
};

const removePricingModel = (model: string) => {
  const index = localData.pricingModels.indexOf(model);
  if (index !== -1) {
    localData.pricingModels.splice(index, 1);
  }
};

const selectAllPricingModels = () => {
  const modelsToAdd = filteredPricingOptions.value
    .map(option => option.value)
    .filter(model => !localData.pricingModels.includes(model));
  
  if (modelsToAdd.length > 0) {
    localData.pricingModels.push(...modelsToAdd);
  }
};

const clearAllPricingModels = () => {
  localData.pricingModels = [];
};

const getPricingLabel = (value: string) => {
  const option = pricingOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Close dropdowns when clicking outside
const closeDropdownOnClickOutside = (event: MouseEvent) => {
  if (isCategoryDropdownOpen.value && categoryMultiselectRef.value && 
      !categoryMultiselectRef.value.contains(event.target as Node)) {
    isCategoryDropdownOpen.value = false;
    categorySearchQuery.value = '';
  }
  
  if (isPricingDropdownOpen.value && pricingMultiselectRef.value && 
      !pricingMultiselectRef.value.contains(event.target as Node)) {
    isPricingDropdownOpen.value = false;
    pricingSearchQuery.value = '';
  }
};

// Register and unregister click event listener
onMounted(() => {
  document.addEventListener('click', closeDropdownOnClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownOnClickOutside);
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

.form-group {
  margin-bottom: var(--spacing-xl);
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: 1rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background: var(--light-color);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(var(--color-success-rgb), 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
}

.field-hint {
  margin-top: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.pricing-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.pricing-option {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--light-color);
}

.pricing-option:hover {
  border-color: var(--color-success-light);
  background: var(--color-success-light);
}

.pricing-option input[type="radio"] {
  margin: 0;
  width: auto;
  margin-top: 2px;
  accent-color: var(--color-success);
}

.pricing-option input[type="radio"]:checked + .option-content {
  color: var(--color-success);
}

.pricing-option:has(input:checked) {
  border-color: var(--color-success);
  background: var(--color-success-light);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.option-title {
  font-weight: 600;
  color: var(--text-primary);
}

.option-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

.form-progress {
  margin-top: var(--spacing-xl);
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

/* Custom multi-select dropdown styling */
.custom-multiselect {
  position: relative;
  width: 100%;
}

.multiselect-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--light-color);
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  height: calc(1rem + 2 * var(--spacing-md) + 4px);
}

.multiselect-input:hover {
  border-color: var(--color-gray-400);
}

.custom-multiselect.active .multiselect-input {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(var(--color-success-rgb), 0.1);
}

.placeholder {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: normal;
}

.selected-options {
  display: flex;
  align-items: center;
  height: 100%;
}

.selected-count {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
  line-height: normal;
}

.dropdown-icon {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--spacing-sm);
  transition: transform 0.2s ease;
  height: 100%;
}

.active .dropdown-icon {
  color: var(--color-success);
}

.dropdown-container {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 350px;
  background-color: var(--light-color);
  border: 2px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: 100;
  overflow: hidden;
  animation: dropdown-fade-in 0.2s ease;
}

.search-container {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  background-color: var(--light-color);
  z-index: 1;
}

.search-container input {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  width: 100%;
  border: 1px solid var(--color-gray-300);
  font-size: 0.95rem;
}

.dropdown-actions {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  margin-top: var(--spacing-xs);
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-success);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(var(--color-success-rgb), 0.1);
  text-decoration: underline;
}

.no-results {
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-style: italic;
  text-align: center;
}

.options-container {
  max-height: 280px;
  overflow-y: auto;
}

.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: var(--bg-gray);
}

.options-container::-webkit-scrollbar-thumb {
  background-color: var(--color-gray-400);
  border-radius: 6px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.option-item:hover {
  background-color: rgba(var(--color-success-rgb), 0.05);
}

.pricing-option-item {
  align-items: flex-start;
  padding: var(--spacing-md);
}

.pricing-option-item .checkbox {
  margin-top: 2px;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-gray-400);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.option-item:hover .checkbox:not(.checked) {
  border-color: var(--color-success);
}

.checkbox.checked {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.item-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 10px;
  background-color: rgba(var(--color-success-rgb), 0.08);
  border: 1px solid rgba(var(--color-success-rgb), 0.2);
  border-radius: var(--border-radius-md);
  color: var(--color-success);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.item-tag:hover {
  background-color: rgba(var(--color-success-rgb), 0.12);
}

.remove-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: var(--color-success);
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  margin-left: 2px;
}

.remove-item-btn:hover {
  background-color: rgba(var(--color-success-rgb), 0.15);
  color: var(--color-success-dark);
}

@keyframes dropdown-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Error States */
input.error,
textarea.error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
}

input.error:focus,
textarea.error:focus {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2) !important;
}

.custom-multiselect.error .multiselect-input {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
}

.custom-multiselect.error.active .multiselect-input {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2) !important;
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
  
  .pricing-options {
    grid-template-columns: 1fr;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: var(--spacing-sm);
    font-size: 0.95rem;
  }
}

@media (max-width: 576px) {
  .step-container {
    padding: var(--spacing-md);
  }
  
  .pricing-option {
    padding: var(--spacing-sm);
  }
  
  .option-content {
    gap: 2px;
  }
  
  .option-title {
    font-size: 0.9rem;
  }
  
  .option-description {
    font-size: 0.8rem;
  }
}
</style>
