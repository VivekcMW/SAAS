<template>
  <div class="marketplace-search">
    <div class="search-row">
      <div class="search-container">
        <div class="search-icon">
          <UIcon name="i-heroicons-magnifying-glass" dynamic  />
        </div>
        <input 
          type="text" 
          placeholder="Search for applications, categories, or keywords..." 
          v-model="searchQuery"
          @input="handleSearch"
          @focus="showSuggestions = true"
          @blur="hideSuggestionsDelayed" 
          class="search-input"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-button">
          <UIcon name="i-heroicons-x-mark" dynamic  />
        </button>
      </div>
      <button class="category-btn" @click="handleCategoryClick" title="Browse Categories">
        <UIcon name="i-heroicons-squares-2x2" dynamic />
      </button>
    </div>
    
    <!-- Search Suggestions Dropdown -->
    <div v-show="showSuggestions && (searchQuery || recentSearches.length > 0)" class="search-suggestions">
      <!-- Recent searches -->
      <div v-if="recentSearches.length > 0 && !searchQuery" class="suggestion-section">
        <div class="suggestion-header">
          <span>Recent Searches</span>
          <button @click="clearRecentSearches" class="clear-all-button">Clear All</button>
        </div>
        <div class="suggestion-items">
          <div 
            v-for="(search, index) in recentSearches" 
            :key="`recent-${index}`" 
            class="suggestion-item recent"
            @click="applyRecentSearch(search)"
          >
            <UIcon name="i-heroicons-clock" dynamic  class="suggestion-icon" />
            <span>{{ search }}</span>
          </div>
        </div>
      </div>
      
      <!-- Search results -->
      <div v-if="searchQuery && filteredSuggestions.length > 0" class="suggestion-section">
        <div class="suggestion-header">
          <span>Applications</span>
        </div>
        <div class="suggestion-items">
          <div 
            v-for="(app, index) in filteredSuggestions.apps.slice(0, 4)" 
            :key="`app-${index}`" 
            class="suggestion-item app"
            @mousedown="navigateToApp(app.id)"
          >
            <img :src="app.logo" :alt="app.name" class="suggestion-app-logo" />
            <div class="suggestion-app-info">
              <span class="app-name">{{ app.name }}</span>
              <span class="app-category">{{ app.category }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Categories -->
      <div v-if="searchQuery && filteredSuggestions.categories.length > 0" class="suggestion-section">
        <div class="suggestion-header">
          <span>Categories</span>
        </div>
        <div class="suggestion-items">
          <div 
            v-for="(category, index) in filteredSuggestions.categories.slice(0, 3)" 
            :key="`category-${index}`" 
            class="suggestion-item category"
            @mousedown="navigateToCategory(category)"
          >
            <UIcon name="i-heroicons-tag" dynamic  class="suggestion-icon" />
            <span>{{ category }}</span>
          </div>
        </div>
      </div>
      
      <!-- See all results -->
      <div v-if="searchQuery" class="suggestion-footer">
        <button @mousedown="performSearch" class="see-all-button">
          <UIcon name="i-heroicons-magnifying-glass" dynamic  />
          <span>See all results for "{{ searchQuery }}"</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');
const showSuggestions = ref(false);
const recentSearches = ref<string[]>([]);

// Global categories menu composable for cross-component communication
const { openCategoriesDrawer } = useCategoriesMenu();

// Handle category button click
const handleCategoryClick = () => {
  console.log('Category button clicked in marketplace!');
  openCategoriesDrawer();
};

// Mock suggestions data - In a real app, this would come from an API
const allApps = [
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', logo: '/assets/images/integrations/salesforce.svg' },
  { id: 'slack', name: 'Slack', category: 'Communication', logo: '/assets/images/integrations/slack.svg' },
  { id: 'hubspot', name: 'HubSpot', category: 'Marketing', logo: '/assets/images/integrations/hubspot.svg' },
  { id: 'zoom', name: 'Zoom', category: 'Video Conferencing', logo: '/assets/images/integrations/zoom.svg' },
  { id: 'dropbox', name: 'Dropbox', category: 'File Storage', logo: '/assets/images/integrations/dropbox.svg' },
  { id: 'stripe', name: 'Stripe', category: 'Payments', logo: '/assets/images/integrations/stripe.svg' },
  { id: 'asana', name: 'Asana', category: 'Project Management', logo: '/assets/images/integrations/asana.svg' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Email Marketing', logo: '/assets/images/integrations/mailchimp.svg' },
  { id: 'zapier', name: 'Zapier', category: 'Automation', logo: '/assets/images/integrations/zapier.svg' },
  { id: 'jira', name: 'Jira', category: 'Issue Tracking', logo: '/assets/images/integrations/jira.svg' },
  { id: 'trello', name: 'Trello', category: 'Project Management', logo: '/assets/images/integrations/trello.svg' },
  { id: 'zendesk', name: 'Zendesk', category: 'Customer Service', logo: '/assets/images/integrations/zendesk.svg' },
];

const allCategories = [
  'CRM', 'Communication', 'Marketing', 'Video Conferencing', 'File Storage', 
  'Payments', 'Project Management', 'Email Marketing', 'Automation', 
  'Issue Tracking', 'Customer Service', 'Analytics', 'Design', 
  'Development', 'HR', 'Finance', 'Productivity', 'Social Media'
];

// Filter suggestions based on search query
const filteredSuggestions = computed(() => {
  if (!searchQuery.value.trim()) {
    return { apps: [], categories: [] };
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  
  const apps = allApps.filter(app => 
    app.name.toLowerCase().includes(query) || 
    app.category.toLowerCase().includes(query)
  );
  
  const categories = allCategories.filter(category => 
    category.toLowerCase().includes(query)
  );
  
  return { apps, categories };
});

// Handle search functionality
const handleSearch = () => {
  // In a real app, you might want to debounce this
};

// Clear search input
const clearSearch = () => {
  searchQuery.value = '';
};

// Hide suggestions with delay to allow clicks
const hideSuggestionsDelayed = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

// Navigate to app details
const navigateToApp = (appId: string) => {
  saveRecentSearch(searchQuery.value);
  router.push(`/marketplace/${appId}`);
};

// Navigate to category
const navigateToCategory = (category: string) => {
  saveRecentSearch(searchQuery.value);
  router.push(`/marketplace?category=${encodeURIComponent(category)}`);
};

// Perform full search
const performSearch = () => {
  if (searchQuery.value.trim()) {
    saveRecentSearch(searchQuery.value);
    router.push(`/marketplace?search=${encodeURIComponent(searchQuery.value)}`);
  }
};

// Apply recent search
const applyRecentSearch = (query: string) => {
  searchQuery.value = query;
  performSearch();
};

// Save recent search
const saveRecentSearch = (query: string) => {
  if (query.trim()) {
    // Remove if already exists
    const existingIndex = recentSearches.value.indexOf(query);
    if (existingIndex !== -1) {
      recentSearches.value.splice(existingIndex, 1);
    }
    
    // Add to beginning of array
    recentSearches.value.unshift(query);
    
    // Keep only last 5 searches
    if (recentSearches.value.length > 5) {
      recentSearches.value.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value));
  }
};

// Clear recent searches
const clearRecentSearches = () => {
  recentSearches.value = [];
  localStorage.removeItem('recentSearches');
};

// Load recent searches on mount
onMounted(() => {
  try {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      recentSearches.value = JSON.parse(savedSearches);
    }
  } catch (e) {
    console.error('Error loading recent searches:', e);
    localStorage.removeItem('recentSearches');
  }
});
</script>

<style scoped>
.marketplace-search {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto var(--spacing-xl);
  z-index: 100; /* High z-index for dropdown */
}

.search-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-300);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  height: 58px;
  padding: 0 var(--spacing-md);
  overflow: hidden;
  flex: 1;
}

.search-container:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.15);
}

.search-icon {
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text-primary);
  padding: var(--spacing-md) 0;
  font-family: inherit;
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
}

.clear-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-left: var(--spacing-xs);
}

.clear-button:hover {
  background-color: var(--color-gray-100);
  color: var(--text-primary);
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background-color: var(--color-gray-100);
  color: var(--text-primary);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-weight: 500;
  font-size: 0.875rem;
  height: 58px;
  width: 58px;
  flex-shrink: 0;
}

.category-btn:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

/* Search Suggestions */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-200);
  z-index: 100;
  max-height: 500px;
  overflow-y: auto;
}

.suggestion-section {
  border-bottom: 1px solid var(--color-gray-200);
  padding: var(--spacing-md);
}

.suggestion-section:last-child {
  border-bottom: none;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.suggestion-header span {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-all-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
}

.clear-all-button:hover {
  text-decoration: underline;
}

.suggestion-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: var(--color-gray-100);
}

.suggestion-icon {
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
}

.suggestion-app-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  margin-right: var(--spacing-sm);
}

.suggestion-app-info {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.app-category {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.suggestion-footer {
  padding: var(--spacing-sm);
  display: flex;
  justify-content: center;
}

.see-all-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
}

.see-all-button:hover {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .marketplace-search {
    max-width: 100%;
  }
  
  .search-container {
    height: 50px;
  }
  
  .category-btn {
    height: 50px;
    width: 50px;
  }
  
  .search-row {
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .search-row {
    gap: var(--spacing-xs);
  }
  
  .category-btn {
    height: 46px;
    width: 46px;
  }
  
  .search-container {
    height: 46px;
  }
}
</style>
