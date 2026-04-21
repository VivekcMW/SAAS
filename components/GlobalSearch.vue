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
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
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
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.global-search-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
}

.search-button-icon {
  font-size: var(--fs-title) !important;
  color: white !important;
}

/* Expanded State */
.global-search-expanded {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.search-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-input-icon {
  position: absolute;
  left: 16px;
  font-size: var(--fs-title-sm) !important;
  color: #6b7280 !important;
}

.global-search-input {
  width: 100%;
  padding: 16px 16px 16px 52px;
  border: none;
  outline: none;
  font-size: var(--fs-body-lg);
  background: transparent;
  color: #111827;
}

.global-search-input::placeholder {
  color: #9ca3af;
}

.clear-search-button {
  position: absolute;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search-button:hover {
  background: #e5e7eb;
}

.clear-icon {
  font-size: var(--fs-sm) !important;
  color: #6b7280 !important;
}

.close-search-button {
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-search-button:hover {
  background: #e5e7eb;
}

.close-icon {
  font-size: var(--fs-title-sm) !important;
  color: #6b7280 !important;
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
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: white;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.quick-filter-button:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.quick-filter-button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
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
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  z-index: 9998;
  overflow-y: auto;
  padding: 24px;
}

.search-results-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.results-section {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.results-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: var(--fs-body-lg);
  font-weight: 600;
  color: #111827;
}

.results-count {
  font-size: var(--fs-sm);
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 12px;
}

.clear-all-button {
  font-size: var(--fs-sm);
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-all-button:hover {
  background: #f0f9ff;
}

/* Results Grid */
.results-grid {
  display: grid;
  gap: 8px;
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
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recent-search-item:hover {
  background: #f3f4f6;
}

.recent-icon {
  font-size: var(--fs-base) !important;
  color: #6b7280 !important;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-item:hover {
  background: #f0f9ff;
  border-color: #3b82f6;
}

.action-icon {
  font-size: var(--fs-title) !important;
  color: #3b82f6 !important;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-title {
  font-weight: 500;
  color: #111827;
}

.action-description {
  font-size: var(--fs-sm);
  color: #6b7280;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.result-icon {
  font-size: var(--fs-title-sm) !important;
  color: #3b82f6 !important;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-title {
  font-weight: 500;
  color: #111827;
}

.result-type {
  font-size: var(--fs-caption);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #3b82f6;
  font-weight: 500;
}

.result-description {
  font-size: var(--fs-sm);
  color: #6b7280;
}

.result-arrow {
  font-size: var(--fs-base) !important;
  color: #9ca3af !important;
}

/* No Results */
.no-results {
  padding: 48px 24px;
  text-align: center;
}

.no-results-icon {
  font-size: var(--fs-section) !important;
  color: #d1d5db !important;
  margin-bottom: 16px;
}

.no-results h3 {
  margin: 0 0 8px;
  font-size: var(--fs-title-sm);
  color: #111827;
}

.no-results p {
  margin: 0 0 24px;
  color: #6b7280;
}

.browse-categories-button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.browse-categories-button:hover {
  background: #2563eb;
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
