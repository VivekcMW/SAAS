<template>
  <div class="admin-review-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Application Review Dashboard</h1>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-number">{{ statistics.pending }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.underReview }}</div>
          <div class="stat-label">Under Review</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.approved }}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.published }}</div>
          <div class="stat-label">Published</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Status Filter:</label>
        <select v-model="selectedStatus" @change="filterApplications">
          <option value="all">All Applications</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Sort By:</label>
        <select v-model="sortBy" @change="sortApplications">
          <option value="submission_date">Submission Date</option>
          <option value="name">Application Name</option>
          <option value="company_name">Company Name</option>
          <option value="status">Status</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Search:</label>
        <input 
          type="text" 
          v-model="searchTerm" 
          @input="searchApplications"
          placeholder="Search applications or companies..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Applications List -->
    <div class="applications-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>

      <div v-else-if="filteredApplications.length === 0" class="empty-state">
        <UIcon name="i-heroicons-document-text" dynamic />
        <h3>No Applications Found</h3>
        <p>No applications match your current filters.</p>
      </div>

      <div v-else class="applications-grid">
        <div 
          v-for="app in filteredApplications" 
          :key="app.id" 
          class="application-card"
          :class="{ 'urgent': isUrgent(app) }"
        >
          <!-- Application Header -->
          <div class="app-header">
            <div class="app-logo">
              <img :src="app.logo_url || '/assets/images/placeholder-app-logo.svg'" :alt="app.name" />
            </div>
            <div class="app-info">
              <h3>{{ app.name }}</h3>
              <p class="company">{{ app.company_name }}</p>
              <div class="app-meta">
                <span class="submission-date">{{ formatDate(app.submission_date) }}</span>
                <span class="category">{{ app.categories?.[0] || 'Uncategorized' }}</span>
              </div>
            </div>
            <div class="app-status">
              <span class="status-badge" :class="app.status">
                {{ formatStatus(app.status) }}
              </span>
            </div>
          </div>

          <!-- Application Details -->
          <div class="app-details">
            <p class="description">{{ app.short_description }}</p>
            
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Pricing:</span>
                <span class="value">{{ formatPricing(app.pricing) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Platform:</span>
                <span class="value">{{ app.platform_support?.join(', ') || 'Not specified' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Stage:</span>
                <span class="value">{{ app.development_stage || 'Not specified' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Contact:</span>
                <span class="value">{{ app.contact?.email || 'Not provided' }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="app.search_keywords?.length" class="tags">
              <span v-for="tag in app.search_keywords.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
              <span v-if="app.search_keywords.length > 3" class="tag-more">
                +{{ app.search_keywords.length - 3 }} more
              </span>
            </div>
          </div>

          <!-- Review Actions -->
          <div class="review-actions">
            <button 
              class="btn btn-outline btn-sm" 
              @click="viewApplication(app)"
            >
              <UIcon name="i-heroicons-eye" dynamic />
              View Details
            </button>
            
            <button 
              v-if="app.status === 'submitted'" 
              class="btn btn-primary btn-sm" 
              @click="startReview(app)"
            >
              <UIcon name="i-heroicons-play" dynamic />
              Start Review
            </button>
            
            <button 
              v-if="app.status === 'under_review'" 
              class="btn btn-success btn-sm" 
              @click="approveApplication(app)"
            >
              <UIcon name="i-heroicons-check" dynamic />
              Approve
            </button>
            
            <button 
              v-if="app.status === 'under_review'" 
              class="btn btn-danger btn-sm" 
              @click="rejectApplication(app)"
            >
              <UIcon name="i-heroicons-x-mark" dynamic />
              Reject
            </button>
            
            <button 
              v-if="app.status === 'approved'" 
              class="btn btn-primary btn-sm" 
              @click="publishApplication(app)"
            >
              <UIcon name="i-heroicons-globe-alt" dynamic />
              Publish
            </button>
          </div>

          <!-- Review Notes -->
          <div v-if="app.review_notes" class="review-notes">
            <strong>Review Notes:</strong>
            <p>{{ app.review_notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Application Detail Modal -->
    <div v-if="selectedApplication" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedApplication.name }}</h2>
          <button class="modal-close" @click="closeModal">
            <UIcon name="i-heroicons-x-mark" dynamic />
          </button>
        </div>
        
        <div class="modal-body">
          <ApplicationReviewDetail 
            :application="selectedApplication"
            @approve="approveApplication"
            @reject="rejectApplication"
            @publish="publishApplication"
            @update-notes="updateReviewNotes"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { DatabaseApplication } from '~/types/database';

// Component state
const loading = ref(true);
const applications = ref<DatabaseApplication[]>([]);
const selectedApplication = ref<DatabaseApplication | null>(null);
const selectedStatus = ref('all');
const sortBy = ref('submission_date');
const searchTerm = ref('');

// Mock data for development - replace with API calls in production
const mockApplications: DatabaseApplication[] = [
  {
    id: 'app-001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    name: 'TaskMaster Pro',
    website: 'https://taskmaster.com',
    short_description: 'Advanced project management tool with AI-powered insights and team collaboration features.',
    long_description: '<p>Comprehensive description...</p>',
    categories: ['productivity', 'project-management'],
    search_keywords: ['productivity', 'tasks', 'project management', 'collaboration'],
    company_name: 'TaskMaster Inc.',
    company_website: 'https://taskmaster.com',
    company_size: '51-200',
    company_location: 'San Francisco, CA',
    founded: '2020',
    industries: ['Software', 'Productivity'],
    social_links: {
      twitter: 'taskmaster',
      linkedin: 'taskmaster-inc'
    },
    features: ['Task Management', 'Team Collaboration', 'AI Insights'],
    included_features: ['Unlimited projects', 'Team chat', 'Basic reporting'],
    pricing_models: ['subscription'],
    pricing_details: 'Starting at $15/month per user',
    target_audience: 'Small to medium businesses',
    platform_support: ['web', 'mobile-ios', 'mobile-android'],
    application_stage: 'live',
    development_stage: 'live',
    business_model: 'subscription',
    api_available: true,
    webhook_support: true,
    app_version: '2.1.0',
    supported_languages: ['English', 'Spanish'],
    integrations: ['Slack', 'Google Drive', 'Zapier'],
    app_store_links: {
      web: 'https://taskmaster.com',
      ios: 'https://apps.apple.com/app/taskmaster'
    },
    support_channels: ['Email Support', 'Live Chat'],
    documentation_url: 'https://docs.taskmaster.com',
    help_center_url: 'https://help.taskmaster.com',
    logo_url: '/assets/images/integrations/asana.svg',
    screenshots: [],
    videos: [],
    testimonials: [],
    founder: {
      name: 'John Smith',
      title: 'CEO & Founder',
      bio: 'Serial entrepreneur with 10+ years in productivity software.',
      profile_picture_url: ''
    },
    team_members: [],
    contact: {
      name: 'John Smith',
      email: 'john@taskmaster.com',
      phone: '+1-555-0123',
      role: 'CEO'
    },
    rating: 0,
    review_count: 0,
    featured: false,
    trending: false,
    tags: ['productivity', 'tasks', 'project management'],
    pricing: {
      type: 'paid',
      value: 15,
      period: 'month'
    },
    submission_date: '2024-01-15T10:00:00Z',
    status: 'submitted',
    slug: 'taskmaster-pro',
    view_count: 0,
    click_count: 0
  },
  {
    id: 'app-002',
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-16T14:30:00Z',
    name: 'DataFlow Analytics',
    website: 'https://dataflow.com',
    short_description: 'Real-time business intelligence platform with automated reporting and data visualization.',
    long_description: '<p>Comprehensive analytics platform...</p>',
    categories: ['analytics', 'business-intelligence'],
    search_keywords: ['analytics', 'data', 'business intelligence', 'reporting'],
    company_name: 'DataFlow Corp',
    company_website: 'https://dataflow.com',
    company_size: '201-500',
    company_location: 'New York, NY',
    founded: '2019',
    industries: ['Software', 'Analytics'],
    social_links: {
      linkedin: 'dataflow-corp'
    },
    features: ['Real-time Analytics', 'Custom Dashboards', 'Automated Reports'],
    included_features: ['Data connectors', 'Basic dashboards', 'Email reports'],
    pricing_models: ['subscription', 'usage-based'],
    pricing_details: 'Plans starting at $99/month',
    target_audience: 'Medium to large enterprises',
    platform_support: ['web', 'api'],
    application_stage: 'live',
    development_stage: 'live',
    business_model: 'subscription',
    api_available: true,
    webhook_support: true,
    app_version: '1.5.2',
    supported_languages: ['English'],
    integrations: ['Salesforce', 'HubSpot', 'PostgreSQL', 'MySQL'],
    app_store_links: {
      web: 'https://dataflow.com'
    },
    support_channels: ['Email Support', 'Phone Support'],
    documentation_url: 'https://docs.dataflow.com',
    help_center_url: 'https://help.dataflow.com',
    logo_url: '/assets/images/integrations/zapier.svg',
    screenshots: [],
    videos: [],
    testimonials: [],
    founder: {
      name: 'Sarah Johnson',
      title: 'Co-founder & CTO',
      bio: 'Former data scientist at Google with expertise in ML and analytics.',
      profile_picture_url: ''
    },
    team_members: [],
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah@dataflow.com',
      phone: '+1-555-0456',
      role: 'CTO'
    },
    rating: 0,
    review_count: 0,
    featured: false,
    trending: false,
    tags: ['analytics', 'data', 'business intelligence'],
    pricing: {
      type: 'paid',
      value: 99,
      period: 'month'
    },
    submission_date: '2024-01-14T09:00:00Z',
    status: 'under_review',
    review_notes: 'Application looks promising. Need to verify integration claims.',
    reviewed_by: 'admin@saasworld.com',
    reviewed_at: '2024-01-16T14:30:00Z',
    slug: 'dataflow-analytics',
    view_count: 0,
    click_count: 0
  }
];

// Computed properties
const statistics = computed(() => {
  const stats = {
    pending: 0,
    underReview: 0,
    approved: 0,
    published: 0
  };
  
  applications.value.forEach(app => {
    switch (app.status) {
      case 'submitted':
        stats.pending++;
        break;
      case 'under_review':
        stats.underReview++;
        break;
      case 'approved':
        stats.approved++;
        break;
      case 'published':
        stats.published++;
        break;
    }
  });
  
  return stats;
});

const filteredApplications = computed(() => {
  let filtered = applications.value;
  
  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(app => app.status === selectedStatus.value);
  }
  
  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(app => 
      app.name.toLowerCase().includes(term) ||
      app.company_name.toLowerCase().includes(term) ||
      app.short_description.toLowerCase().includes(term)
    );
  }
  
  // Sort applications
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'company_name':
        return a.company_name.localeCompare(b.company_name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'submission_date':
      default:
        return new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime();
    }
  });
  
  return filtered;
});

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatPricing = (pricing: any) => {
  if (!pricing) return 'Not specified';
  if (pricing.type === 'free') return 'Free';
  if (pricing.type === 'contact') return 'Contact for pricing';
  if (pricing.value && pricing.period) {
    return `$${pricing.value}/${pricing.period}`;
  }
  return 'Custom pricing';
};

const isUrgent = (app: DatabaseApplication) => {
  const submissionDate = new Date(app.submission_date);
  const daysSinceSubmission = (Date.now() - submissionDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceSubmission > 7 && app.status === 'submitted';
};

// Actions
const filterApplications = () => {
  // Filtering is handled by computed property
};

const sortApplications = () => {
  // Sorting is handled by computed property
};

const searchApplications = () => {
  // Search is handled by computed property
};

const viewApplication = (app: DatabaseApplication) => {
  selectedApplication.value = app;
};

const closeModal = () => {
  selectedApplication.value = null;
};

const startReview = async (app: DatabaseApplication) => {
  try {
    // Update status to under_review
    app.status = 'under_review';
    app.reviewed_by = 'current-admin@saasworld.com'; // Replace with actual admin user
    app.reviewed_at = new Date().toISOString();
    
    // In production, make API call to update status
    console.log('Started review for:', app.name);
  } catch (error) {
    console.error('Error starting review:', error);
  }
};

const approveApplication = async (app: DatabaseApplication) => {
  try {
    app.status = 'approved';
    app.updated_at = new Date().toISOString();
    
    // In production, make API call
    console.log('Approved application:', app.name);
  } catch (error) {
    console.error('Error approving application:', error);
  }
};

const rejectApplication = async (app: DatabaseApplication) => {
  const reason = prompt('Please provide a reason for rejection:');
  if (!reason) return;
  
  try {
    app.status = 'rejected';
    app.review_notes = reason;
    app.updated_at = new Date().toISOString();
    
    // In production, make API call
    console.log('Rejected application:', app.name, 'Reason:', reason);
  } catch (error) {
    console.error('Error rejecting application:', error);
  }
};

const publishApplication = async (app: DatabaseApplication) => {
  try {
    app.status = 'published';
    app.updated_at = new Date().toISOString();
    
    // In production, make API call
    console.log('Published application:', app.name);
  } catch (error) {
    console.error('Error publishing application:', error);
  }
};

const updateReviewNotes = (app: DatabaseApplication, notes: string) => {
  app.review_notes = notes;
  app.updated_at = new Date().toISOString();
};

// Load applications on mount
onMounted(async () => {
  try {
    // In production, fetch from API
    // const response = await $fetch('/api/admin/applications');
    // applications.value = response.data;
    
    // For now, use mock data
    applications.value = mockApplications;
  } catch (error) {
    console.error('Error loading applications:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.admin-review-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Filters */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.filter-group select,
.search-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Applications List */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.applications-grid {
  display: grid;
  gap: 1.5rem;
}

.application-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.application-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.application-card.urgent {
  border-left: 4px solid #ef4444;
}

/* Application Card Header */
.app-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.app-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-info {
  flex: 1;
}

.app-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.app-info .company {
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.app-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.app-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.submitted {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.under_review {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.published {
  background: #ecfdf5;
  color: #047857;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Application Details */
.app-details {
  margin-bottom: 1.5rem;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-item .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-item .value {
  color: var(--text-primary);
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f3f4f6;
  color: var(--text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-more {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Review Actions */
.review-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: var(--text-primary);
}

.btn-outline:hover {
  background: #f9fafb;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Review Notes */
.review-notes {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
}

.review-notes strong {
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.5rem;
}

.review-notes p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  color: var(--text-secondary);
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-review-dashboard {
    padding: 1rem;
  }
  
  .header-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-section {
    grid-template-columns: 1fr;
  }
  
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .review-actions {
    justify-content: stretch;
  }
  
  .review-actions .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
