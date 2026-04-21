<template>
  <div class="integrations-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ product?.name }} - Integrations</h1>
          <p>Manage and configure integrations for your application</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-primary" @click="showAddIntegration = true">
            <UIcon dynamic name="i-heroicons-plus" />
            Add Integration
          </button>
        </div>
      </div>
    </div>

    <!-- Integration Overview Stats -->
    <div class="integration-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <UIcon dynamic name="i-heroicons-puzzle-piece" />
        </div>
        <div class="stat-content">
          <h3>{{ product?.integrations.active || 0 }}</h3>
          <p>Active Integrations</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">
          <UIcon dynamic name="i-heroicons-clock" />
        </div>
        <div class="stat-content">
          <h3>{{ product?.integrations.pending || 0 }}</h3>
          <p>Pending Setup</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon available">
          <UIcon dynamic name="i-heroicons-plus-circle" />
        </div>
        <div class="stat-content">
          <h3>{{ availableIntegrations.length }}</h3>
          <p>Available</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon success">
          <UIcon dynamic name="i-heroicons-check-circle" />
        </div>
        <div class="stat-content">
          <h3>{{ Math.round(((product?.integrations.active || 0) / (product?.integrations.total || 1)) * 100) }}%</h3>
          <p>Integration Health</p>
        </div>
      </div>
    </div>

    <!-- Integration Categories -->
    <div class="integration-categories">
      <div class="category-filters">
        <button 
          v-for="category in categories" 
          :key="category"
          class="category-filter"
          :class="{ active: selectedCategory === category }"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- Active Integrations -->
    <div class="integrations-section">
      <h2>Active Integrations</h2>
      <div class="integrations-grid">
        <div 
          v-for="integration in activeIntegrations" 
          :key="integration.name"
          class="integration-card active"
        >
          <div class="integration-header">
            <div class="integration-top-row">
              <div class="integration-logo">
                <img :src="integration.icon" :alt="integration.name" />
              </div>
              <h4>{{ integration.name }}</h4>
            </div>
            
            <div class="integration-status-row">
              <span class="status-badge active">
                <UIcon dynamic name="i-heroicons-check-circle" />
                Active
              </span>
              <span class="last-sync">Last sync: {{ formatDate(integration.lastSync) }}</span>
            </div>
            
            <div class="integration-content">
              <p>{{ integration.description }}</p>
            </div>
            
            <div class="integration-actions">
              <button class="action-btn" @click="configureIntegration(integration)">
                <UIcon dynamic name="i-heroicons-cog-6-tooth" />
                Configure
              </button>
              <button class="action-btn secondary" @click="disconnectIntegration(integration)">
                <UIcon dynamic name="i-heroicons-x-mark" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Integrations -->
    <div class="integrations-section" v-if="pendingIntegrations.length > 0">
      <h2>Pending Setup</h2>
      <div class="integrations-grid">
        <div 
          v-for="integration in pendingIntegrations" 
          :key="integration.name"
          class="integration-card pending"
        >
          <div class="integration-header">
            <div class="integration-top-row">
              <div class="integration-logo">
                <img :src="integration.icon" :alt="integration.name" />
              </div>
              <h4>{{ integration.name }}</h4>
            </div>
            
            <div class="integration-status-row">
              <span class="status-badge pending">
                <UIcon dynamic name="i-heroicons-clock" />
                Setup Required
              </span>
            </div>
            
            <div class="integration-content">
              <p>{{ integration.description }}</p>
            </div>
            
            <div class="integration-actions">
              <button class="action-btn primary" @click="completeSetup(integration)">
                <UIcon dynamic name="i-heroicons-play" />
                Complete Setup
              </button>
              <button class="action-btn secondary" @click="removeIntegration(integration)">
                <UIcon dynamic name="i-heroicons-trash" />
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Integrations -->
    <div class="integrations-section">
      <h2>Available Integrations</h2>
      <div class="integrations-grid">
        <div 
          v-for="integration in filteredAvailableIntegrations" 
          :key="integration.name"
          class="integration-card available"
        >
          <div class="integration-header">
            <div class="integration-top-row">
              <div class="integration-logo">
                <img :src="integration.icon" :alt="integration.name" />
              </div>
              <h4>{{ integration.name }}</h4>
            </div>
            
            <div class="integration-content">
              <p>{{ integration.description }}</p>
              <div class="integration-features">
                <span v-for="feature in integration.features.slice(0, 2)" :key="feature" class="feature-tag">
                  {{ feature }}
                </span>
                <span v-if="integration.features.length > 2" class="feature-more">
                  +{{ integration.features.length - 2 }} more
                </span>
              </div>
            </div>
            
            <div class="integration-actions">
              <button class="action-btn primary" @click="addIntegration(integration)">
                <UIcon dynamic name="i-heroicons-plus" />
                Add Integration
              </button>
              <button class="action-btn secondary" @click="viewIntegrationDetails(integration)">
                <UIcon dynamic name="i-heroicons-eye" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Integration Modal -->
    <div v-if="showAddIntegration" class="modal-overlay" @click="showAddIntegration = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Integration</h3>
          <button class="close-btn" @click="showAddIntegration = false">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        <div class="modal-content">
          <p>Browse and add new integrations to enhance your application's functionality.</p>
          <!-- Integration browser would go here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Get product ID from route
const route = useRoute();
const productId = route.params.id;

// Use auth composable
const { isAuthenticated } = useAuth();

// Meta tags
useHead({
  title: 'Integrations - SaaSWorld Dashboard',
  meta: [
    { name: 'description', content: 'Manage integrations for your application' }
  ]
});

// State
const product = ref<any>(null);
const selectedCategory = ref('All');
const showAddIntegration = ref(false);

// Categories for filtering
const categories = ['All', 'Analytics', 'Communication', 'Storage', 'Marketing', 'Development', 'CRM'];

// Mock integrations data
const activeIntegrations = ref([
  {
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg',
    status: 'active',
    category: 'Communication',
    lastSync: '2024-01-26T10:30:00Z',
    dataPoints: 15420,
    successRate: 99.2,
    requestsPerDay: 1250,
    features: ['Real-time notifications', 'Channel integration', 'Bot commands']
  },
  {
    name: 'Google Analytics',
    description: 'Web analytics and user tracking',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
    status: 'active',
    category: 'Analytics',
    lastSync: '2024-01-26T09:15:00Z',
    dataPoints: 45680,
    successRate: 98.7,
    requestsPerDay: 3400,
    features: ['User tracking', 'Event analytics', 'Custom reports']
  },
  {
    name: 'Trello',
    description: 'Project management and task tracking',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg',
    status: 'active',
    category: 'Development',
    lastSync: '2024-01-26T08:45:00Z',
    dataPoints: 8920,
    successRate: 97.5,
    requestsPerDay: 650,
    features: ['Board sync', 'Card automation', 'Progress tracking']
  }
]);

const pendingIntegrations = ref([
  {
    name: 'Zapier',
    description: 'Workflow automation between apps',
    icon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=32&h=32&fit=crop',
    status: 'pending',
    category: 'Development',
    features: ['Workflow automation', 'Trigger actions', 'Multi-app sync']
  }
]);

const availableIntegrations = ref([
  {
    name: 'HubSpot',
    description: 'CRM and marketing automation platform',
    icon: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=32&h=32&fit=crop',
    category: 'CRM',
    features: ['Contact management', 'Email marketing', 'Sales pipeline', 'Analytics dashboard']
  },
  {
    name: 'Mailchimp',
    description: 'Email marketing and automation',
    icon: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=32&h=32&fit=crop',
    category: 'Marketing',
    features: ['Email campaigns', 'Audience segmentation', 'A/B testing', 'Analytics']
  },
  {
    name: 'GitHub',
    description: 'Code repository and project management',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    category: 'Development',
    features: ['Repository sync', 'Issue tracking', 'Pull request automation', 'Release management']
  },
  {
    name: 'Notion',
    description: 'All-in-one workspace for notes and docs',
    icon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=32&h=32&fit=crop',
    category: 'Development',
    features: ['Documentation sync', 'Knowledge base', 'Team collaboration', 'Task management']
  }
]);

// Computed properties
const filteredAvailableIntegrations = computed(() => {
  if (selectedCategory.value === 'All') {
    return availableIntegrations.value;
  }
  return availableIntegrations.value.filter(integration => 
    integration.category === selectedCategory.value
  );
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
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
  return `${Math.floor(diffMinutes / 1440)} days ago`;
};

const refreshIntegrations = () => {
  console.log('Refreshing integrations...');
  // Implement refresh logic
};

const configureIntegration = (integration: any) => {
  console.log('Configuring integration:', integration.name);
  // Navigate to configuration page or open modal
};

const disconnectIntegration = (integration: any) => {
  if (confirm(`Are you sure you want to disconnect ${integration.name}? This will stop all data sync.`)) {
    console.log('Disconnecting integration:', integration.name);
    // Implement disconnect logic
  }
};

const completeSetup = (integration: any) => {
  console.log('Completing setup for:', integration.name);
  // Navigate to setup flow
};

const removeIntegration = (integration: any) => {
  if (confirm(`Remove ${integration.name} from pending integrations?`)) {
    const index = pendingIntegrations.value.findIndex(i => i.name === integration.name);
    if (index > -1) {
      pendingIntegrations.value.splice(index, 1);
    }
  }
};

const addIntegration = (integration: any) => {
  console.log('Adding integration:', integration.name);
  // Add to pending integrations
  pendingIntegrations.value.push({
    ...integration,
    status: 'pending'
  });
  
  // Remove from available
  const index = availableIntegrations.value.findIndex(i => i.name === integration.name);
  if (index > -1) {
    availableIntegrations.value.splice(index, 1);
  }
};

const viewIntegrationDetails = (integration: any) => {
  console.log('Viewing details for:', integration.name);
  // Open details modal or navigate to details page
};

// Load product data on mount
onMounted(() => {
  // Mock product data - in real app, fetch from API
  product.value = {
    id: parseInt(productId as string),
    name: 'TaskFlow Pro',
    integrations: {
      active: activeIntegrations.value.length,
      pending: pendingIntegrations.value.length,
      total: activeIntegrations.value.length + pendingIntegrations.value.length + availableIntegrations.value.length
    }
  };
});
</script>

<style scoped>
.integrations-page {
  padding: 0;
  margin-top: 144px !important; /* Consistent with other dashboard pages */
  min-height: calc(100vh - 144px);
  background: #f8fafc;
}

/* Page Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.25rem 0;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.title-section h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.title-section p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.8rem;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  white-space: nowrap;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Integration Stats */
.integration-stats {
  max-width: 1400px;
  margin: 0 auto 1.5rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  transition: all 0.2s;
  height: 64px;
}

.stat-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
}

.stat-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.available {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.125rem 0;
  line-height: 1.2;
}

.stat-content p {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
  font-weight: 500;
}

/* Integration Categories */
.integration-categories {
  max-width: 1400px;
  margin: 0 auto 2rem auto;
  padding: 0 2rem;
}

.category-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-filter {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-filter:hover {
  background: #f3f4f6;
}

.category-filter.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Integrations Sections */
.integrations-section {
  max-width: 1400px;
  margin: 0 auto 3rem auto;
  padding: 0 2rem;
}

.integrations-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 1rem;
}

/* Integration Cards */
.integration-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;
}

.integration-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.integration-card.active {
  border-left: 4px solid #10b981;
}

.integration-card.pending {
  border-left: 4px solid #f59e0b;
}

.integration-card.available {
  border-left: 4px solid #6b7280;
}

.integration-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 140px;
}

.integration-top-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.integration-top-row h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.integration-logo {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.integration-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.integration-status-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.integration-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.integration-content p {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.last-sync {
  color: #9ca3af;
  font-size: 0.7rem;
}

.integration-features {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.feature-tag {
  padding: 0.2rem 0.4rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 0.25rem;
  font-size: 0.7rem;
}

.feature-more {
  padding: 0.2rem 0.4rem;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 0.25rem;
  font-size: 0.7rem;
}

.integration-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.375rem;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  color: #6b7280;
}

.action-btn.secondary:hover {
  background: #f9fafb;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-content {
  padding: 2rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .integration-stats {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 1.5rem;
  }

  .integration-categories {
    padding: 0 1.5rem;
  }

  .integrations-section {
    padding: 0 1.5rem;
  }

  .integration-header {
    padding: 1rem 1.25rem;
    min-height: 120px;
    gap: 0.75rem;
  }

  .integration-top-row {
    gap: 0.5rem;
  }

  .integration-top-row h4 {
    font-size: 0.95rem;
  }

  .integration-logo {
    width: 2rem;
    height: 2rem;
  }

  .integration-content p {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .integration-actions {
    margin-top: 0.5rem;
  }

  .integrations-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .integrations-page {
    margin-top: 136px !important; /* Mobile spacing */
    min-height: calc(100vh - 136px);
  }

  .page-header {
    padding: 1rem 0;
  }

  .header-content {
    padding: 0 1rem;
  }

  .integration-stats {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 1rem;
    gap: 0.75rem;
  }

  .integration-categories {
    padding: 0 1rem;
  }

  .integrations-section {
    padding: 0 1rem;
  }

  .stat-card {
    height: 56px;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }

  .stat-content h3 {
    font-size: 1.25rem;
  }

  .stat-content p {
    font-size: 0.75rem;
  }

  .title-section h1 {
    font-size: 1.25rem;
  }

  .integrations-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .integration-header {
    padding: 1rem;
    min-height: 110px;
    gap: 0.625rem;
  }

  .integration-top-row h4 {
    font-size: 0.9rem;
  }

  .integration-content p {
    font-size: 0.7rem;
  }

  .integration-actions {
    margin-top: 0.625rem;
  }

  .action-btn {
    padding: 0.35rem 0.7rem;
    font-size: 0.65rem;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }
}

@media (max-width: 640px) {
  .integration-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    height: 52px;
    padding: 0.75rem;
  }

  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .category-filters {
    justify-content: center;
  }

  .integration-actions {
    flex-direction: column;
  }
}
</style>
