<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Admin Header -->
      <div class="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage application submissions and marketplace content</p>
      </div>

      <!-- Admin Tabs -->
      <div class="admin-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <UIcon :name="tab.icon" dynamic />
          {{ tab.label }}
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Application Review Tab -->
        <div v-if="activeTab === 'reviews'" class="tab-panel">
          <AdminReviewDashboard />
        </div>

        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'" class="tab-panel">
          <div class="analytics-dashboard">
            <h2>Marketplace Analytics</h2>
            
            <!-- Key Metrics -->
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-icon">
                  <UIcon name="i-heroicons-eye" dynamic />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ analytics.totalViews.toLocaleString() }}</div>
                  <div class="metric-label">Total Views</div>
                  <div class="metric-change positive">+12.3% from last month</div>
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">
                  <UIcon name="i-heroicons-cursor-arrow-rays" dynamic />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ analytics.totalClicks.toLocaleString() }}</div>
                  <div class="metric-label">App Clicks</div>
                  <div class="metric-change positive">+8.7% from last month</div>
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">
                  <UIcon name="i-heroicons-rocket-launch" dynamic />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ analytics.newSubmissions }}</div>
                  <div class="metric-label">New Submissions</div>
                  <div class="metric-change neutral">This month</div>
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-icon">
                  <UIcon name="i-heroicons-check-circle" dynamic />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ analytics.publishedApps }}</div>
                  <div class="metric-label">Published Apps</div>
                  <div class="metric-change positive">+{{ analytics.newPublished }} this month</div>
                </div>
              </div>
            </div>

            <!-- Charts placeholder -->
            <div class="charts-section">
              <div class="chart-card">
                <h3>Application Submissions Over Time</h3>
                <div class="chart-placeholder">
                  <p>Chart visualization would be implemented here using a library like Chart.js or D3.js</p>
                </div>
              </div>
              
              <div class="chart-card">
                <h3>Top Categories</h3>
                <div class="chart-placeholder">
                  <p>Category breakdown chart would be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-panel">
          <div class="settings-dashboard">
            <h2>Admin Settings</h2>
            
            <div class="settings-sections">
              <!-- Review Settings -->
              <div class="settings-section">
                <h3>Review Process</h3>
                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" v-model="settings.autoApprove" />
                    Auto-approve applications from verified companies
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    Review deadline (days):
                    <input 
                      type="number" 
                      v-model="settings.reviewDeadline" 
                      min="1" 
                      max="30"
                      class="setting-input"
                    />
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" v-model="settings.emailNotifications" />
                    Send email notifications for new submissions
                  </label>
                </div>
              </div>

              <!-- Marketplace Settings -->
              <div class="settings-section">
                <h3>Marketplace Display</h3>
                <div class="setting-item">
                  <label class="setting-label">
                    Featured apps limit:
                    <input 
                      type="number" 
                      v-model="settings.featuredLimit" 
                      min="1" 
                      max="20"
                      class="setting-input"
                    />
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" v-model="settings.showAnalytics" />
                    Show view/click analytics to app owners
                  </label>
                </div>
              </div>

              <!-- Content Moderation -->
              <div class="settings-section">
                <h3>Content Moderation</h3>
                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" v-model="settings.moderateReviews" />
                    Moderate user reviews before publishing
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" v-model="settings.requireScreenshots" />
                    Require at least one screenshot for approval
                  </label>
                </div>
              </div>
            </div>

            <div class="settings-actions">
              <button class="btn btn-primary" @click="saveSettings">
                Save Settings
              </button>
              <button class="btn btn-outline" @click="resetSettings">
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>

        <!-- Content Management Tab -->
        <div v-if="activeTab === 'content'" class="tab-panel">
          <div class="content-dashboard">
            <h2>Content Management</h2>
            
            <div class="content-sections">
              <!-- Categories Management -->
              <div class="content-section">
                <div class="section-header">
                  <h3>Categories</h3>
                  <button class="btn btn-sm btn-primary" @click="showAddCategory = true">
                    <UIcon name="i-heroicons-plus" dynamic />
                    Add Category
                  </button>
                </div>
                
                <div class="categories-list">
                  <div v-for="category in categories" :key="category.id" class="category-item">
                    <div class="category-info">
                      <span class="category-name">{{ category.name }}</span>
                      <span class="category-count">{{ category.appCount }} apps</span>
                    </div>
                    <div class="category-actions">
                      <button class="btn btn-sm btn-outline" @click="editCategory(category)">
                        Edit
                      </button>
                      <button class="btn btn-sm btn-danger" @click="deleteCategory(category)">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tags Management -->
              <div class="content-section">
                <div class="section-header">
                  <h3>Popular Tags</h3>
                  <button class="btn btn-sm btn-primary" @click="refreshTags">
                    <UIcon name="i-heroicons-arrow-path" dynamic />
                    Refresh
                  </button>
                </div>
                
                <div class="tags-cloud">
                  <span 
                    v-for="tag in popularTags" 
                    :key="tag.name"
                    class="tag-item"
                    :style="{ fontSize: getTagSize(tag.count) + 'px' }"
                  >
                    {{ tag.name }} ({{ tag.count }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Page metadata
definePageMeta({
  middleware: 'auth', // Add auth middleware to protect admin pages
  layout: 'dashboard'
});

// SEO
useHead({
  title: 'Admin Dashboard - SaaSWorld',
  meta: [
    { name: 'description', content: 'Admin dashboard for managing SaaSWorld marketplace applications and content.' },
    { name: 'robots', content: 'noindex, nofollow' } // Don't index admin pages
  ]
});

// Component state
const activeTab = ref('reviews');
const showAddCategory = ref(false);

// Tabs configuration
const tabs = computed(() => [
  {
    id: 'reviews',
    label: 'Application Reviews',
    icon: 'i-heroicons-document-check',
    count: 5 // Number of pending reviews
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'i-heroicons-chart-bar'
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: 'i-heroicons-folder'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth'
  }
]);

// Analytics data
const analytics = ref({
  totalViews: 15234,
  totalClicks: 3456,
  newSubmissions: 12,
  publishedApps: 156,
  newPublished: 8
});

// Settings
const settings = ref({
  autoApprove: false,
  reviewDeadline: 7,
  emailNotifications: true,
  featuredLimit: 6,
  showAnalytics: true,
  moderateReviews: true,
  requireScreenshots: true
});

// Categories
const categories = ref([
  { id: 1, name: 'CRM', appCount: 24 },
  { id: 2, name: 'Productivity', appCount: 31 },
  { id: 3, name: 'Marketing', appCount: 18 },
  { id: 4, name: 'Analytics', appCount: 15 },
  { id: 5, name: 'Development', appCount: 22 },
  { id: 6, name: 'Finance', appCount: 12 }
]);

// Popular tags
const popularTags = ref([
  { name: 'CRM', count: 45 },
  { name: 'productivity', count: 38 },
  { name: 'marketing', count: 32 },
  { name: 'analytics', count: 28 },
  { name: 'automation', count: 25 },
  { name: 'collaboration', count: 22 },
  { name: 'data', count: 20 },
  { name: 'integration', count: 18 },
  { name: 'sales', count: 16 },
  { name: 'finance', count: 14 }
]);

// Methods
const saveSettings = async () => {
  try {
    // In production, save to API
    console.log('Saving settings:', settings.value);
    // Show success message
    alert('Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings. Please try again.');
  }
};

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    settings.value = {
      autoApprove: false,
      reviewDeadline: 7,
      emailNotifications: true,
      featuredLimit: 6,
      showAnalytics: true,
      moderateReviews: true,
      requireScreenshots: true
    };
  }
};

const editCategory = (category: any) => {
  const newName = prompt('Enter new category name:', category.name);
  if (newName && newName.trim()) {
    category.name = newName.trim();
    // In production, save to API
    console.log('Updated category:', category);
  }
};

const deleteCategory = (category: any) => {
  if (confirm(`Are you sure you want to delete the "${category.name}" category? This will affect ${category.appCount} apps.`)) {
    const index = categories.value.findIndex(c => c.id === category.id);
    if (index > -1) {
      categories.value.splice(index, 1);
      // In production, delete via API
      console.log('Deleted category:', category);
    }
  }
};

const refreshTags = async () => {
  try {
    // In production, fetch from API
    console.log('Refreshing tags...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Tags refreshed');
  } catch (error) {
    console.error('Error refreshing tags:', error);
  }
};

const getTagSize = (count: number) => {
  const minSize = 12;
  const maxSize = 24;
  const maxCount = Math.max(...popularTags.value.map(t => t.count));
  return minSize + (count / maxCount) * (maxSize - minSize);
};

// Load admin data on mount
onMounted(async () => {
  try {
    // In production, load admin data from API
    console.log('Loading admin dashboard data...');
  } catch (error) {
    console.error('Error loading admin data:', error);
  }
});
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background-color: var(--light-color);
  padding: 2rem 0;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Admin Header */
.admin-header {
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.admin-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Tabs */
.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--text-primary);
  background: rgba(59, 130, 246, 0.05);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.05);
}

.tab-count {
  background: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  min-height: 600px;
}

.tab-panel {
  padding: 2rem;
}

/* Analytics Dashboard */
.analytics-dashboard h2 {
  margin: 0 0 2rem 0;
  color: var(--text-primary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.metric-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.metric-change.positive {
  color: #059669;
}

.metric-change.neutral {
  color: var(--text-secondary);
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.chart-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-style: italic;
  background: white;
  border-radius: 8px;
}

/* Settings Dashboard */
.settings-dashboard h2 {
  margin: 0 0 2rem 0;
  color: var(--text-primary);
}

.settings-sections {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.settings-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
}

.settings-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
}

.setting-input {
  margin-left: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 80px;
}

.settings-actions {
  display: flex;
  gap: 1rem;
}

/* Content Dashboard */
.content-dashboard h2 {
  margin: 0 0 2rem 0;
  color: var(--text-primary);
}

.content-sections {
  display: grid;
  gap: 2rem;
}

.content-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.categories-list {
  display: grid;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-name {
  font-weight: 600;
  color: var(--text-primary);
}

.category-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.tag-item {
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.tag-item:hover {
  color: #2563eb;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: var(--text-primary);
}

.btn-outline:hover {
  background: #f9fafb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 0 1rem;
  }
  
  .admin-tabs {
    flex-wrap: wrap;
  }
  
  .tab-panel {
    padding: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-actions {
    flex-direction: column;
  }
  
  .category-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .category-actions {
    justify-content: stretch;
  }
  
  .category-actions .btn {
    flex: 1;
  }
}
</style>
