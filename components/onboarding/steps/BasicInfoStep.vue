<template>
  <div class="step-container">
    <div class="step-header">
      <h2>Basic Information</h2>
      <p>Let's start with the basics about your product or service</p>
    </div>

    <form @submit.prevent="submitStep">
      <!-- Product Overview Section -->
      <AccordionSection
        title="Product Overview"
        :default-expanded="true"
        :show-status="true"
        :status="productOverviewStatus"
        :required="true"
      >
        <p class="section-description">Essential information about your product or service</p>
        
        <div class="form-group">
          <label for="productName">Product/Service Name*</label>
          <input 
            type="text" 
            id="productName" 
            v-model="localData.productName" 
            required 
            placeholder="Enter your product or service name"
          />
        </div>

        <div class="form-group">
          <label for="productWebsite">Product Website URL*</label>
          <input 
            type="url" 
            id="productWebsite" 
            v-model="localData.productWebsite" 
            required 
            placeholder="https://yourproduct.com"
          />
          <p class="field-hint">This will be the primary URL linked to your product listing</p>
        </div>

        <div class="form-group">
          <label for="shortDescription">Short Description*</label>
          <textarea 
            id="shortDescription" 
            v-model="localData.shortDescription" 
            required 
            placeholder="Briefly describe your product in 150 characters or less"
            maxlength="150"
            rows="3"
          ></textarea>
          <div class="character-count">{{ localData.shortDescription.length }}/150</div>
        </div>
      </AccordionSection>

      <!-- Categories & Classification Section -->
      <AccordionSection
        title="Categories & Classification"
        :default-expanded="true"
        :show-status="true"
        :status="categoriesStatus"
        :required="true"
      >
        <p class="section-description">Help users discover your product by selecting relevant categories and keywords</p>

      <div class="form-group">
        <label for="category">Categories*</label>
        <div class="multi-select-container">
          <div class="multi-select-dropdown" @click="toggleDropdown" :class="{ 'open': isDropdownOpen }">
            <div class="selected-items">
              <span v-if="localData.category.length === 0" class="placeholder">Select categories</span>
              <div v-else class="selected-count">
                {{ localData.category.length }} selected
              </div>
            </div>
            <div class="dropdown-arrow">
              <span>{{ isDropdownOpen ? '▲' : '▼' }}</span>
            </div>
          </div>
          <div v-if="isDropdownOpen" class="dropdown-options">
            <input
              type="text"
              v-model="categorySearch"
              class="dropdown-search"
              placeholder="Search categories..."
              @click.stop
            />
            <div 
              v-for="category in filteredCategories" 
              :key="category" 
              class="dropdown-option"
              :class="{ 'selected': localData.category.includes(category) }"
              @click="toggleCategory(category)"
            >
              <input 
                type="checkbox" 
                :checked="localData.category.includes(category)"
                @change="toggleCategory(category)"
              />
              <span>{{ category }}</span>
            </div>
          </div>
        </div>
        
        <div class="selected-categories" v-if="localData.category.length > 0">
          <div 
            v-for="(category, index) in localData.category" 
            :key="index" 
            class="category-tag"
          >
            <span>{{ category }}</span>
            <button 
              type="button" 
              class="remove-category-btn"
              @click="removeCategory(category)"
            >
              ✕
            </button>
          </div>
        </div>
        
        <p class="field-hint">Choose one or more categories that best describe your product or service</p>
      </div>

      <div class="form-group">
        <label for="searchKeywords">Search Keywords*</label>
        <div class="keyword-badges-input" style="position:relative;">
          <div class="badges">
            <span v-for="(keyword, idx) in localData.searchKeywords" :key="keyword + idx" class="keyword-badge">
              {{ keyword }}
              <button type="button" class="badge-remove" @click="removeKeyword(idx)">×</button>
            </span>
          </div>
          <input
            type="text"
            id="searchKeywords"
            v-model="keywordInput"
            @keydown.enter.prevent="addKeyword"
            @keydown.",".prevent="addKeyword"
            @focus="showKeywordDropdown = true"
            @blur="onKeywordInputBlur"
            placeholder="Add keywords (e.g. CRM, SaaS, project management)"
            autocomplete="off"
          />
          <div v-if="showKeywordDropdown && keywordInput.length >= 2 && filteredKeywordSuggestions.length > 0" class="keyword-suggestions-dropdown">
            <div 
              v-for="suggestion in filteredKeywordSuggestions" 
              :key="suggestion" 
              class="keyword-suggestion"
              @mousedown.prevent="selectSuggestedKeyword(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>
        <p class="field-hint">Add keywords to help users find your application in search</p>
      </div>
      </AccordionSection>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import AccordionSection from '~/components/AccordionSection.vue'
import { allCategories, searchCategories } from '~/utils/categories'
import type { Category } from '~/utils/categories'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-data', 'submit-step', 'go-back']);

// Create a local copy of the data
const localData = reactive({
  productName: props.formData.productName || '',
  productWebsite: props.formData.productWebsite || '',
  shortDescription: props.formData.shortDescription || '',
  category: props.formData.category || [],
  searchKeywords: Array.isArray(props.formData.searchKeywords) ? props.formData.searchKeywords : (props.formData.searchKeywords ? props.formData.searchKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [])
});

const keywordInput = ref('');
const showKeywordDropdown = ref(false);

const addKeyword = () => {
  const value = keywordInput.value.trim().replace(/,$/, '');
  if (value && !localData.searchKeywords.includes(value)) {
    localData.searchKeywords.push(value);
  }
  keywordInput.value = '';
};

const removeKeyword = (idx: number) => {
  localData.searchKeywords.splice(idx, 1);
};

// Example: Replace with your real keyword suggestion list or fetch from API
const allKeywordSuggestions = [
  'CRM', 'SaaS', 'project management', 'collaboration', 'productivity',
  'marketing', 'sales', 'automation', 'analytics', 'reporting',
  'customer service', 'e-commerce', 'finance', 'HR', 'recruitment',
  'social media', 'content management', 'design', 'development', 'API'
];

const filteredKeywordSuggestions = computed(() => {
  if (!keywordInput.value || keywordInput.value.length < 2) return [];
  return allKeywordSuggestions.filter(
    keyword => keyword.toLowerCase().includes(keywordInput.value.toLowerCase()) && 
    !localData.searchKeywords.includes(keyword)
  ).slice(0, 5);
});

const selectSuggestedKeyword = (keyword: string) => {
  if (!localData.searchKeywords.includes(keyword)) {
    localData.searchKeywords.push(keyword);
  }
  keywordInput.value = '';
  showKeywordDropdown.value = false;
};

const onKeywordInputBlur = () => {
  setTimeout(() => {
    showKeywordDropdown.value = false;
  }, 200);
};

// Categories dropdown using the comprehensive category system
const isDropdownOpen = ref(false);
const categorySearch = ref('');

// Use all available categories from the centralized system
const availableCategories = computed(() => {
  return allCategories.map(category => category.name).sort()
});

const filteredCategories = computed(() => {
  if (!categorySearch.value) return availableCategories.value;
  
  // Use the search function from utils/categories for consistent searching
  const searchResults = searchCategories(categorySearch.value);
  return searchResults.map(category => category.name);
});

// Status tracking for accordion sections
const productOverviewStatus = computed(() => {
  const hasName = localData.productName.trim().length > 0;
  const hasWebsite = localData.productWebsite.trim().length > 0;
  const hasDescription = localData.shortDescription.trim().length > 0;
  
  if (hasName && hasWebsite && hasDescription) return 'complete';
  if (hasName || hasWebsite || hasDescription) return 'partial';
  return 'empty';
});

const categoriesStatus = computed(() => {
  const hasCategories = localData.category.length > 0;
  const hasKeywords = localData.searchKeywords.length > 0;
  
  if (hasCategories && hasKeywords) return 'complete';
  if (hasCategories || hasKeywords) return 'partial';
  return 'empty';
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const toggleCategory = (category: string) => {
  const index = localData.category.indexOf(category);
  if (index > -1) {
    localData.category.splice(index, 1);
  } else {
    localData.category.push(category);
  }
};

const removeCategory = (category: string) => {
  const index = localData.category.indexOf(category);
  if (index > -1) {
    localData.category.splice(index, 1);
  }
};

// Watch for changes and emit to parent
watch(localData, (newData) => {
  emit('update-data', { ...newData });
}, { deep: true });

const submitStep = () => {
  emit('submit-step');
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

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.field-hint {
  margin-top: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

.character-count {
  text-align: right;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

/* Custom multi-select dropdown styling */
.multi-select-container {
  position: relative;
  width: 100%;
}

.multi-select-dropdown {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--light-color);
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  min-height: calc(1rem + 2 * var(--spacing-md) + 2px);
}

.multi-select-dropdown:hover {
  border-color: var(--color-gray-400);
}

.multi-select-dropdown.open {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.selected-items {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
}

.placeholder {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: normal;
}

.selected-count {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
  line-height: normal;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.selected-categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.category-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 10px;
  background-color: rgba(var(--primary-color-rgb), 0.08);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: var(--border-radius-md);
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.category-tag:hover {
  background-color: rgba(var(--primary-color-rgb), 0.12);
}

.remove-category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  margin-left: 2px;
}

.remove-category-btn:hover {
  background-color: rgba(var(--primary-color-rgb), 0.15);
  color: var(--color-primary-dark);
}

.dropdown-arrow {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--spacing-sm);
  transition: transform 0.2s ease;
  height: 100%;
}

.multi-select-dropdown.open .dropdown-arrow {
  color: var(--primary-color);
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 350px;
  background-color: var(--light-color);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: 100;
  overflow: hidden;
  animation: dropdown-fade-in 0.2s ease;
}

.dropdown-search {
  width: 100%;
  padding: var(--spacing-md);
  border: none;
  border-bottom: 1px solid var(--color-gray-200);
  font-size: 0.95rem;
  border-radius: var(--border-radius-sm);
}

.dropdown-search:focus {
  outline: none;
  box-shadow: none;
}

.dropdown-option {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: background-color 0.2s ease;
}

.dropdown-option:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.dropdown-option.selected {
  background-color: rgba(var(--primary-color-rgb), 0.08);
  color: var(--primary-color);
}

.dropdown-option input[type="checkbox"] {
  width: auto;
  margin: 0;
}

/* Keyword input styles */
.keyword-badges-input {
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
  transition: border-color var(--transition-fast);
}

.keyword-badges-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.keyword-badge {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.badge-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0.8;
}

.badge-remove:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

.keyword-badges-input input {
  border: none;
  padding: var(--spacing-xs) 0;
  font-size: 1rem;
  width: 100%;
}

.keyword-badges-input input:focus {
  outline: none;
  box-shadow: none;
}

.keyword-suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: var(--shadow-md);
  margin-top: 2px;
}

.keyword-suggestion {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.keyword-suggestion:hover {
  background: var(--color-gray-50);
}

@keyframes dropdown-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive styles */
@media (max-width: 768px) {
  .step-container {
    padding: var(--spacing-lg);
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .step-header h2 {
    font-size: 1.5rem;
  }
  
  .step-header p {
    font-size: 1rem;
  }
}
</style>
