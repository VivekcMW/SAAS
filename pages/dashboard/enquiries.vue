<template>
  <BuyerEnquiries v-if="role === 'buyer'" />
  <div v-else class="enquiries-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Enquiries & Leads</h1>
          <p>Manage customer enquiries, requests, and track potential leads</p>
          <div class="enquiry-stats">
            <span class="stat-item">
              <UIcon dynamic name="i-heroicons-envelope" />
              {{ enquiryStats.total }} Total Enquiries
            </span>
            <span class="stat-item">
              <UIcon dynamic name="i-heroicons-clock" />
              {{ enquiryStats.pending }} Pending
            </span>
            <span class="stat-item">
              <UIcon dynamic name="i-heroicons-check-circle" />
              {{ enquiryStats.resolved }} Resolved
            </span>
            <span class="stat-item">
              <UIcon dynamic name="i-heroicons-user-plus" />
              {{ enquiryStats.leads }} Hot Leads
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="enquiryToast" class="enquiries-toast">
      <UIcon dynamic name="i-heroicons-check-circle" />
      <span>{{ enquiryToast }}</span>
    </div>

    <!-- Status Overview Cards -->
    <div class="status-overview">
      <div class="status-card new">
        <div class="status-icon">
          <UIcon dynamic name="i-heroicons-envelope-open" />
        </div>
        <div class="status-info">
          <h4>New Enquiries</h4>
          <span class="status-count">{{ statusData.new }}</span>
          <span class="status-change positive">+{{ statusData.newIncrease }}%</span>
        </div>
      </div>
      
      <div class="status-card pending">
        <div class="status-icon">
          <UIcon dynamic name="i-heroicons-clock" />
        </div>
        <div class="status-info">
          <h4>Pending Response</h4>
          <span class="status-count">{{ statusData.pending }}</span>
          <span class="status-change neutral">{{ statusData.pendingChange }}%</span>
        </div>
      </div>
      
      <div class="status-card leads">
        <div class="status-icon">
          <UIcon dynamic name="i-heroicons-fire" />
        </div>
        <div class="status-info">
          <h4>Hot Leads</h4>
          <span class="status-count">{{ statusData.leads }}</span>
          <span class="status-change positive">+{{ statusData.leadsIncrease }}%</span>
        </div>
      </div>

      <div class="status-card conversion">
        <div class="status-icon">
          <UIcon dynamic name="i-heroicons-chart-bar-square" />
        </div>
        <div class="status-info">
          <h4>Conversion Rate</h4>
          <span class="status-count">{{ statusData.conversionRate }}%</span>
          <span class="status-change positive">+{{ statusData.conversionIncrease }}%</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Filters and Controls -->
      <div class="enquiries-controls">
        <div class="filter-section">
          <div class="filter-group">
            <label>Type:</label>
            <select v-model="selectedType" class="filter-select">
              <option value="all">All Types</option>
              <option value="enquiry">General Enquiry</option>
              <option value="request">Feature Request</option>
              <option value="lead">Sales Lead</option>
              <option value="support">Support Request</option>
              <option value="demo">Demo Request</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Priority:</label>
            <select v-model="selectedPriority" class="filter-select">
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Status:</label>
            <select v-model="selectedStatus" class="filter-select">
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Date Range:</label>
            <select v-model="selectedDateRange" class="filter-select">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
        
        <div class="search-section">
          <div class="search-box">
            <UIcon dynamic name="i-heroicons-magnifying-glass" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search enquiries..."
              class="search-input"
            >
          </div>
        </div>
      </div>

      <!-- Enquiries List -->
      <div class="enquiries-list">
        <div class="enquiries-header">
          <h3>Enquiries ({{ filteredEnquiries.length }})</h3>
          <div class="header-controls">
            <div class="view-toggle">
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'cards' }"
                @click="viewMode = 'cards'"
              >
                <UIcon dynamic name="i-heroicons-view-columns" />
                Cards
              </button>
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'table' }"
                @click="viewMode = 'table'"
              >
                <UIcon dynamic name="i-heroicons-table-cells" />
                Table
              </button>
            </div>
            <div class="sort-controls">
              <select v-model="sortBy" class="sort-select">
                <option value="date">Latest First</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="enquiries-content">
          <!-- Cards View -->
          <div v-if="viewMode === 'cards'" class="cards-view">
            <div 
              v-for="enquiry in filteredEnquiries" 
              :key="enquiry.id"
              class="enquiry-item"
              :class="[enquiry.type, enquiry.status, { 'has-response': enquiry.responses && enquiry.responses.length > 0 }]"
            >
            <!-- Enquiry Header -->
            <div class="enquiry-header">
              <div class="enquirer-info">
                <div class="enquirer-avatar">
                  <img :src="enquiry.avatar" :alt="enquiry.name" />
                  <div class="priority-indicator" :class="enquiry.priority" :title="getPriorityText(enquiry.priority)">
                    <UIcon dynamic :name="getPriorityIcon(enquiry.priority)" />
                  </div>
                </div>
                <div class="enquirer-details">
                  <div class="enquirer-name-section">
                    <h5 class="enquirer-name">{{ enquiry.name }}</h5>
                    <span class="enquiry-id">#{{ enquiry.id }}</span>
                    <div class="enquiry-badges">
                      <span class="enquiry-type" :class="enquiry.type">
                        <UIcon dynamic :name="getTypeIcon(enquiry.type)" />
                        {{ getTypeLabel(enquiry.type) }}
                      </span>
                      <span class="priority-badge compact" :class="enquiry.priority">
                        <UIcon dynamic :name="getPriorityIcon(enquiry.priority)" />
                      </span>
                    </div>
                  </div>
                  <div class="enquiry-meta compact">
                    <span class="enquiry-date">{{ formatDate(enquiry.date) }}</span>
                    <span class="enquiry-location" v-if="enquiry.location">
                      <UIcon dynamic name="i-heroicons-map-pin" />
                      {{ enquiry.location }}
                    </span>
                    <span class="enquiry-company" v-if="enquiry.company">
                      <UIcon dynamic name="i-heroicons-building-office" />
                      {{ enquiry.company }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="enquiry-status-section compact">
                <div class="status-badge" :class="enquiry.status">
                  <UIcon dynamic :name="getStatusIcon(enquiry.status)" />
                  <span>{{ getStatusLabel(enquiry.status) }}</span>
                </div>
                <div class="response-time-indicator" :class="getResponseTimeClass(enquiry.responseTime)">
                  <UIcon dynamic name="i-heroicons-clock" />
                  <span>{{ enquiry.responseTime }}h</span>
                </div>
              </div>
            </div>
            
            <!-- Enquiry Content -->
            <div class="enquiry-content">
              <div class="enquiry-subject">
                <h4>{{ enquiry.subject }}</h4>
              </div>
              <p class="enquiry-message">{{ enquiry.message }}</p>
              
              <!-- Contact Information -->
              <div class="contact-info">
                <div class="contact-item">
                  <UIcon dynamic name="i-heroicons-envelope" />
                  <span>{{ enquiry.email }}</span>
                </div>
                <div class="contact-item" v-if="enquiry.phone">
                  <UIcon dynamic name="i-heroicons-phone" />
                  <span>{{ enquiry.phone }}</span>
                </div>
                <div class="contact-item" v-if="enquiry.website">
                  <UIcon dynamic name="i-heroicons-globe-alt" />
                  <a :href="enquiry.website" target="_blank">{{ enquiry.website }}</a>
                </div>
              </div>
            </div>
            
            <!-- Enquiry Footer -->
            <div class="enquiry-footer">
              <div class="enquiry-actions">
                <button 
                  class="action-btn respond"
                  @click="toggleResponseForm(enquiry.id)"
                  :class="{ active: activeResponseForm === enquiry.id }"
                >
                  <UIcon dynamic name="i-heroicons-chat-bubble-left-right" />
                  Respond
                </button>
                
                <button class="action-btn assign" @click="assignEnquiry(enquiry)">
                  <UIcon dynamic name="i-heroicons-user-plus" />
                  Assign
                </button>
                
                <button 
                  class="action-btn status"
                  @click="updateStatus(enquiry)"
                  :class="'status-' + enquiry.status"
                >
                  <UIcon dynamic :name="getStatusIcon(enquiry.status)" />
                  Update Status
                </button>
                
                <button 
                  v-if="enquiry.type === 'lead'"
                  class="action-btn convert"
                  @click="convertLead(enquiry)"
                >
                  <UIcon dynamic name="i-heroicons-arrow-trending-up" />
                  Convert to Customer
                </button>
              </div>
              
              <div class="enquiry-insights">
                <span class="response-time" :class="getResponseTimeClass(enquiry.responseTime)">
                  <UIcon dynamic name="i-heroicons-clock" />
                  Response due in {{ enquiry.responseTime }}h
                </span>
              </div>
            </div>

            <!-- Response Form -->
            <div v-if="activeResponseForm === enquiry.id" class="response-form">
              <div class="response-input-section">
                <div class="response-author-info">
                  <img :src="currentUser.avatar" :alt="currentUser.name" class="response-avatar">
                  <div class="response-author-details">
                    <span class="response-author-name">{{ currentUser.name }}</span>
                    <span class="response-author-role">{{ currentUser.role }}</span>
                  </div>
                </div>
                
                <textarea 
                  v-model="responseText"
                  placeholder="Write your response..."
                  class="response-textarea"
                  rows="4"
                ></textarea>
                
                <div class="response-actions">
                  <div class="action-options">
                    <label class="checkbox-option">
                      <input type="checkbox" v-model="markAsResolved">
                      Mark as Resolved
                    </label>
                    <label class="checkbox-option">
                      <input type="checkbox" v-model="sendEmailNotification">
                      Send Email Notification
                    </label>
                  </div>
                  
                  <div class="submit-actions">
                    <button class="btn btn-secondary" @click="cancelResponse">
                      Cancel
                    </button>
                    <button 
                      class="btn btn-primary" 
                      @click="submitResponse(enquiry)"
                      :disabled="!responseText.trim()"
                    >
                      <UIcon dynamic name="i-heroicons-paper-airplane" />
                      Send Response
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Previous Responses -->
            <div v-if="enquiry.responses && enquiry.responses.length > 0" class="responses-section">
              <div class="responses-header">
                <h5>{{ enquiry.responses.length }} {{ enquiry.responses.length === 1 ? 'Response' : 'Responses' }}</h5>
              </div>
              
              <div class="responses-list">
                <div 
                  v-for="response in enquiry.responses" 
                  :key="response.id"
                  class="response-item"
                >
                  <div class="response-author-section">
                    <img :src="response.avatar" :alt="response.author" class="response-author-avatar">
                    <div class="response-author-info">
                      <div class="response-author-name">
                        {{ response.author }}
                        <span class="official-badge">
                          <UIcon dynamic name="i-heroicons-check-badge" />
                          {{ response.role }}
                        </span>
                      </div>
                      <div class="response-meta">
                        <span class="response-date">{{ formatDate(response.date) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="response-content">
                    <p class="response-text">{{ response.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          <!-- Table View -->
          <div v-if="viewMode === 'table'" class="table-view">
            <div class="table-container">
              <table class="enquiries-table">
                <thead>
                  <tr>
                    <th>Enquirer</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Response Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="enquiry in filteredEnquiries" 
                    :key="enquiry.id"
                    class="enquiry-row"
                    :class="[enquiry.type, enquiry.status, { 'has-response': enquiry.responses && enquiry.responses.length > 0 }]"
                  >
                    <!-- Enquirer Column -->
                    <td class="enquirer-cell">
                      <div class="enquirer-info-table">
                        <img :src="enquiry.avatar" :alt="enquiry.name" class="enquirer-avatar-small" />
                        <div class="enquirer-details-table">
                          <div class="enquirer-name-table">{{ enquiry.name }}</div>
                          <div class="enquirer-company-table" v-if="enquiry.company">{{ enquiry.company }}</div>
                          <div class="enquirer-contact-table">{{ enquiry.email }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Subject Column -->
                    <td class="subject-cell">
                      <div class="subject-content">
                        <div class="subject-title">{{ enquiry.subject }}</div>
                        <div class="enquiry-id-table">#{{ enquiry.id }}</div>
                      </div>
                    </td>

                    <!-- Type Column -->
                    <td class="type-cell">
                      <span class="enquiry-type-table" :class="enquiry.type">
                        <UIcon dynamic :name="getTypeIcon(enquiry.type)" />
                        {{ getTypeLabel(enquiry.type) }}
                      </span>
                    </td>

                    <!-- Priority Column -->
                    <td class="priority-cell">
                      <span class="priority-badge-table" :class="enquiry.priority">
                        <UIcon dynamic :name="getPriorityIcon(enquiry.priority)" />
                        {{ getPriorityText(enquiry.priority).replace(' Priority', '') }}
                      </span>
                    </td>

                    <!-- Status Column -->
                    <td class="status-cell">
                      <span class="status-badge-table" :class="enquiry.status">
                        <UIcon dynamic :name="getStatusIcon(enquiry.status)" />
                        {{ getStatusLabel(enquiry.status) }}
                      </span>
                    </td>

                    <!-- Location Column -->
                    <td class="location-cell">
                      <div class="location-info" v-if="enquiry.location">
                        <UIcon dynamic name="i-heroicons-map-pin" />
                        {{ enquiry.location }}
                      </div>
                      <span v-else class="no-data">-</span>
                    </td>

                    <!-- Date Column -->
                    <td class="date-cell">
                      <div class="date-info">
                        <div class="date-primary">{{ formatDate(enquiry.date) }}</div>
                        <div class="date-secondary">{{ formatTime(enquiry.date) }}</div>
                      </div>
                    </td>

                    <!-- Response Time Column -->
                    <td class="response-time-cell">
                      <div class="response-time-indicator-table" :class="getResponseTimeClass(enquiry.responseTime)">
                        <UIcon dynamic name="i-heroicons-clock" />
                        <span>{{ enquiry.responseTime }}h</span>
                      </div>
                    </td>

                    <!-- Actions Column -->
                    <td class="actions-cell">
                      <div class="table-actions">
                        <button 
                          class="table-action-btn respond"
                          @click="toggleResponseForm(enquiry.id)"
                          :class="{ active: activeResponseForm === enquiry.id }"
                          title="Respond"
                        >
                          <UIcon dynamic name="i-heroicons-chat-bubble-left-right" />
                        </button>
                        
                        <button 
                          class="table-action-btn assign" 
                          @click="assignEnquiry(enquiry)"
                          title="Assign"
                        >
                          <UIcon dynamic name="i-heroicons-user-plus" />
                        </button>
                        
                        <button 
                          class="table-action-btn status"
                          @click="updateStatus(enquiry)"
                          :class="'status-' + enquiry.status"
                          title="Update Status"
                        >
                          <UIcon dynamic :name="getStatusIcon(enquiry.status)" />
                        </button>
                        
                        <button 
                          v-if="enquiry.type === 'lead'"
                          class="table-action-btn convert"
                          @click="convertLead(enquiry)"
                          title="Convert to Customer"
                        >
                          <UIcon dynamic name="i-heroicons-arrow-trending-up" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreEnquiries" class="load-more-section">
          <button class="btn btn-secondary load-more-btn" @click="loadMoreEnquiries">
            <UIcon dynamic name="i-heroicons-arrow-down" />
            Load More Enquiries
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const { currentUser: buyerAuthUser } = useAuth()
const role = computed(() => buyerAuthUser.value?.role || 'buyer')

// SEO and meta tags
useSeoMeta({
  title: 'Enquiries & Leads - Customer Enquiries Management',
  description: 'Manage customer enquiries, feature requests, and track sales leads efficiently.',
  keywords: 'enquiries, leads, customer requests, sales leads, support requests'
});

// Page layout (dashboard shell is provided by pages/dashboard.vue)
definePageMeta({
  layout: false
});

// State
const selectedType = ref('all');
const selectedPriority = ref('all');
const selectedStatus = ref('all');
const selectedDateRange = ref('all');
const searchQuery = ref('');
const sortBy = ref('date');
const viewMode = ref('cards');
const activeResponseForm = ref<number | null>(null);
const responseText = ref('');
const markAsResolved = ref(false);
const sendEmailNotification = ref(true);
const hasMoreEnquiries = ref(true);

// Current user (from auth)
const { currentUser: authUser } = useAuth()
const currentUser = computed(() => ({
  name: authUser.value?.fullName || authUser.value?.name || 'Support Manager',
  role: authUser.value?.displayRole || 'Customer Success',
  avatar: authUser.value?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
}));

// Toast
const enquiryToast = ref('');
const flashEnquiry = (msg: string) => {
  enquiryToast.value = msg;
  setTimeout(() => (enquiryToast.value = ''), 2500);
};

// Mock data for status overview
const statusData = ref({
  new: 24,
  newIncrease: 15,
  pending: 18,
  pendingChange: -5,
  leads: 12,
  leadsIncrease: 28,
  conversionRate: 34,
  conversionIncrease: 8
});

// Mock enquiries data
const enquiriesData = ref([
  {
    id: 1001,
    name: 'Alex Thompson',
    email: 'alex.thompson@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    website: 'https://techcorp.com',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    type: 'lead',
    priority: 'high',
    status: 'new',
    subject: 'Enterprise Package Inquiry',
    message: 'Hi, we are a growing tech company with 200+ employees looking for a comprehensive analytics solution. We need advanced reporting features and team collaboration tools. Can you provide information about your enterprise package and pricing?',
    date: '2024-01-25T09:15:00Z',
    responseTime: 4,
    leadScore: 87,
    responses: []
  },
  {
    id: 1002,
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@designstudio.com',
    phone: '+1 (555) 234-5678',
    company: 'Creative Design Studio',
    location: 'Toronto, ON',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
    type: 'demo',
    priority: 'high',
    status: 'pending',
    subject: 'Product Demo Request',
    message: 'We would like to schedule a demo of your Design Studio product. Our team of 15 designers is interested in the collaborative features and template management system.',
    date: '2024-01-24T14:30:00Z',
    responseTime: 12,
    responses: [
      {
        id: 1,
        author: 'Sales Team',
        role: 'Sales Representative',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
        text: 'Thank you for your interest! I\'d be happy to schedule a demo for your team. I\'ve sent you a calendar link with available slots this week. Looking forward to showing you our collaborative features.',
        date: '2024-01-24T16:45:00Z'
      }
    ]
  },
  {
    id: 1003,
    name: 'Michael Rodriguez',
    email: 'michael.r@startupventure.io',
    company: 'StartupVenture',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    type: 'request',
    priority: 'medium',
    status: 'in-progress',
    subject: 'API Integration Feature Request',
    message: 'We love using TaskFlow Pro but need better API integration capabilities. Specifically, we need webhook support and real-time data synchronization with our existing tools.',
    date: '2024-01-23T11:20:00Z',
    responseTime: 8,
    responses: [
      {
        id: 2,
        author: 'Product Team',
        role: 'Product Manager',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        text: 'Great suggestion! API integration is indeed on our roadmap. We\'re currently working on webhook support and expect to release it in Q2. I\'ll add your specific requirements to our development notes.',
        date: '2024-01-23T15:30:00Z'
      }
    ]
  },
  {
    id: 1004,
    name: 'Emily Chen',
    email: 'emily.chen@retailplus.com',
    phone: '+1 (555) 345-6789',
    company: 'RetailPlus Inc',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    type: 'support',
    priority: 'high',
    status: 'resolved',
    subject: 'Data Export Issues',
    message: 'We\'re experiencing issues with our data exports. The CSV files seem to be missing some columns and the formatting is inconsistent. This is affecting our monthly reporting.',
    date: '2024-01-22T08:45:00Z',
    responseTime: 2,
    responses: [
      {
        id: 3,
        author: 'Technical Support',
        role: 'Support Engineer',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
        text: 'I\'ve identified the issue with the CSV export format. It was related to a recent update. I\'ve applied a fix and your exports should now include all columns with consistent formatting. Please let me know if you continue to experience issues.',
        date: '2024-01-22T10:30:00Z'
      }
    ]
  },
  {
    id: 1005,
    name: 'David Park',
    email: 'david.park@innovatetech.com',
    company: 'InnovateTech Solutions',
    location: 'Portland, OR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    type: 'enquiry',
    priority: 'low',
    status: 'new',
    subject: 'Pricing Information Request',
    message: 'Could you please provide detailed pricing information for your Analytics Hub product? We\'re a small business with 25 employees.',
    date: '2024-01-21T16:00:00Z',
    responseTime: 24,
    responses: []
  },
  {
    id: 1006,
    name: 'Lisa Wang',
    email: 'lisa.wang@globalcorp.com',
    phone: '+1 (555) 456-7890',
    company: 'GlobalCorp International',
    website: 'https://globalcorp.com',
    location: 'Singapore',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    type: 'lead',
    priority: 'high',
    status: 'pending',
    subject: 'Multi-Region Deployment Inquiry',
    message: 'We\'re interested in deploying your solution across multiple regions (US, EU, APAC). We need information about data compliance, regional hosting, and enterprise-level security features.',
    date: '2024-01-20T13:30:00Z',
    responseTime: 6,
    leadScore: 94,
    responses: []
  }
]);

// Computed properties
const filteredEnquiries = computed(() => {
  let filtered = [...enquiriesData.value];
  
  // Filter by type
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(enquiry => enquiry.type === selectedType.value);
  }
  
  // Filter by priority
  if (selectedPriority.value !== 'all') {
    filtered = filtered.filter(enquiry => enquiry.priority === selectedPriority.value);
  }
  
  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(enquiry => enquiry.status === selectedStatus.value);
  }
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(enquiry => 
      enquiry.name.toLowerCase().includes(query) ||
      enquiry.subject.toLowerCase().includes(query) ||
      enquiry.message.toLowerCase().includes(query) ||
      enquiry.company?.toLowerCase().includes(query) ||
      enquiry.email.toLowerCase().includes(query)
    );
  }
  
  // Sort
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  }
  
  return filtered;
});

// Computed property for enquiry statistics
const enquiryStats = computed(() => {
  const total = enquiriesData.value.length;
  const pending = enquiriesData.value.filter(e => e.status === 'pending' || e.status === 'in-progress').length;
  const resolved = enquiriesData.value.filter(e => e.status === 'resolved' || e.status === 'closed').length;
  const leads = enquiriesData.value.filter(e => e.type === 'lead').length;
  
  return {
    total,
    pending,
    resolved,
    leads
  };
});

// Helper functions
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'enquiry':
      return 'i-heroicons-envelope';
    case 'request':
      return 'i-heroicons-light-bulb';
    case 'lead':
      return 'i-heroicons-fire';
    case 'support':
      return 'i-heroicons-wrench-screwdriver';
    case 'demo':
      return 'i-heroicons-presentation-chart-line';
    default:
      return 'i-heroicons-question-mark-circle';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'enquiry':
      return 'General Enquiry';
    case 'request':
      return 'Feature Request';
    case 'lead':
      return 'Sales Lead';
    case 'support':
      return 'Support Request';
    case 'demo':
      return 'Demo Request';
    default:
      return 'Unknown';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'new':
      return 'i-heroicons-envelope-open';
    case 'pending':
      return 'i-heroicons-clock';
    case 'in-progress':
      return 'i-heroicons-cog-6-tooth';
    case 'resolved':
      return 'i-heroicons-check-circle';
    case 'closed':
      return 'i-heroicons-archive-box';
    default:
      return 'i-heroicons-question-mark-circle';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'new':
      return 'New';
    case 'pending':
      return 'Pending';
    case 'in-progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return 'Unknown';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'i-heroicons-exclamation-triangle';
    case 'medium':
      return 'i-heroicons-minus';
    case 'low':
      return 'i-heroicons-chevron-down';
    default:
      return 'i-heroicons-question-mark-circle';
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'High Priority';
    case 'medium':
      return 'Medium Priority';
    case 'low':
      return 'Low Priority';
    default:
      return 'Unknown Priority';
  }
};

const getResponseTimeClass = (hours: number) => {
  if (hours <= 4) return 'urgent';
  if (hours <= 12) return 'soon';
  return 'normal';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Action handlers
const toggleResponseForm = (enquiryId: number) => {
  if (activeResponseForm.value === enquiryId) {
    activeResponseForm.value = null;
    responseText.value = '';
  } else {
    activeResponseForm.value = enquiryId;
    responseText.value = '';
    markAsResolved.value = false;
    sendEmailNotification.value = true;
  }
};

const cancelResponse = () => {
  activeResponseForm.value = null;
  responseText.value = '';
  markAsResolved.value = false;
  sendEmailNotification.value = true;
};

const submitResponse = (enquiry: any) => {
  if (!responseText.value.trim()) return;
  
  const newResponse = {
    id: Date.now(),
    author: currentUser.value.name,
    role: currentUser.value.role,
    avatar: currentUser.value.avatar,
    text: responseText.value,
    date: new Date().toISOString()
  };
  
  if (!enquiry.responses) {
    enquiry.responses = [];
  }
  
  enquiry.responses.push(newResponse);
  
  // Update status if marked as resolved
  if (markAsResolved.value) {
    enquiry.status = 'resolved';
  } else if (enquiry.status === 'new') {
    enquiry.status = 'pending';
  }
  
  console.log('Response submitted for enquiry:', enquiry.id, newResponse);
  if (sendEmailNotification.value) {
    console.log('Email notification sent to:', enquiry.email);
  }
  flashEnquiry(markAsResolved.value ? 'Response sent and marked resolved.' : 'Response sent.');

  // Clear form
  activeResponseForm.value = null;
  responseText.value = '';
  markAsResolved.value = false;
  sendEmailNotification.value = true;
};

const assignEnquiry = (enquiry: any) => {
  const assignee = window.prompt(`Assign enquiry from ${enquiry.name} to:`, enquiry.assignedTo || currentUser.value.name);
  if (!assignee) return;
  enquiry.assignedTo = assignee;
  flashEnquiry(`Enquiry assigned to ${assignee}.`);
};

const STATUS_FLOW: Record<string, string> = {
  new: 'pending',
  pending: 'resolved',
  resolved: 'closed',
  closed: 'new'
};
const updateStatus = (enquiry: any) => {
  const next = STATUS_FLOW[enquiry.status] || 'pending';
  enquiry.status = next;
  flashEnquiry(`Status moved to ${next}.`);
};

const convertLead = (enquiry: any) => {
  if (!window.confirm(`Convert ${enquiry.name}'s enquiry into a customer?`)) return;
  enquiry.status = 'resolved';
  enquiry.converted = true;
  statusData.value.leads = Math.max(0, statusData.value.leads - 1);
  flashEnquiry(`${enquiry.name} converted to customer.`);
};

const loadMoreEnquiries = () => {
  // Append a batch of demo items — replace with paginated fetch when API is ready
  const base = enquiriesData.value.length;
  const batch = Array.from({ length: 5 }).map((_, i) => ({
    id: Date.now() + i,
    name: `Guest ${base + i + 1}`,
    email: `guest${base + i + 1}@example.com`,
    company: 'New lead',
    subject: 'Interested in your platform',
    message: 'Could you share more details about enterprise pricing and onboarding?',
    status: 'new',
    priority: 'medium',
    type: 'general',
    date: new Date().toISOString(),
    responseTime: 2,
    responses: []
  }));
  enquiriesData.value.push(...batch);
  if (enquiriesData.value.length >= base + 20) hasMoreEnquiries.value = false;
  flashEnquiry(`Loaded ${batch.length} more enquiries.`);
};

// Initialize component
onMounted(() => {
  console.log('Enquiries page mounted');
});
</script>

<style scoped>
.enquiries-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.enquiries-toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.enquiries-toast :deep(svg) { width: 18px; height: 18px; }

/* Standardized thin border radius for all cards */
.enquiries-page .card,
.enquiries-page .status-card,
.enquiries-page .enquiry-card,
.enquiries-page .stats-card {
  border-radius: 6px !important;
}

/* Page Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem;
  margin-bottom: 2rem;
  margin-top: 0;
}

.header-content {
  max-width: 100%;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.title-section p {
  color: #64748b;
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.enquiry-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.stat-item svg {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
}

/* Status Overview Cards */
.status-overview {
  max-width: 1400px;
  margin: 0 auto 2rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.status-card {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
  min-height: 72px;
}

.status-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: currentColor;
}

.status-card.new {
  border-left: 3px solid #3b82f6;
}

.status-card.new:hover {
  border-color: #3b82f6;
}

.status-card.pending {
  border-left: 3px solid #f59e0b;
}

.status-card.pending:hover {
  border-color: #f59e0b;
}

.status-card.leads {
  border-left: 3px solid #ef4444;
}

.status-card.leads:hover {
  border-color: #ef4444;
}

.status-card.conversion {
  border-left: 3px solid #10b981;
}

.status-card.conversion:hover {
  border-color: #10b981;
}

.status-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: white;
  flex-shrink: 0;
}

.status-card.new .status-icon {
  background: #0073e6;
}

.status-card.pending .status-icon {
  background: #f97316;
}

.status-card.leads .status-icon {
  background: #ef4444;
}

.status-card.conversion .status-icon {
  background: #14b8a6;
}

.status-info {
  flex: 1;
  min-width: 0;
}

.status-info h4 {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 0.125rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.status-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  display: block;
  margin-bottom: 0.125rem;
  line-height: 1.2;
}

.status-change {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.status-change.positive {
  background: #dcfce7;
  color: #166534;
}

.status-change.negative {
  background: #fef2f2;
  color: #dc2626;
}

.status-change.neutral {
  background: #fef3c7;
  color: #d97706;
}

/* Main Content */
.main-content {
  max-width: 100%;
  margin: 0;
  padding: 0 2rem 2rem 2rem;
}

/* Enquiries Controls */
.enquiries-controls {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select,
.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  min-width: 120px;
}

.search-section {
  flex: 1;
  max-width: 300px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  color: #64748b;
  width: 1rem;
  height: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Enquiries List */
.enquiries-list {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.enquiries-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.enquiries-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-toggle {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: white;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid #d1d5db;
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background: #f8fafc;
  color: #475569;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
}

.view-btn.active:hover {
  background: #2563eb;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.enquiries-content {
  padding: 0;
}

.enquiry-item {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.enquiry-item:hover {
  background: #f8fafc;
}

.enquiry-item:last-child {
  border-bottom: none;
}

.enquiry-item.has-response {
  background: linear-gradient(to right, #f0f9ff 0%, transparent 3%);
  border-left: 3px solid #3b82f6;
}

/* Enquiry Header */
.enquiry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.enquirer-info {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.enquirer-avatar {
  position: relative;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
}

.enquirer-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.priority-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
  border: 2px solid white;
}

.priority-indicator.high {
  background: #ef4444;
}

.priority-indicator.medium {
  background: #f59e0b;
}

.priority-indicator.low {
  background: #6b7280;
}

.enquirer-details {
  flex: 1;
  min-width: 0;
}

.enquirer-name-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
}

.enquiry-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.enquirer-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.enquiry-id {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.enquiry-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
  flex-wrap: wrap;
}

.enquiry-meta.compact {
  gap: 0.75rem;
  font-size: 0.8125rem;
}

.enquiry-type {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  font-size: 0.75rem;
}

.enquiry-type.enquiry {
  background: #eff6ff;
  color: #2563eb;
}

.enquiry-type.request {
  background: #fef3c7;
  color: #d97706;
}

.enquiry-type.lead {
  background: #fef2f2;
  color: #dc2626;
}

.enquiry-type.support {
  background: #f0fdf4;
  color: #059669;
}

.enquiry-type.demo {
  background: #faf5ff;
  color: #7c3aed;
}

.enquiry-company {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.enquiry-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
}

.response-time-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.response-time-indicator.urgent {
  background: #fef2f2;
  color: #dc2626;
}

.response-time-indicator.soon {
  background: #fef3c7;
  color: #d97706;
}

.response-time-indicator.normal {
  background: #f0fdf4;
  color: #059669;
}

.enquiry-status-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.enquiry-status-section.compact {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.new {
  background: #eff6ff;
  color: #2563eb;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.in-progress {
  background: #f0f9ff;
  color: #0ea5e9;
}

.status-badge.resolved {
  background: #f0fdf4;
  color: #059669;
}

.status-badge.closed {
  background: #f1f5f9;
  color: #64748b;
}

.priority-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-badge.compact {
  padding: 0.25rem;
  border-radius: 50%;
  min-width: 1.5rem;
  height: 1.5rem;
  justify-content: center;
}

.priority-badge.compact span {
  display: none;
}

.priority-badge.high {
  background: #fef2f2;
  color: #dc2626;
}

.priority-badge.medium {
  background: #fef3c7;
  color: #d97706;
}

.priority-badge.low {
  background: #f1f5f9;
  color: #64748b;
}

/* Enquiry Content */
.enquiry-content {
  margin-bottom: 1rem;
}

.enquiry-subject h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.enquiry-message {
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.contact-info {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.contact-item svg {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.contact-item a {
  color: #3b82f6;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

/* Enquiry Footer */
.enquiry-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.enquiry-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-btn.respond.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-btn.convert {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.action-btn.convert:hover {
  background: #059669;
}

.enquiry-insights {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.response-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.response-time.urgent {
  background: #fef2f2;
  color: #dc2626;
}

.response-time.soon {
  background: #fef3c7;
  color: #d97706;
}

.response-time.normal {
  background: #f0fdf4;
  color: #059669;
}

/* Response Form */
.response-form {
  margin-top: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
}

.response-input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.response-author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.response-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.response-author-details {
  display: flex;
  flex-direction: column;
}

.response-author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.response-author-role {
  font-size: 0.75rem;
  color: #64748b;
}

.response-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
}

.response-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.response-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.action-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.checkbox-option input[type="checkbox"] {
  margin: 0;
}

.submit-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Responses Section */
.responses-section {
  margin-top: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
}

.responses-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.responses-header h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.responses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.response-item {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.response-author-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.response-author-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.response-author-info {
  flex: 1;
}

.response-author-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.official-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #059669;
  background: #f0fdf4;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.response-meta {
  font-size: 0.75rem;
  color: #64748b;
}

.response-content {
  margin-bottom: 0.75rem;
}

.response-text {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

/* Load More Section */
.load-more-section {
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.load-more-btn {
  padding: 0.75rem 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .enquiries-page {
    margin-top: 136px;
    padding: var(--spacing-md);
  }

  .page-header,
  .main-content {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }

  .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .status-overview {
    grid-template-columns: 1fr;
    padding: 0 var(--spacing-md);
    gap: var(--spacing-md);
  }

  .status-card {
    min-height: 64px;
    padding: 0.75rem 1rem;
    gap: 0.625rem;
  }

  .enquiry-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .enquiries-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section {
    justify-content: stretch;
  }

  .filter-group {
    flex: 1;
    min-width: 120px;
  }

  .search-section {
    max-width: none;
  }

  .enquiry-header {
    flex-direction: column;
    gap: 1rem;
  }

  .enquiry-status-section {
    align-items: flex-start;
    flex-direction: row;
    gap: 0.75rem;
  }

  .enquiry-status-section.compact {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .enquiry-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .enquiry-actions {
    justify-content: center;
  }

  .contact-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .response-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .action-options {
    justify-content: center;
  }

  .submit-actions {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .status-overview {
    grid-template-columns: 1fr;
  }

  .enquirer-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .enquirer-avatar {
    align-self: flex-start;
  }

  .enquiry-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    justify-content: center;
  }
}

/* Table View Styles */
.table-view {
  width: 100%;
}

.table-container {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.enquiries-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.875rem;
}

.enquiries-table thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.enquiries-table th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.enquiries-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.enquiries-table tbody tr:hover {
  background: #f8fafc;
}

.enquiries-table tbody tr:last-child {
  border-bottom: none;
}

.enquiries-table tbody tr.has-response {
  background: linear-gradient(to right, #f0f9ff 0%, transparent 3%);
  border-left: 3px solid #3b82f6;
}

.enquiries-table td {
  padding: 1rem 0.75rem;
  vertical-align: top;
  color: #374151;
}

/* Table Cell Styles */
.enquirer-cell {
  min-width: 200px;
}

.enquirer-info-table {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.enquirer-avatar-small {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.enquirer-details-table {
  flex: 1;
  min-width: 0;
}

.enquirer-name-table {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.enquirer-company-table {
  font-size: 0.8125rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.enquirer-contact-table {
  font-size: 0.75rem;
  color: #6b7280;
}

.subject-cell {
  min-width: 250px;
}

.subject-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.subject-title {
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
}

.enquiry-id-table {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
  font-weight: 500;
}

.type-cell {
  min-width: 140px;
}

.enquiry-type-table {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.enquiry-type-table.enquiry {
  background: #eff6ff;
  color: #2563eb;
}

.enquiry-type-table.request {
  background: #fef3c7;
  color: #d97706;
}

.enquiry-type-table.lead {
  background: #fef2f2;
  color: #dc2626;
}

.enquiry-type-table.support {
  background: #f0fdf4;
  color: #059669;
}

.enquiry-type-table.demo {
  background: #faf5ff;
  color: #7c3aed;
}

.priority-cell {
  min-width: 120px;
}

.priority-badge-table {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.priority-badge-table.high {
  background: #fef2f2;
  color: #dc2626;
}

.priority-badge-table.medium {
  background: #fef3c7;
  color: #d97706;
}

.priority-badge-table.low {
  background: #f1f5f9;
  color: #64748b;
}

.status-cell {
  min-width: 120px;
}

.status-badge-table {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge-table.new {
  background: #eff6ff;
  color: #2563eb;
}

.status-badge-table.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-table.in-progress {
  background: #f0f9ff;
  color: #0ea5e9;
}

.status-badge-table.resolved {
  background: #f0fdf4;
  color: #059669;
}

.status-badge-table.closed {
  background: #f1f5f9;
  color: #64748b;
}

.location-cell {
  min-width: 150px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
  font-size: 0.8125rem;
}

.no-data {
  color: #9ca3af;
  font-style: italic;
}

.date-cell {
  min-width: 120px;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.date-primary {
  font-weight: 500;
  color: #374151;
}

.date-secondary {
  font-size: 0.75rem;
  color: #6b7280;
}

.response-time-cell {
  min-width: 120px;
}

.response-time-indicator-table {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  white-space: nowrap;
}

.response-time-indicator-table.urgent {
  background: #fef2f2;
  color: #dc2626;
}

.response-time-indicator-table.soon {
  background: #fef3c7;
  color: #d97706;
}

.response-time-indicator-table.normal {
  background: #f0fdf4;
  color: #059669;
}

.actions-cell {
  min-width: 140px;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-start;
}

.table-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.table-action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.table-action-btn.respond.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.table-action-btn.convert {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.table-action-btn.convert:hover {
  background: #059669;
}

/* Responsive table */
@media (max-width: 1200px) {
  .table-container {
    overflow-x: scroll;
  }
  
  .enquiries-table {
    min-width: 1000px;
  }
}

@media (max-width: 768px) {
  .header-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .view-toggle {
    order: 2;
  }
  
  .sort-controls {
    order: 1;
  }
}

@media (max-width: 480px) {
  .enquiries-page {
    padding: var(--spacing-sm);
    margin-top: 130px;
  }

  .page-header,
  .main-content {
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }

  .status-overview {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .status-card {
    padding: var(--spacing-sm);
  }

  .enquiries-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .enquiry-card {
    padding: var(--spacing-sm);
  }

  .enquiry-header {
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: flex-start;
  }
}
</style>
