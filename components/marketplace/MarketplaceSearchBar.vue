<!-- Reusable Marketplace Search Bar Component -->
<template>
  <div class="marketplace-search">
    <div class="search-row">
      <div class="search-container">
        <div class="search-icon">
          <UIcon name="i-heroicons-magnifying-glass" dynamic  />
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search for applications, categories, or keywords..."
          class="search-input"
          @input="handleSearch"
          @focus="showSuggestions = true" 
          @blur="hideSuggestionsDelayed"
        >
        <button v-if="searchQuery" class="clear-button" @click="clearSearch">
          <UIcon name="i-heroicons-x-mark" dynamic  />
        </button>
      </div>
      <button class="category-btn" title="Browse Categories" @click="handleCategoryClick">
        <UIcon name="i-heroicons-squares-2x2" dynamic />
      </button>
    </div>
    
    <!-- Search Suggestions Dropdown -->
    <div v-show="showSuggestions && (searchQuery || recentSearches.length > 0)" class="search-suggestions">
      <!-- Recent searches -->
      <div v-if="recentSearches.length > 0 && !searchQuery" class="suggestion-section">
        <div class="suggestion-header">
          <span>Recent Searches</span>
          <button class="clear-all-button" @click="clearRecentSearches">Clear All</button>
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
      <div v-if="searchQuery && filteredSuggestions.apps.length > 0" class="suggestion-section">
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
            <img :src="app.logo" :alt="app.name" class="suggestion-app-logo" >
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
        <button class="see-all-button" @mousedown="performSearch">
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
import { useCategoriesMenu } from '~/composables/useCategoriesMenu';

const router = useRouter();
const searchQuery = ref('');
const showSuggestions = ref(false);
const recentSearches = ref<string[]>([]);

// Global categories menu composable for cross-component communication
const { openCategoriesDrawer } = useCategoriesMenu();

// Handle category button click
const handleCategoryClick = () => {
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
  router.push(`/marketplace/app/${appId}`);
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
  z-index: 100;
}

.search-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.search-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--mm-s2);
  border: .5px solid var(--b2);
  border-radius: var(--r-md);
  padding: 0 12px;
  transition: all 0.2s ease;
}

.search-container:focus-within {
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}

.search-icon {
  color: var(--mm-slate);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 8px;
  font-size: var(--t-base);
  color: var(--mm-pearl);
  outline: none;
  font-family: var(--f-ui);
}

.search-input::placeholder {
  color: var(--mm-slate);
}

.clear-button {
  background: none;
  border: none;
  color: var(--mm-slate);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.clear-button:hover {
  color: var(--mm-pearl);
}

.category-btn {
  background: var(--mm-s2);
  border: .5px solid var(--b2);
  border-radius: var(--r-md);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--mm-silver);
}

.category-btn:hover {
  background: var(--mm-s3);
  border-color: var(--mm-gold);
  color: var(--mm-goldl);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--mm-s2);
  border: .5px solid var(--b2);
  border-top: none;
  border-radius: 0 0 var(--r-md) var(--r-md);
  margin-top: 0;
  box-shadow: var(--shadow-md);
  max-height: 400px;
  overflow-y: auto;
  z-index: 10;
}

.suggestion-section {
  border-bottom: .5px solid var(--b1);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  color: var(--mm-slate);
  font-size: var(--t-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--mm-s3);
}

.clear-all-button {
  background: none;
  border: none;
  color: var(--mm-gold);
  cursor: pointer;
  font-size: var(--t-xs);
  font-weight: 500;
  transition: color 0.2s ease;
}

.clear-all-button:hover {
  color: var(--mm-goldl);
}

.suggestion-items {
  padding: 8px 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.suggestion-item:hover {
  background: var(--mm-s3);
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  color: var(--mm-slate);
  flex-shrink: 0;
}

.suggestion-item.recent .suggestion-icon {
  color: var(--mm-slate);
}

.suggestion-item.app {
  gap: 12px;
}

.suggestion-app-logo {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  object-fit: contain;
  background: var(--mm-s3);
  flex-shrink: 0;
}

.suggestion-app-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.app-name {
  font-size: var(--t-sm);
  font-weight: 500;
  color: var(--mm-pearl);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-category {
  font-size: var(--t-xs);
  color: var(--mm-slate);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-footer {
  padding: 8px 0;
  border-top: .5px solid var(--b1);
}

.see-all-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--mm-gold);
  cursor: pointer;
  font-size: var(--t-sm);
  font-weight: 500;
  transition: background 0.15s ease;
}

.see-all-button:hover {
  background: var(--mm-gold-soft);
  color: var(--mm-goldl);
}

@media (max-width: 768px) {
  .marketplace-search {
    margin-bottom: var(--spacing-lg);
  }

  .search-suggestions {
    position: fixed;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--r-xl) var(--r-xl) 0 0;
    max-height: 60vh;
  }
}
</style>
