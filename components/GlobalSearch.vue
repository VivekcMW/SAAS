<template>
  <Teleport to="body">
    <div class="global-search-wrapper" :class="{ active: isExpanded }">
      <!-- Collapsed State - Floating Button -->
      <div 
        v-if="!isExpanded" 
        class="global-search-button" 
        @click="expandSearch"
        :title="'Search (⌘K)'"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="search-button-icon" />
      </div>

      <!-- Expanded State - Full Search Bar -->
      <div v-if="isExpanded" class="global-search-expanded">
        <div class="search-bar-container">
          <div class="search-input-wrapper">
            <UIcon name="i-heroicons-magnifying-glass" class="search-input-icon" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search startups, investment opportunities, or software solutions..."
              class="global-search-input"
              @keydown.escape="collapseSearch"
              @keydown.enter="performFullSearch"
              @input="handleSearch"
            />
            <button 
              v-if="searchQuery" 
              @click="clearSearch" 
              class="clear-search-button"
            >
              <UIcon name="i-heroicons-x-mark" class="clear-icon" />
            </button>
          </div>
          
          <button @click="collapseSearch" class="close-search-button">
            <UIcon name="i-heroicons-x-mark" class="close-icon" />
          </button>
        </div>

        <!-- Quick Filters -->
        <div v-if="searchQuery" class="quick-filters">
          <button 
            v-for="filter in quickFilters" 
            :key="filter.id"
            class="quick-filter-button"
            :class="{ active: selectedFilter === filter.id }"
            @click="setFilter(filter.id)"
          >
            <UIcon :name="filter.icon" class="filter-icon" />
            <span>{{ filter.label }}</span>
          </button>
        </div>
      </div>

      <!-- Search Results Overlay -->
      <div 
        v-if="isExpanded && (searchQuery || recentSearches.length > 0)" 
        class="search-results-overlay"
        @click="handleOverlayClick"
      >
        <div class="search-results-container" @click.stop>
          <!-- Recent Searches -->
          <div v-if="!searchQuery && recentSearches.length > 0" class="results-section">
            <div class="section-header">
              <h3>Recent Searches</h3>
              <button @click="clearRecentSearches" class="clear-all-button">Clear All</button>
            </div>
            <div class="results-grid recent-searches">
              <div 
                v-for="(search, index) in recentSearches.slice(0, 6)" 
                :key="index"
                class="recent-search-item"
                @click="applyRecentSearch(search)"
              >
                <UIcon name="i-heroicons-clock" class="recent-icon" />
                <span>{{ search }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div v-if="!searchQuery" class="results-section">
            <div class="section-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="results-grid quick-actions">
              <div 
                v-for="action in quickActions" 
                :key="action.id"
                class="quick-action-item"
                @click="executeQuickAction(action)"
              >
                <UIcon :name="action.icon" class="action-icon" />
                <div class="action-content">
                  <span class="action-title">{{ action.title }}</span>
                  <span class="action-description">{{ action.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchQuery && searchResults.length > 0" class="results-section">
            <div class="section-header">
              <h3>Search Results</h3>
              <span class="results-count">{{ searchResults.length }} results</span>
            </div>
            <div class="results-grid search-results">
              <div 
                v-for="result in filteredResults" 
                :key="result.id"
                class="search-result-item"
                @click="navigateToResult(result)"
              >
                <UIcon :name="result.icon" class="result-icon" />
                <div class="result-content">
                  <span class="result-title">{{ result.title }}</span>
                  <span class="result-type">{{ result.type }}</span>
                  <span v-if="result.description" class="result-description">{{ result.description }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="result-arrow" />
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-if="searchQuery && searchResults.length === 0" class="no-results">
            <UIcon name="i-heroicons-magnifying-glass" class="no-results-icon" />
            <h3>No results found</h3>
            <p>Try adjusting your search terms or browse categories</p>
            <button @click="openCategories" class="browse-categories-button">
              Browse Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalSearch, type SearchResult } from '~/composables/useGlobalSearch'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  action: () => void
}

interface QuickFilter {
  id: string
  label: string
  icon: string
}

// Composables
const router = useRouter()
const {
  performSearch,
  debouncedSearch,
  getQuickActions,
  searchHistory,
  saveToHistory,
  loadHistory,
  clearHistory: clearSearchHistory,
  getPopularSearches
} = useGlobalSearch()

// Reactive state
const isExpanded = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
const selectedFilter = ref('all')
const searchResults = ref<SearchResult[]>([])

// Quick filters
const quickFilters: QuickFilter[] = [
  { id: 'all', label: 'All', icon: 'i-heroicons-squares-2x2' },
  { id: 'category', label: 'Categories', icon: 'i-heroicons-folder' },
  { id: 'subcategory', label: 'Tools', icon: 'i-heroicons-wrench-screwdriver' },
  { id: 'page', label: 'Pages', icon: 'i-heroicons-document-text' }
]

// Quick actions - use composable
const quickActions = computed(() => getQuickActions())

// Recent searches from composable
const recentSearches = computed(() => searchHistory.value)

// Computed
const filteredResults = computed(() => {
  if (selectedFilter.value === 'all') return searchResults.value
  return searchResults.value.filter(result => result.type === selectedFilter.value)
})

// Methods
const expandSearch = async () => {
  isExpanded.value = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  searchInput.value?.focus()
}

const collapseSearch = () => {
  isExpanded.value = false
  searchQuery.value = ''
  selectedFilter.value = 'all'
  searchResults.value = []
  document.body.style.overflow = ''
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  // Use debounced search from composable
  debouncedSearch(searchQuery.value, (results) => {
    searchResults.value = results
  })
}

const performFullSearch = () => {
  if (searchQuery.value.trim()) {
    saveToHistory(searchQuery.value)
    router.push(`/marketplace?search=${encodeURIComponent(searchQuery.value)}`)
    collapseSearch()
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const setFilter = (filterId: string) => {
  selectedFilter.value = filterId
}

const navigateToResult = (result: SearchResult) => {
  if (searchQuery.value.trim()) {
    saveToHistory(searchQuery.value)
  }
  router.push(result.path)
  collapseSearch()
}

const applyRecentSearch = (search: string) => {
  searchQuery.value = search
  handleSearch()
}

const executeQuickAction = (action: QuickAction) => {
  action.action()
  collapseSearch()
}

const navigateTo = (path: string) => {
  router.push(path)
}

const openCategories = () => {
  // This would trigger the categories menu or navigate to marketplace
  router.push('/marketplace')
}

const handleOverlayClick = () => {
  collapseSearch()
}

const clearRecentSearches = () => {
  clearSearchHistory()
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Cmd/Ctrl + K to open search
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    if (isExpanded.value) {
      collapseSearch()
    } else {
      expandSearch()
    }
  }
  
  // Escape to close
  if (event.key === 'Escape' && isExpanded.value) {
    collapseSearch()
  }
}

// Lifecycle
onMounted(() => {
  loadHistory()
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('open-global-search', expandSearch)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('open-global-search', expandSearch)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.global-search-wrapper {
  position: fixed;
  z-index: 9999;
}

/* Collapsed State - Floating Button */
.global-search-button {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.global-search-button:hover {
  transform: translateY(-2px) scale(1.05);
  background: var(--mm-gold-soft);
  border-color: var(--mm-gold);
  box-shadow: var(--shadow-lg);
}

.search-button-icon {
  font-size: var(--fs-title) !important;
  color: var(--mm-gold) !important;
}

/* Expanded State */
.global-search-expanded {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--mm-s1);
  border-top: 0.5px solid var(--b2);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
}

.search-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 0.5px solid var(--b1);
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input-wrapper:focus-within {
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}

.search-input-icon {
  position: absolute;
  left: 16px;
  font-size: var(--fs-title-sm) !important;
  color: var(--mm-slate) !important;
}

.global-search-input {
  width: 100%;
  padding: 14px 16px 14px 52px;
  border: none;
  outline: none;
  font-size: var(--fs-body-lg);
  background: transparent;
  color: var(--mm-pearl);
  font-family: var(--f-ui);
}

.global-search-input::placeholder {
  color: var(--mm-slate);
}

.clear-search-button {
  position: absolute;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--mm-s3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.clear-search-button:hover {
  background: var(--b2);
}

.clear-icon {
  font-size: var(--fs-sm) !important;
  color: var(--mm-slate) !important;
}

.close-search-button {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--mm-s3);
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.close-search-button:hover {
  background: var(--b2);
}

.close-icon {
  font-size: var(--fs-title-sm) !important;
  color: var(--mm-silver) !important;
}

/* Quick Filters */
.quick-filters {
  display: flex;
  gap: 8px;
  padding: 0 24px 16px;
  overflow-x: auto;
}

.quick-filter-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-full);
  background: var(--mm-s2);
  color: var(--mm-silver);
  font-family: var(--f-ui);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.quick-filter-button:hover {
  border-color: var(--mm-gold);
  color: var(--mm-goldl);
  background: var(--mm-gold-soft);
}

.quick-filter-button.active {
  background: var(--mm-gold-soft);
  border-color: var(--mm-gold);
  color: var(--mm-gold);
}

.filter-icon {
  font-size: var(--fs-sm) !important;
}

/* Search Results Overlay */
.search-results-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 120px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 9998;
  overflow-y: auto;
  padding: 24px;
}

.search-results-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.results-section {
  padding: 20px 24px;
  border-bottom: 0.5px solid var(--b1);
}

.results-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 14px;
}

.section-header h3 {
  margin: 0;
  font-size: var(--fs-body-lg);
  font-weight: 600;
  color: var(--mm-pearl);
  font-family: var(--f-ui);
}

.results-count {
  font-size: var(--fs-sm);
  color: var(--mm-slate);
  background: var(--mm-s3);
  padding: 3px 10px;
  border-radius: var(--r-sm);
}

.clear-all-button {
  font-size: var(--fs-sm);
  color: var(--mm-gold);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--r-sm);
  transition: background 0.15s ease;
  font-family: var(--f-ui);
}

.clear-all-button:hover {
  background: var(--mm-gold-soft);
}

/* Results Grid */
.results-grid {
  display: grid;
  gap: 6px;
}

.recent-searches {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.quick-actions {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.search-results {
  grid-template-columns: 1fr;
}

/* Result Items */
.recent-search-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  cursor: pointer;
  color: var(--mm-silver);
  font-size: var(--fs-sm);
  transition: all 0.15s ease;
}

.recent-search-item:hover {
  background: var(--mm-s3);
  color: var(--mm-pearl);
  border-color: var(--b2);
}

.recent-icon {
  font-size: var(--fs-base) !important;
  color: var(--mm-slate) !important;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--mm-s2);
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-action-item:hover {
  background: var(--mm-gold-soft);
  border-color: var(--mm-gold);
}

.action-icon {
  font-size: var(--fs-title) !important;
  color: var(--mm-gold) !important;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-title {
  font-weight: 500;
  color: var(--mm-pearl);
  font-size: var(--fs-sm);
}

.action-description {
  font-size: var(--fs-sm);
  color: var(--mm-slate);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.search-result-item:hover {
  border-color: var(--mm-gold);
  background: var(--mm-gold-soft);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 168, 67, 0.1);
}

.result-icon {
  font-size: var(--fs-title-sm) !important;
  color: var(--mm-gold) !important;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-title {
  font-weight: 500;
  color: var(--mm-pearl);
  font-size: var(--fs-sm);
}

.result-type {
  font-size: var(--fs-caption);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--mm-gold);
  font-weight: 600;
}

.result-description {
  font-size: var(--fs-sm);
  color: var(--mm-slate);
}

.result-arrow {
  font-size: var(--fs-base) !important;
  color: var(--mm-slate) !important;
}

/* No Results */
.no-results {
  padding: 48px 24px;
  text-align: center;
}

.no-results-icon {
  font-size: var(--fs-section) !important;
  color: var(--mm-slate) !important;
  margin-bottom: 16px;
}

.no-results h3 {
  margin: 0 0 8px;
  font-size: var(--fs-title-sm);
  color: var(--mm-pearl);
}

.no-results p {
  margin: 0 0 24px;
  color: var(--mm-silver);
}

.browse-categories-button {
  padding: 10px 22px;
  background: var(--mm-gold);
  color: #0A0700;
  border: none;
  border-radius: var(--r-sm);
  font-weight: 600;
  font-family: var(--f-ui);
  cursor: pointer;
  transition: background 0.15s ease;
}

.browse-categories-button:hover {
  background: var(--mm-goldl);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .global-search-button {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
  }

  .search-button-icon {
    font-size: var(--fs-title-sm) !important;
  }

  .search-bar-container {
    padding: 12px 16px;
  }

  .search-results-overlay {
    padding: 16px;
    bottom: 100px;
  }

  .results-section {
    padding: 16px;
  }

  .recent-searches,
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .quick-filters {
    padding: 0 16px 12px;
  }
}

/* Animations */
.global-search-wrapper.active .global-search-expanded {
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-results-overlay {
  animation: fadeIn 0.2s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}
</style>
