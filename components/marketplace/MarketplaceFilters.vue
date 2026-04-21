<template>
  <div class="marketplace-filters">
    <div class="filters-header">
      <h2 class="filters-title">{{ filteredAppsCount }} Applications</h2>
      
      <div class="applied-filters" v-if="hasActiveFilters">
        <span class="filter-label">Filters:</span>
        <div class="filter-tags">
          <div 
            v-if="selectedCategory" 
            class="filter-tag"
          >
            Category: {{ getCategoryName(selectedCategory) }}
            <button @click="removeFilter('category')" class="remove-filter">
              <UIcon name="i-heroicons-x-mark" dynamic  />
            </button>
          </div>
          
          <div 
            v-for="(value, key) in activeFilters" 
            :key="key" 
            class="filter-tag"
          >
            {{ getFilterLabel(key) }}: {{ getFilterValueLabel(key, value) }}
            <button @click="removeFilter(key)" class="remove-filter">
              <UIcon name="i-heroicons-x-mark" dynamic  />
            </button>
          </div>
        </div>
        
        <button @click="clearAllFilters" class="clear-all-filters">
          Clear All
        </button>
      </div>
      
      <div class="filters-controls">
        <button @click="toggleFiltersPanel" class="filters-button">
          <UIcon name="i-heroicons-funnel" dynamic  />
          <span>Filters</span>
        </button>
        
        <div class="sort-dropdown">
          <label for="sort-select">Sort By:</label>
          <div class="select-wrapper">
            <select id="sort-select" v-model="sortOption">
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="fundingStatus">Investment Ready</option>
              <option value="growthRate">Highest Growth</option>
              <option value="marketCap">Market Valuation</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
            </select>
            <UIcon name="i-heroicons-chevron-down" dynamic  class="select-icon" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Advanced Filters Panel -->
    <div class="filters-panel" :class="{ active: showFiltersPanel }">
      <div class="filters-panel-header">
        <h3>Advanced Filters</h3>
        <button @click="toggleFiltersPanel" class="close-filters">
          <UIcon name="i-heroicons-x-mark" dynamic  />
        </button>
      </div>
      
      <div class="filters-panel-content">
        <!-- VC-Focused Filters -->
        <div class="filter-group vc-filters">
          <h4>Investment Status</h4>
          <div class="checkbox-options">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.fundingStatus === 'seeking'"
                @change="toggleFilter('fundingStatus', 'seeking')"
              />
              <span>Seeking Investment</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.fundingStatus === 'funded'"
                @change="toggleFilter('fundingStatus', 'funded')"
              />
              <span>Recently Funded</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.fundingStatus === 'unicorn'"
                @change="toggleFilter('fundingStatus', 'unicorn')"
              />
              <span>Unicorn Companies</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.fundingStatus === 'ipo'"
                @change="toggleFilter('fundingStatus', 'ipo')"
              />
              <span>Public Companies</span>
            </label>
          </div>
        </div>

        <div class="filter-group vc-filters">
          <h4>Growth Stage</h4>
          <div class="checkbox-options">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.growthStage === 'early'"
                @change="toggleFilter('growthStage', 'early')"
              />
              <span>Early Stage</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.growthStage === 'growth'"
                @change="toggleFilter('growthStage', 'growth')"
              />
              <span>Growth Stage</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.growthStage === 'mature'"
                @change="toggleFilter('growthStage', 'mature')"
              />
              <span>Mature</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.growthStage === 'emerging'"
                @change="toggleFilter('growthStage', 'emerging')"
              />
              <span>Emerging Leaders</span>
            </label>
          </div>
        </div>

        <div class="filter-group vc-filters">
          <h4>Market Position</h4>
          <div class="checkbox-options">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.marketPosition === 'leader'"
                @change="toggleFilter('marketPosition', 'leader')"
              />
              <span>Market Leader</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.marketPosition === 'challenger'"
                @change="toggleFilter('marketPosition', 'challenger')"
              />
              <span>Market Challenger</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.marketPosition === 'disruptor'"
                @change="toggleFilter('marketPosition', 'disruptor')"
              />
              <span>Market Disruptor</span>
            </label>
          </div>
        </div>
        
        <div class="filter-group">
          <h4>Rating</h4>
          <div class="rating-options">
            <div 
              v-for="rating in [5, 4, 3, 2, 1]" 
              :key="rating"
              class="rating-option"
              :class="{ 'active': activeFilters.rating === rating.toString() }"
              @click="toggleFilter('rating', rating.toString())"
            >
              <div class="stars">
                <NuxtIcon 
                  v-for="i in 5" 
                  :key="i" 
                  :name="i <= rating ? 'heroicons:star-solid' : 'heroicons:star'" 
                  
                  :class="{ 'filled': i <= rating }"
                />
              </div>
              <span>{{ rating }}{{ rating === 5 ? '' : '+ Stars' }}</span>
            </div>
          </div>
        </div>
        
        <div class="filter-group">
          <h4>Price</h4>
          <div class="checkbox-options">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.price === 'free'"
                @change="toggleFilter('price', 'free')"
              />
              <span>Free</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.price === 'freemium'"
                @change="toggleFilter('price', 'freemium')"
              />
              <span>Freemium</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.price === 'paid'"
                @change="toggleFilter('price', 'paid')"
              />
              <span>Paid</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.price === 'enterprise'"
                @change="toggleFilter('price', 'enterprise')"
              />
              <span>Enterprise</span>
            </label>
          </div>
        </div>
        
        <div class="filter-group">
          <h4>Integrations</h4>
          <div class="checkbox-options">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.integrations === 'api'"
                @change="toggleFilter('integrations', 'api')"
              />
              <span>API Available</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.integrations === 'zapier'"
                @change="toggleFilter('integrations', 'zapier')"
              />
              <span>Zapier Integration</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.integrations === 'webhook'"
                @change="toggleFilter('integrations', 'webhook')"
              />
              <span>Webhooks</span>
            </label>
          </div>
        </div>
        
        <div class="filter-group">
          <h4>Business Size</h4>
          <div class="checkbox-options">
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.businessSize === 'small'"
                @change="toggleFilter('businessSize', 'small')"
              />
              <span>Small Business</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.businessSize === 'medium'"
                @change="toggleFilter('businessSize', 'medium')"
              />
              <span>Medium Business</span>
            </label>
            <label class="checkbox-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.businessSize === 'enterprise'"
                @change="toggleFilter('businessSize', 'enterprise')"
              />
              <span>Enterprise</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="filters-panel-footer">
        <button @click="clearAllFilters" class="clear-filters-button">
          Clear All Filters
        </button>
        <button @click="applyFilters" class="apply-filters-button">
          Apply Filters
        </button>
      </div>
    </div>
    
    <!-- Overlay when filters panel is open -->
    <div 
      v-if="showFiltersPanel" 
      class="filters-overlay"
      @click="toggleFiltersPanel"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const showFiltersPanel = ref(false);
const sortOption = ref('popular');

// Active filters from URL query parameters
const activeFilters = computed(() => {
  const filters: Record<string, string> = {};
  const { query } = route;
  
  if (query.rating) filters.rating = query.rating as string;
  if (query.price) filters.price = query.price as string;
  if (query.integrations) filters.integrations = query.integrations as string;
  if (query.businessSize) filters.businessSize = query.businessSize as string;
  
  return filters;
});

// Selected category from URL query parameters
const selectedCategory = computed(() => route.query.category as string || '');

// Check if there are any active filters
const hasActiveFilters = computed(() => {
  return Object.keys(activeFilters.value).length > 0 || selectedCategory.value;
});

// Mock filtered apps count based on active filters
// In a real app, this would be calculated based on the actual filtered data
const filteredAppsCount = computed(() => {
  // In a real app, this would be the actual count of apps after filters are applied
  const baseCount = 150;
  let count = baseCount;
  
  // Simulate fewer results as filters are applied
  if (selectedCategory.value) count = Math.floor(count * 0.7);
  count -= Object.keys(activeFilters.value).length * 15;
  
  return Math.max(count, 0);
});

// Toggle filters panel
const toggleFiltersPanel = () => {
  showFiltersPanel.value = !showFiltersPanel.value;
  
  // Handle body scrolling when panel is open
  if (showFiltersPanel.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Toggle a specific filter
const toggleFilter = (key: string, value: string) => {
  // If the filter is already active with the same value, remove it
  if (activeFilters.value[key] === value) {
    removeFilter(key);
  } else {
    // Otherwise, update or add the filter
    const newQuery = { ...route.query, [key]: value };
    router.push({ query: newQuery });
  }
};

// Remove a specific filter
const removeFilter = (key: string) => {
  const newQuery = { ...route.query };
  delete newQuery[key];
  router.push({ query: newQuery });
};

// Clear all filters
const clearAllFilters = () => {
  // Keep search parameter if it exists
  const newQuery = route.query.search ? { search: route.query.search } : {};
  router.push({ query: newQuery });
};

// Apply filters (close panel)
const applyFilters = () => {
  showFiltersPanel.value = false;
  document.body.style.overflow = '';
};

// Get display name for a filter category
const getFilterLabel = (key: string) => {
  const labels: Record<string, string> = {
    rating: 'Rating',
    price: 'Price',
    integrations: 'Integrations',
    businessSize: 'Business Size'
  };
  return labels[key] || key;
};

// Get display name for a filter value
const getFilterValueLabel = (key: string, value: string) => {
  if (key === 'rating') return `${value}+ Stars`;
  if (key === 'price' && value === 'freemium') return 'Freemium';
  
  // Capitalize first letter
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// Get category name from ID
const getCategoryName = (categoryId: string) => {
  const categories: Record<string, string> = {
    'crm': 'CRM',
    'marketing': 'Marketing',
    'productivity': 'Productivity',
    'design': 'Design',
    'finance': 'Finance',
    'communication': 'Communication',
    'hr': 'HR & Recruiting',
    'analytics': 'Analytics',
    'development': 'Development',
    'customer-support': 'Customer Support',
    'project-management': 'Project Management',
    'security': 'Security',
    'social-media': 'Social Media',
    'education': 'Education',
    'e-commerce': 'E-commerce',
    'video': 'Video',
    'health': 'Health'
  };
  
  return categories[categoryId] || categoryId;
};

// Watch for sort option changes
watch(sortOption, (newValue) => {
  router.push({ query: { ...route.query, sort: newValue } });
});

// Initialize sort option from URL query
onMounted(() => {
  if (route.query.sort) {
    sortOption.value = route.query.sort as string;
  }
});

// Clean up when component is unmounted
onBeforeUnmount(() => {
  // Restore body scrolling
  document.body.style.overflow = '';
});

import { onMounted, onBeforeUnmount } from 'vue';
</script>

<style scoped>
.marketplace-filters {
  position: relative;
}

.filters-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
}

.filters-title {
  font-size: var(--fs-title);
  margin: 0;
  font-weight: 600;
}

.applied-filters {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--fs-sm);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--fs-sm);
  font-weight: 500;
}

.remove-filter {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  margin-left: 2px;
}

.remove-filter:hover {
  background-color: rgba(var(--primary-color-rgb), 0.2);
}

.clear-all-filters {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.clear-all-filters:hover {
  color: var(--text-primary);
  background-color: var(--color-gray-100);
}

.filters-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-left: auto;
}

.filters-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: white;
  border: 1px solid var(--color-gray-300);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filters-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.sort-dropdown {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sort-dropdown label {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  appearance: none;
  background-color: white;
  border: 1px solid var(--color-gray-300);
  padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.select-wrapper select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.select-icon {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

/* Filters Panel */
.filters-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 380px;
  background-color: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.filters-panel.active {
  transform: translateX(0);
}

.filters-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
}

.filters-panel-header h3 {
  margin: 0;
  font-size: var(--fs-title-sm);
}

.close-filters {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-filters:hover {
  background-color: var(--color-gray-100);
  color: var(--text-primary);
}

.filters-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.filter-group {
  margin-bottom: var(--spacing-xl);
}

.filter-group h4 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: var(--fs-body-lg);
  font-weight: 500;
  color: var(--text-primary);
}

.rating-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.rating-option {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.rating-option:hover {
  background-color: var(--color-gray-100);
}

.rating-option.active {
  background-color: rgba(var(--primary-color-rgb), 0.05);
  border-color: var(--primary-color);
}

.stars {
  display: flex;
  margin-right: var(--spacing-sm);
}

.star-icon {
  color: #ddd;
}

.star-icon.filled {
  color: #ffc107;
}

.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-xs) 0;
}

.checkbox-option input {
  cursor: pointer;
}

/* VC-Focused Filter Styles */
.vc-filters {
  border-left: 3px solid var(--primary-color);
  padding-left: var(--spacing-md);
  background: linear-gradient(90deg, rgba(var(--primary-color-rgb), 0.02) 0%, transparent 100%);
}

.vc-filters h4 {
  color: var(--primary-color);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.vc-filters h4::before {
  content: "💼";
  font-size: var(--fs-sm);
}

.vc-filters .checkbox-option {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.vc-filters .checkbox-option:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.vc-filters .checkbox-option input:checked + span {
  color: var(--primary-color);
  font-weight: 500;
}

.filters-panel-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.clear-filters-button {
  flex: 1;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  background-color: white;
  color: var(--text-primary);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-button:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.apply-filters-button {
  flex: 1;
  padding: var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-filters-button:hover {
  background-color: var(--color-primary-dark);
}

.filters-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive Styles */
@media (max-width: 992px) {
  .filters-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filters-controls {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .filters-panel {
    width: 320px;
  }
  
  .applied-filters {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 576px) {
  .filters-panel {
    width: 100%;
  }
  
  .filters-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .sort-dropdown {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .select-wrapper {
    width: 100%;
  }
  
  .select-wrapper select {
    width: 100%;
  }
  
  .filters-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
