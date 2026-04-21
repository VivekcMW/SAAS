<template>
  <section class="marketplace-hero">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">Discover the Best <span class="highlight">Applications</span> for Your Business</h1>
        <p class="hero-subtitle">Explore our curated marketplace of powerful tools and services to enhance your business workflow</p>
      </div>
      
      <!-- Marketplace Search -->
      <div class="marketplace-search">
        <div class="search-row">
          <div class="search-container">
            <div class="search-icon">
              <UIcon name="i-heroicons-magnifying-glass" dynamic />
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
              <UIcon name="i-heroicons-x-mark" dynamic />
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
                <UIcon name="i-heroicons-clock" dynamic class="suggestion-icon" />
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
          <div v-if="searchQuery && filteredSuggestions.categories && filteredSuggestions.categories.length > 0" class="suggestion-section">
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
                <UIcon name="i-heroicons-tag" dynamic class="suggestion-icon" />
                <span>{{ category }}</span>
              </div>
            </div>
          </div>
          
          <!-- See all results -->
          <div v-if="searchQuery" class="suggestion-footer">
            <button @mousedown="performSearch" class="see-all-button">
              <UIcon name="i-heroicons-magnifying-glass" dynamic />
              <span>See all results for "{{ searchQuery }}"</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sponsored Apps Row -->
      <div class="apps-section">
        <div class="section-header">
          <h2 class="section-title">
            <UIcon name="i-heroicons-sparkles" class="section-icon" dynamic />
            Sponsored Apps
          </h2>
          <button class="view-all-btn" @click="viewAllSponsored">
            View All
            <UIcon name="i-heroicons-arrow-right" dynamic />
          </button>
        </div>
        
        <div class="apps-row" ref="sponsoredRow">
          <div class="apps-grid">
            <div 
              v-for="(app, index) in sponsoredApps.slice(0, 4)" 
              :key="`sponsored-${index}`" 
              class="app-card sponsored"
              @click="navigateToApp(app.id)"
            >
              <div class="app-badge sponsored">Sponsored</div>
              <img :src="app.logo" :alt="app.name" class="app-logo">
              <h3 class="app-name">{{ app.name }}</h3>
              <p class="app-category">{{ app.category }}</p>
              <div class="app-rating">
                <div class="stars">
                  <UIcon 
                    v-for="i in 5" 
                    :key="i" 
                    :name="i <= Math.floor(app.rating) ? 'i-heroicons-star-solid' : (i - 0.5 <= app.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star')" 
                    class="star-icon"
                    :class="{ 'filled': i <= Math.floor(app.rating), 'half-filled': i - 0.5 <= app.rating && i > Math.floor(app.rating) }"
                    dynamic
                  />
                </div>
                <span class="rating-value">{{ app.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trending Apps Row -->
      <div class="apps-section">
        <div class="section-header">
          <h2 class="section-title">
            <UIcon name="i-heroicons-arrow-trending-up" class="section-icon" dynamic />
            Trending Now
          </h2>
          <button class="view-all-btn" @click="viewAllTrending">
            View All
            <UIcon name="i-heroicons-arrow-right" dynamic />
          </button>
        </div>
        
        <div class="apps-row" ref="trendingRow">
          <div class="apps-grid">
            <div 
              v-for="(app, index) in trendingApps.slice(0, 4)" 
              :key="`trending-${index}`" 
              class="app-card trending"
              @click="navigateToApp(app.id)"
            >
              <img :src="app.logo" :alt="app.name" class="app-logo">
              <h3 class="app-name">{{ app.name }}</h3>
              <p class="app-category">{{ app.category }}</p>
              <div class="app-rating">
                <div class="stars">
                  <UIcon 
                    v-for="i in 5" 
                    :key="i" 
                    :name="i <= Math.floor(app.rating) ? 'i-heroicons-star-solid' : (i - 0.5 <= app.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star')" 
                    class="star-icon"
                    :class="{ 'filled': i <= Math.floor(app.rating), 'half-filled': i - 0.5 <= app.rating && i > Math.floor(app.rating) }"
                    dynamic
                  />
                </div>
                <span class="rating-value">{{ app.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Search functionality
const searchQuery = ref('');
const showSuggestions = ref(false);
const recentSearches = ref<string[]>([]);

// Global categories menu composable for cross-component communication
const { openCategoriesDrawer } = useCategoriesMenu();

// Mock data for search suggestions
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

// Mock data - In a real app, this would come from an API
const sponsoredApps = [
  { 
    id: 'salesforce', 
    name: 'Salesforce', 
    category: 'CRM', 
    logo: '/assets/images/integrations/salesforce.svg',
    rating: 4.8 
  },
  { 
    id: 'slack', 
    name: 'Slack', 
    category: 'Communication', 
    logo: '/assets/images/integrations/slack.svg',
    rating: 4.7 
  },
  { 
    id: 'hubspot', 
    name: 'HubSpot', 
    category: 'Marketing', 
    logo: '/assets/images/integrations/hubspot.svg',
    rating: 4.6 
  },
  { 
    id: 'zoom', 
    name: 'Zoom', 
    category: 'Video Conferencing', 
    logo: '/assets/images/integrations/zoom.svg',
    rating: 4.5 
  },
  { 
    id: 'dropbox', 
    name: 'Dropbox', 
    category: 'File Storage', 
    logo: '/assets/images/integrations/dropbox.svg',
    rating: 4.5 
  },
  { 
    id: 'stripe', 
    name: 'Stripe', 
    category: 'Payments', 
    logo: '/assets/images/integrations/stripe.svg',
    rating: 4.9 
  },
];

const trendingApps = [
  { 
    id: 'asana', 
    name: 'Asana', 
    category: 'Project Management', 
    logo: '/assets/images/integrations/asana.svg',
    rating: 4.6 
  },
  { 
    id: 'mailchimp', 
    name: 'Mailchimp', 
    category: 'Email Marketing', 
    logo: '/assets/images/integrations/mailchimp.svg',
    rating: 4.4 
  },
  { 
    id: 'zapier', 
    name: 'Zapier', 
    category: 'Automation', 
    logo: '/assets/images/integrations/zapier.svg',
    rating: 4.7 
  },
  { 
    id: 'jira', 
    name: 'Jira', 
    category: 'Issue Tracking', 
    logo: '/assets/images/integrations/jira.svg',
    rating: 4.5 
  },
  { 
    id: 'trello', 
    name: 'Trello', 
    category: 'Project Management', 
    logo: '/assets/images/integrations/trello.svg',
    rating: 4.3 
  },
  { 
    id: 'zendesk', 
    name: 'Zendesk', 
    category: 'Customer Service', 
    logo: '/assets/images/integrations/zendesk.svg',
    rating: 4.6 
  },
];

// Search functionality methods
const handleCategoryClick = () => {
  console.log('Category button clicked in marketplace hero!');
  openCategoriesDrawer();
};

const handleSearch = () => {
  // In a real app, you might want to debounce this
};

const clearSearch = () => {
  searchQuery.value = '';
};

const hideSuggestionsDelayed = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const navigateToCategory = (category: string) => {
  saveRecentSearch(searchQuery.value);
  router.push(`/marketplace?category=${encodeURIComponent(category)}`);
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    saveRecentSearch(searchQuery.value);
    router.push(`/marketplace?search=${encodeURIComponent(searchQuery.value)}`);
  }
};

const applyRecentSearch = (query: string) => {
  searchQuery.value = query;
  performSearch();
};

const saveRecentSearch = (query: string) => {
  if (query.trim()) {
    const existingIndex = recentSearches.value.indexOf(query);
    if (existingIndex !== -1) {
      recentSearches.value.splice(existingIndex, 1);
    }
    
    recentSearches.value.unshift(query);
    
    if (recentSearches.value.length > 5) {
      recentSearches.value.pop();
    }
    
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value));
  }
};

const clearRecentSearches = () => {
  recentSearches.value = [];
  localStorage.removeItem('recentSearches');
};

// Navigate to application details page
const navigateToApp = (appId: string) => {
  if (searchQuery.value.trim()) {
    saveRecentSearch(searchQuery.value);
  }
  router.push(`/marketplace/${appId}`);
};

// View all sponsored apps
const viewAllSponsored = () => {
  router.push('/marketplace?filter=sponsored');
};

// View all trending apps
const viewAllTrending = () => {
  router.push('/marketplace?filter=trending');
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
.marketplace-hero {
  background: linear-gradient(135deg, var(--bg-gray) 0%, #fff 100%);
  padding: calc(var(--spacing-xxl) * 1.5) 0 var(--spacing-xl);
  position: relative;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto var(--spacing-xl);
}

.hero-title {
  font-size: var(--fs-hero);
  line-height: var(--lh-display);
  margin-bottom: var(--spacing-lg);
}

.highlight {
  color: var(--primary-color);
  position: relative;
  display: inline-block;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 0;
  width: 100%;
  height: 8px;
  background-color: var(--secondary-color);
  z-index: -1;
  opacity: 0.5;
}

.hero-subtitle {
  font-size: var(--fs-body-lg);
  font-weight: 300;
  color: var(--text-secondary);
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--lh-body);
}

/* Apps Sections */
.marketplace-search {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto var(--spacing-xxl);
  z-index: 100;
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
  font-size: var(--fs-base);
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
  font-size: var(--fs-sm);
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
  font-size: var(--fs-caption);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-all-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--fs-caption);
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

.suggestion-app-info .app-name {
  font-weight: 500;
  font-size: var(--fs-base);
}

.suggestion-app-info .app-category {
  font-size: var(--fs-caption);
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

.apps-section {
  margin-bottom: var(--spacing-xxl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

/* Apps Grid */
.apps-row {
  position: relative;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.app-card {
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.app-card.sponsored {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(45deg, #ffd700, #4f46e5, #ffd700) border-box;
}

.app-card.sponsored:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 30px rgba(255, 215, 0, 0.3);
}

.app-card.trending {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(45deg, #ff6b6b, #ff8e8e, #ff6b6b) border-box;
}

.app-card.trending:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 30px rgba(255, 107, 107, 0.3);
}

.app-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: var(--fs-caption);
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-badge.sponsored {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #92400e;
  border: 1px solid #fbbf24;
}

.app-logo {
  height: 70px;
  width: auto;
  max-width: 70%;
  margin-bottom: var(--spacing-md);
  object-fit: contain;
}

.app-name {
  font-size: var(--fs-title-sm);
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
  font-weight: 600;
}

.app-category {
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  margin-bottom: var(--spacing-sm);
}

.app-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-icon {
  width: 16px;
  height: 16px;
  color: #d1d5db;
}

.star-icon.filled {
  color: #fbbf24;
}

.star-icon.half-filled {
  color: #fbbf24;
}

.rating-value {
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--text-primary);
}

/* Responsive Styles */
@media (max-width: 992px) {
  .apps-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--fs-section);
  }
  
  .apps-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
  
  .section-title {
    font-size: var(--fs-title-sm);
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: var(--fs-heading);
  }
  
  .apps-grid {
    grid-template-columns: 1fr;
  }
  
  .app-logo {
    height: 50px;
  }
  
  .app-card {
    padding: var(--spacing-md);
  }
  
  .section-title {
    font-size: var(--fs-title-sm);
  }
  
  .apps-section {
    margin-bottom: var(--spacing-xl);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .app-card.sponsored,
  .app-card.trending {
    border-color: #000000;
  }
  
  .star-icon.filled {
    color: #000000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .app-card,
  .view-all-btn {
    transition: none;
  }
  
  .app-card:hover,
  .app-card.sponsored:hover,
  .app-card.trending:hover {
    transform: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .app-card {
    background: #1f2937;
    border-color: #374151;
  }
  
  .app-card.sponsored {
    background: linear-gradient(#1f2937, #1f2937) padding-box,
                linear-gradient(45deg, #ffd700, #4f46e5, #ffd700) border-box;
  }
  
  .app-card.trending {
    background: linear-gradient(#1f2937, #1f2937) padding-box,
                linear-gradient(45deg, #ff6b6b, #ff8e8e, #ff6b6b) border-box;
  }
  
  .app-name {
    color: #f9fafb;
  }
  
  .rating-value {
    color: #e5e7eb;
  }
  
  .app-category {
    color: #9ca3af;
  }
}
</style>
