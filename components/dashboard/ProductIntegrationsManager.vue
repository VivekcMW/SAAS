<template>
  <div class="integrations-manager">
    <!-- Current Integrations -->
    <div class="current-integrations">
      <div class="section-header">
        <h3>Current Integrations</h3>
        <div class="integration-stats">
          <span class="stat">{{ product.integrations.active }} Active</span>
          <span class="stat pending">{{ product.integrations.pending }} Pending</span>
        </div>
      </div>

      <div class="integrations-grid">
        <div 
          v-for="integration in product.integrations.services" 
          :key="integration.name"
          class="integration-card"
          :class="integration.status"
        >
          <div class="integration-header">
            <div class="integration-logo">
              <img :src="integration.icon" :alt="integration.name" />
            </div>
            <div class="integration-info">
              <h4>{{ integration.name }}</h4>
              <span class="integration-status-badge" :class="integration.status">
                {{ capitalizeStatus(integration.status) }}
              </span>
            </div>
            <div class="integration-actions">
              <button 
                v-if="integration.status === 'active'"
                class="action-btn settings"
                @click="configureIntegration(integration)"
                title="Configure"
              >
                <UIcon dynamic name="i-heroicons-cog-6-tooth" />
              </button>
              <button 
                v-if="integration.status === 'pending'"
                class="action-btn approve"
                @click="approveIntegration(integration)"
                title="Approve"
              >
                <UIcon dynamic name="i-heroicons-check" />
              </button>
              <button 
                class="action-btn disconnect"
                @click="disconnectIntegration(integration)"
                :title="integration.status === 'active' ? 'Disconnect' : 'Cancel'"
              >
                <UIcon dynamic name="i-heroicons-x-mark" />
              </button>
            </div>
          </div>

          <div class="integration-details">
            <div class="detail-item">
              <span class="detail-label">Connected:</span>
              <span class="detail-value">{{ formatDate(integration.connectedDate || '2024-01-15') }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Data Synced:</span>
              <span class="detail-value">{{ formatNumber(Math.floor(Math.random() * 10000)) }} records</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Last Sync:</span>
              <span class="detail-value">{{ getLastSyncTime() }}</span>
            </div>
          </div>

          <div v-if="integration.status === 'active'" class="integration-metrics">
            <div class="metric">
              <UIcon dynamic name="i-heroicons-arrow-up" />
              <span>{{ Math.floor(Math.random() * 1000) }} items exported</span>
            </div>
            <div class="metric">
              <UIcon dynamic name="i-heroicons-arrow-down" />
              <span>{{ Math.floor(Math.random() * 500) }} items imported</span>
            </div>
          </div>

          <div v-if="integration.status === 'pending'" class="integration-pending">
            <div class="pending-info">
              <UIcon dynamic name="i-heroicons-clock" />
              <span>Waiting for approval</span>
            </div>
            <p class="pending-description">
              This integration requires approval before it can access your product data.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Integrations -->
    <div class="available-integrations">
      <div class="section-header">
        <h3>Available Integrations</h3>
        <div class="search-integrations">
          <UIcon dynamic name="i-heroicons-magnifying-glass" />
          <input 
            type="text" 
            placeholder="Search integrations..." 
            v-model="searchQuery"
            @input="filterAvailableIntegrations"
          />
        </div>
      </div>

      <div class="integration-categories">
        <button 
          v-for="category in categories" 
          :key="category.value"
          class="category-btn"
          :class="{ active: selectedCategory === category.value }"
          @click="selectedCategory = category.value"
        >
          <UIcon dynamic :name="category.icon" />
          {{ category.label }}
        </button>
      </div>

      <div class="available-grid">
        <div 
          v-for="integration in filteredAvailableIntegrations" 
          :key="integration.name"
          class="available-card"
        >
          <div class="available-header">
            <div class="available-logo">
              <img :src="integration.icon" :alt="integration.name" />
            </div>
            <div class="available-info">
              <h4>{{ integration.name }}</h4>
              <p>{{ integration.description }}</p>
              <div class="available-tags">
                <span 
                  v-for="tag in integration.tags" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="available-features">
            <div class="feature-list">
              <div 
                v-for="feature in integration.features.slice(0, 3)" 
                :key="feature"
                class="feature-item"
              >
                <UIcon dynamic name="i-heroicons-check" />
                <span>{{ feature }}</span>
              </div>
              <div v-if="integration.features.length > 3" class="feature-more">
                +{{ integration.features.length - 3 }} more features
              </div>
            </div>
          </div>

          <div class="available-actions">
            <div class="integration-rating">
              <div class="stars">
                <UIcon dynamic name="i-heroicons-star-solid" />
                <span>{{ integration.rating }}</span>
              </div>
              <span class="review-count">({{ integration.reviews }} reviews)</span>
            </div>
            <button 
              class="connect-btn"
              @click="connectIntegration(integration)"
              :disabled="isConnecting"
            >
              <UIcon dynamic name="i-heroicons-plus" />
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Integration Configuration Modal -->
    <div v-if="showConfigModal" class="config-modal-overlay" @click="closeConfigModal">
      <div class="config-modal" @click.stop>
        <div class="modal-header">
          <h3>Configure {{ selectedIntegration?.name }}</h3>
          <button class="close-btn" @click="closeConfigModal">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        
        <div class="modal-content">
          <div class="config-section">
            <h4>Sync Settings</h4>
            <div class="config-options">
              <label class="config-option">
                <input type="checkbox" v-model="configSettings.syncContacts" />
                <span>Sync Contacts</span>
              </label>
              <label class="config-option">
                <input type="checkbox" v-model="configSettings.syncTasks" />
                <span>Sync Tasks</span>
              </label>
              <label class="config-option">
                <input type="checkbox" v-model="configSettings.syncCalendar" />
                <span>Sync Calendar Events</span>
              </label>
            </div>
          </div>

          <div class="config-section">
            <h4>Sync Frequency</h4>
            <select v-model="configSettings.syncFrequency" class="config-select">
              <option value="real-time">Real-time</option>
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div class="config-section">
            <h4>Data Direction</h4>
            <div class="config-radios">
              <label class="config-radio">
                <input type="radio" v-model="configSettings.dataDirection" value="bidirectional" />
                <span>Bidirectional Sync</span>
              </label>
              <label class="config-radio">
                <input type="radio" v-model="configSettings.dataDirection" value="export-only" />
                <span>Export Only</span>
              </label>
              <label class="config-radio">
                <input type="radio" v-model="configSettings.dataDirection" value="import-only" />
                <span>Import Only</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeConfigModal">Cancel</button>
            <button class="btn btn-primary" @click="saveConfiguration">Save Configuration</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['integration-updated']);

// State
const searchQuery = ref('');
const selectedCategory = ref('all');
const isConnecting = ref(false);
const showConfigModal = ref(false);
const selectedIntegration = ref<any>(null);

// Configuration settings
const configSettings = ref({
  syncContacts: true,
  syncTasks: true,
  syncCalendar: false,
  syncFrequency: 'daily',
  dataDirection: 'bidirectional'
});

// Categories
const categories = [
  { label: 'All', value: 'all', icon: 'i-heroicons-squares-2x2' },
  { label: 'Productivity', value: 'productivity', icon: 'i-heroicons-briefcase' },
  { label: 'Analytics', value: 'analytics', icon: 'i-heroicons-chart-bar' },
  { label: 'Communication', value: 'communication', icon: 'i-heroicons-chat-bubble-left-right' },
  { label: 'Marketing', value: 'marketing', icon: 'i-heroicons-megaphone' },
  { label: 'Development', value: 'development', icon: 'i-heroicons-code-bracket' }
];

// Available integrations
const availableIntegrations = ref([
  {
    name: 'Zapier',
    description: 'Connect your apps and automate workflows',
    icon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop',
    category: 'productivity',
    rating: 4.8,
    reviews: 1250,
    tags: ['Automation', 'Workflows', 'API'],
    features: ['5000+ app connections', 'Multi-step workflows', 'Real-time triggers', 'Custom logic', 'Error handling']
  },
  {
    name: 'Microsoft Power BI',
    description: 'Advanced analytics and business intelligence',
    icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop',
    category: 'analytics',
    rating: 4.6,
    reviews: 892,
    tags: ['Analytics', 'Dashboards', 'Reports'],
    features: ['Interactive dashboards', 'Real-time analytics', 'Custom visualizations', 'Data modeling']
  },
  {
    name: 'Discord',
    description: 'Team communication and collaboration',
    icon: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=64&h=64&fit=crop',
    category: 'communication',
    rating: 4.7,
    reviews: 2100,
    tags: ['Chat', 'Voice', 'Communities'],
    features: ['Voice channels', 'Text messaging', 'Screen sharing', 'Bot integrations']
  },
  {
    name: 'Mailchimp',
    description: 'Email marketing and automation platform',
    icon: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=64&h=64&fit=crop',
    category: 'marketing',
    rating: 4.5,
    reviews: 1680,
    tags: ['Email', 'Marketing', 'Automation'],
    features: ['Email campaigns', 'Marketing automation', 'Audience segmentation', 'A/B testing']
  },
  {
    name: 'GitHub',
    description: 'Code repository and collaboration',
    icon: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=64&h=64&fit=crop',
    category: 'development',
    rating: 4.9,
    reviews: 3200,
    tags: ['Git', 'Code', 'Collaboration'],
    features: ['Git repositories', 'Pull requests', 'Issue tracking', 'Actions automation', 'Code review']
  },
  {
    name: 'Airtable',
    description: 'Spreadsheet-database hybrid for organizing work',
    icon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop',
    category: 'productivity',
    rating: 4.6,
    reviews: 950,
    tags: ['Database', 'Spreadsheet', 'Organization'],
    features: ['Flexible database', 'Rich field types', 'Views and filters', 'Collaboration tools']
  }
]);

// Computed properties
const filteredAvailableIntegrations = computed(() => {
  let filtered = availableIntegrations.value;
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(integration => integration.category === selectedCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(integration => 
      integration.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      integration.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
  }
  
  // Exclude already connected integrations
  const connectedNames = props.product.integrations.services.map((s: any) => s.name);
  filtered = filtered.filter(integration => !connectedNames.includes(integration.name));
  
  return filtered;
});

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getLastSyncTime = () => {
  const times = ['2 minutes ago', '1 hour ago', '3 hours ago', '1 day ago'];
  return times[Math.floor(Math.random() * times.length)];
};

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const filterAvailableIntegrations = () => {
  // Filtering is handled by computed property
};

// Integration actions
const configureIntegration = (integration: any) => {
  selectedIntegration.value = integration;
  showConfigModal.value = true;
};

const approveIntegration = (integration: any) => {
  integration.status = 'active';
  props.product.integrations.active++;
  props.product.integrations.pending--;
  emit('integration-updated', props.product);
  console.log('Integration approved:', integration.name);
};

const disconnectIntegration = (integration: any) => {
  if (confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
    const index = props.product.integrations.services.findIndex((s: any) => s.name === integration.name);
    if (index > -1) {
      props.product.integrations.services.splice(index, 1);
      if (integration.status === 'active') {
        props.product.integrations.active--;
      } else {
        props.product.integrations.pending--;
      }
      props.product.integrations.total--;
      emit('integration-updated', props.product);
      console.log('Integration disconnected:', integration.name);
    }
  }
};

const connectIntegration = async (integration: any) => {
  isConnecting.value = true;
  
  // Simulate connection process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Add to product integrations
  const newIntegration = {
    name: integration.name,
    icon: integration.icon,
    status: 'pending',
    connectedDate: new Date().toISOString()
  };
  
  props.product.integrations.services.push(newIntegration);
  props.product.integrations.pending++;
  props.product.integrations.total++;
  
  emit('integration-updated', props.product);
  isConnecting.value = false;
  
  console.log('Integration connected:', integration.name);
};

// Modal actions
const closeConfigModal = () => {
  showConfigModal.value = false;
  selectedIntegration.value = null;
};

const saveConfiguration = () => {
  console.log('Saving configuration for:', selectedIntegration.value?.name, configSettings.value);
  closeConfigModal();
};
</script>

<style scoped>
.integrations-manager {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.integration-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat {
  font-size: 0.9rem;
  font-weight: 500;
  color: #10b981;
  background: #d1fae5;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
}

.stat.pending {
  color: #f59e0b;
  background: #fef3c7;
}

/* Search */
.search-integrations {
  position: relative;
  width: 300px;
}

.search-integrations svg {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1rem;
  pointer-events: none;
}

.search-integrations input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 40px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  background: white;
}

.search-integrations input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Current Integrations */
.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.integration-card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
}

.integration-card.active {
  border-color: #10b981;
  background: #f0fdf4;
}

.integration-card.pending {
  border-color: #f59e0b;
  background: #fffbeb;
}

.integration-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.integration-logo {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.integration-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.integration-info {
  flex: 1;
}

.integration-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.integration-status-badge {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-sm);
}

.integration-status-badge.active {
  background: #10b981;
  color: white;
}

.integration-status-badge.pending {
  background: #f59e0b;
  color: white;
}

.integration-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.action-btn.settings:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-btn.approve:hover {
  border-color: #10b981;
  color: #10b981;
}

.action-btn.disconnect:hover {
  border-color: #ef4444;
  color: #ef4444;
}

/* Integration Details */
.integration-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--border-radius-md);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* Integration Metrics */
.integration-metrics {
  display: flex;
  gap: var(--spacing-md);
}

.metric {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.metric svg {
  color: #10b981;
  font-size: 0.9rem;
}

/* Pending State */
.integration-pending {
  padding: var(--spacing-md);
  background: #fffbeb;
  border-radius: var(--border-radius-md);
  border: 1px solid #fcd34d;
}

.pending-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  color: #92400e;
  margin-bottom: var(--spacing-xs);
}

.pending-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Categories */
.integration-categories {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: white;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.category-btn:hover:not(.active) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* Available Integrations */
.available-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.available-card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
}

.available-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.available-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.available-logo {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.available-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.available-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.available-info p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-sm);
}

.available-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.tag {
  font-size: 0.7rem;
  background: var(--primary-color-light);
  color: var(--primary-color);
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-sm);
}

/* Features */
.available-features {
  margin-bottom: var(--spacing-md);
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.feature-item svg {
  color: #10b981;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.feature-more {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-left: 16px;
}

/* Available Actions */
.available-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.integration-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stars {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: #fbbf24;
  font-size: 0.9rem;
}

.review-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.connect-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.connect-btn:hover {
  background: var(--primary-color-dark);
}

.connect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Configuration Modal */
.config-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: var(--spacing-lg);
}

.config-modal {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-gray-100);
  color: var(--text-primary);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.config-section {
  margin-bottom: var(--spacing-lg);
}

.config-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.config-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.config-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: white;
  font-size: 0.9rem;
}

.config-radios {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.config-radio {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.btn-secondary {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background: var(--bg-light);
  border-color: var(--primary-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .search-integrations {
    width: 100%;
  }
  
  .integrations-grid,
  .available-grid {
    grid-template-columns: 1fr;
  }
  
  .integration-categories {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: var(--spacing-sm);
  }
  
  .category-btn {
    white-space: nowrap;
  }
  
  .available-actions {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .config-modal {
    margin: var(--spacing-md);
    max-height: calc(100vh - 2 * var(--spacing-md));
  }
}
</style>
