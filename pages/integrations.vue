<template>
  <div class="integrations-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Connect <span class="highlight">SaaSWorld</span> with your favorite tools</h1>
          <p class="hero-subtitle">We integrate with over 100+ applications and services to supercharge your workflow and boost productivity.</p>
        </div>
      </div>
    </section>
    
    <!-- Search and Filter Section -->
    <section class="integration-search-section">
      <div class="container">
        <div class="search-filter-container">
          <div class="search-container">
            <input type="text" placeholder="Search integrations..." class="search-input" v-model="searchQuery">
            <div class="search-icon">
              <UIcon dynamic name="i-heroicons-magnifying-glass" />
            </div>
          </div>
          <div class="filter-container">
            <div class="filter-item" :class="{ active: selectedCategory === 'all' }" @click="filterCategory('all')">
              All
            </div>
            <div class="filter-item" v-for="category in categories" :key="category" 
                 :class="{ active: selectedCategory === category }"
                 @click="filterCategory(category)">
              {{ category }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Integrations Section -->
    <section class="popular-integrations-section">
      <div class="container">
        <div class="section-header">
          <h2>Popular Integrations</h2>
          <p>Our most used integrations that help businesses streamline their operations.</p>
        </div>
        <div class="integrations-grid">
          <IntegrationCard 
            v-for="(integration, index) in filteredIntegrations" 
            :key="index" 
            :integration="integration"
            @show-details="showIntegrationDetails"
          />
        </div>
      </div>
    </section>

    <!-- Integration Categories Section -->
    <section class="integration-categories-section">
      <div class="container">
        <div class="section-header">
          <h2>Integration Categories</h2>
          <p>Discover integrations by category to enhance specific aspects of your business.</p>
        </div>
        <div class="categories-grid">
          <div class="category-card" v-for="(category, index) in categoryDetails" :key="index" @click="filterCategory(category.name)">
            <div class="category-icon">
              <UIcon dynamic :name="category.icon" />
            </div>
            <h3>{{ category.title }}</h3>
            <p>{{ category.description }}</p>
            <div class="category-count">{{ getCategoryCount(category.name) }} integrations</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Integration Help Section -->
    <section class="integration-help-section">
      <div class="container">
        <div class="help-content">
          <div class="help-text">
            <h2>Need help setting up an integration?</h2>
            <p>Our support team is ready to assist you with any integration needs. Whether you need help connecting an existing tool or requesting a new integration, we're here to help.</p>
            <div class="help-actions">
              <NuxtLink to="/contact" class="btn btn-primary">Contact Support</NuxtLink>
              <a href="#" class="btn btn-outline" @click.prevent="showRequestForm = true">Request Integration</a>
            </div>
          </div>
          <div class="help-image">
            <img src="/assets/images/integrations/integration-support.svg" alt="Integration Support" />
          </div>
        </div>
      </div>
    </section>

    <!-- Request Integration Modal -->
    <div class="modal-overlay" v-if="showRequestForm" @click="showRequestForm = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Request New Integration</h3>
          <button class="close-button" @click="showRequestForm = false">
            <UIcon dynamic name="i-heroicons-x-mark" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitIntegrationRequest">
            <div class="form-group">
              <label for="integration-name">Integration Name</label>
              <input type="text" id="integration-name" v-model="requestForm.name" required placeholder="e.g., Zapier, Asana, etc.">
            </div>
            <div class="form-group">
              <label for="integration-url">Integration Website (optional)</label>
              <input type="url" id="integration-url" v-model="requestForm.url" placeholder="https://...">
            </div>
            <div class="form-group">
              <label for="integration-description">Why do you need this integration?</label>
              <textarea id="integration-description" v-model="requestForm.description" rows="4" required placeholder="Describe how you would use this integration..."></textarea>
            </div>
            <div class="form-group">
              <label for="integration-email">Your Email</label>
              <input type="email" id="integration-email" v-model="requestForm.email" required placeholder="Your email address">
            </div>
            <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
              {{ submitting ? 'Submitting...' : 'Submit Request' }}
            </button>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Integration Details Sidebar -->
    <IntegrationDetailsSidebar 
      v-if="selectedIntegration"
      :is-visible="!!selectedIntegration" 
      :integration="selectedIntegration"
      @close="closeIntegrationDetails"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import IntegrationCard from '~/components/integrations/IntegrationCard.vue';
import IntegrationDetailsSidebar from '~/components/integrations/IntegrationDetailsSidebar.vue';

// Data for integrations
const integrations = [
  {
    name: 'Slack',
    logo: '/assets/images/integrations/slack.svg',
    description: 'Connect SaasWorld with Slack to send notifications, updates, and alerts to your team channels.',
    category: 'Communication',
    popular: true,
    link: '#'
  },
  {
    name: 'Google Workspace',
    logo: '/assets/images/integrations/google.svg',
    description: 'Integrate with Google Docs, Sheets, and other Google Workspace apps to manage your documents seamlessly.',
    category: 'Productivity',
    popular: true,
    link: '#'
  },
  {
    name: 'Microsoft 365',
    logo: '/assets/images/integrations/microsoft.svg',
    description: 'Connect with Microsoft 365 to synchronize emails, calendar events, and documents.',
    category: 'Productivity',
    popular: true,
    link: '#'
  },
  {
    name: 'Zoom',
    logo: '/assets/images/integrations/zoom.svg',
    description: 'Schedule and manage Zoom meetings directly from SaasWorld.',
    category: 'Communication',
    popular: true,
    link: '#'
  },
  {
    name: 'Dropbox',
    logo: '/assets/images/integrations/dropbox.svg',
    description: 'Store and share files seamlessly between SaasWorld and Dropbox.',
    category: 'Storage',
    popular: false,
    link: '#'
  },
  {
    name: 'Salesforce',
    logo: '/assets/images/integrations/salesforce.svg',
    description: 'Sync customer data, leads, and opportunities between SaasWorld and Salesforce CRM.',
    category: 'CRM',
    popular: true,
    link: '#'
  },
  {
    name: 'HubSpot',
    logo: '/assets/images/integrations/hubspot.svg',
    description: 'Connect your marketing, sales, and customer service data between SaasWorld and HubSpot.',
    category: 'Marketing',
    popular: true,
    link: '#'
  },
  {
    name: 'Mailchimp',
    logo: '/assets/images/integrations/mailchimp.svg',
    description: 'Sync your email marketing campaigns and contact lists between SaasWorld and Mailchimp.',
    category: 'Marketing',
    popular: false,
    link: '#'
  },
  {
    name: 'Asana',
    logo: '/assets/images/integrations/asana.svg',
    description: 'Manage projects and tasks efficiently by connecting SaasWorld with Asana.',
    category: 'Project Management',
    popular: true,
    link: '#'
  },
  {
    name: 'Jira',
    logo: '/assets/images/integrations/jira.svg',
    description: 'Connect with Jira to streamline software development and issue tracking.',
    category: 'Project Management',
    popular: false,
    link: '#'
  },
  {
    name: 'Stripe',
    logo: '/assets/images/integrations/stripe.svg',
    description: 'Process payments and manage subscriptions by integrating SaasWorld with Stripe.',
    category: 'Finance',
    popular: true,
    link: '#'
  },
  {
    name: 'QuickBooks',
    logo: '/assets/images/integrations/quickbooks.svg',
    description: 'Sync your financial data and accounting records between SaasWorld and QuickBooks.',
    category: 'Finance',
    popular: false,
    link: '#'
  },
  {
    name: 'Zendesk',
    logo: '/assets/images/integrations/zendesk.svg',
    description: 'Improve customer support by connecting SaasWorld with Zendesk help desk software.',
    category: 'Customer Support',
    popular: false,
    link: '#'
  },
  {
    name: 'GitHub',
    logo: '/assets/images/integrations/github.svg',
    description: 'Connect your code repositories and manage development workflows with GitHub integration.',
    category: 'Development',
    popular: true,
    link: '#'
  },
  {
    name: 'AWS',
    logo: '/assets/images/integrations/aws.svg',
    description: 'Connect with Amazon Web Services for cloud hosting and infrastructure management.',
    category: 'Cloud Services',
    popular: true,
    link: '#'
  },
  {
    name: 'Zapier',
    logo: '/assets/images/integrations/zapier.svg',
    description: 'Connect SaasWorld with 3,000+ apps through automated workflows.',
    category: 'Automation',
    popular: true,
    link: '#'
  },
  {
    name: 'Trello',
    logo: '/assets/images/integrations/trello.svg',
    description: 'Manage your projects with visual boards by connecting SaasWorld with Trello.',
    category: 'Project Management',
    popular: false,
    link: '#'
  },
  {
    name: 'DocuSign',
    logo: '/assets/images/integrations/docusign.svg',
    description: 'Send, sign, and manage documents electronically by integrating with DocuSign.',
    category: 'Document Management',
    popular: false,
    link: '#'
  }
];

// Extract unique categories from integrations
const categories = [...new Set(integrations.map(item => item.category))];

// Search and filtering functionality
const searchQuery = ref('');
const selectedCategory = ref('all');

const filterCategory = (category: string) => {
  selectedCategory.value = category;
};

const filteredIntegrations = computed(() => {
  let filtered = [...integrations];
  
  // Filter by category if not "all"
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === selectedCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim() !== '') {
    const search = searchQuery.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.description.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );
  }
  
  return filtered;
});

// Count integrations by category
const getCategoryCount = (category: string) => {
  return integrations.filter(item => item.category === category).length;
};

// Category details with icons and descriptions
const categoryDetails = [
  {
    name: 'Communication',
    title: 'Communication & Collaboration',
    icon: 'heroicons:chat-bubble-left-right',
    description: 'Connect your team communication tools with SaasWorld.'
  },
  {
    name: 'Productivity',
    title: 'Productivity & Office',
    icon: 'heroicons:document-check',
    description: 'Streamline your document workflow and office tasks.'
  },
  {
    name: 'Project Management',
    title: 'Project Management',
    icon: 'heroicons:clipboard-document-check',
    description: 'Connect your project management tools for seamless workflows.'
  },
  {
    name: 'Marketing',
    title: 'Marketing & Analytics',
    icon: 'heroicons:chart-bar',
    description: 'Enhance your marketing strategies with data-driven insights.'
  },
  {
    name: 'CRM',
    title: 'Customer Relationship',
    icon: 'heroicons:user-group',
    description: 'Manage customer relationships and sales pipelines effectively.'
  },
  {
    name: 'Finance',
    title: 'Finance & Accounting',
    icon: 'heroicons:banknotes',
    description: 'Connect your financial tools for seamless accounting.'
  },
  {
    name: 'Storage',
    title: 'Storage & File Management',
    icon: 'heroicons:folder',
    description: 'Integrate your file storage systems with SaasWorld.'
  },
  {
    name: 'Development',
    title: 'Development Tools',
    icon: 'heroicons:code-bracket',
    description: 'Connect your development and coding tools.'
  }
];

// Modal for requesting new integrations
const showRequestForm = ref(false);
const submitting = ref(false);
const requestForm = ref({
  name: '',
  url: '',
  description: '',
  email: ''
});

// Define integration type
interface Integration {
  name: string;
  logo: string;
  description: string;
  category: string;
  popular: boolean;
  link: string;
}

// Integration details sidebar
const selectedIntegration = ref<Integration | null>(null);

// Show integration details sidebar
const showIntegrationDetails = (integration: Integration) => {
  selectedIntegration.value = integration;
  // Prevent body scrolling when sidebar is open
  document.body.style.overflow = 'hidden';
};

// Close integration details sidebar
const closeIntegrationDetails = () => {
  selectedIntegration.value = null;
  // Restore body scrolling
  document.body.style.overflow = '';
};

// Submit integration request
const submitIntegrationRequest = () => {
  submitting.value = true;
  
  // Simulate API call
  setTimeout(() => {
    console.log('Submitting integration request:', requestForm.value);
    // Reset form
    requestForm.value = {
      name: '',
      url: '',
      description: '',
      email: ''
    };
    submitting.value = false;
    showRequestForm.value = false;
    // Normally, you would send this to your backend using fetch or axios
    alert('Your integration request has been submitted. Our team will review it soon!');
  }, 1500);
};
</script>

<style scoped>
/* Main Page Container */
.integrations-page {
  margin-top: 144px !important; /* Space for fixed subnav - desktop */
  padding-top: 0 !important;
  min-height: calc(100vh - 144px);
}

@media (max-width: 768px) {
  .integrations-page {
    margin-top: 136px !important; /* Space for fixed subnav - mobile */
    min-height: calc(100vh - 136px);
  }
}

/* Hero Section */
.hero-section {
  padding: calc(var(--spacing-xxl) * 1.5) 0;
  background: linear-gradient(135deg, var(--bg-gray) 0%, #fff 100%);
  position: relative;
  overflow: visible;
  text-align: center;
}

.hero-section .container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: 3rem;
  line-height: 1.2;
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
  bottom: 10px;
  left: 0;
  width: 100%;
  height: 10px;
  background-color: var(--secondary-color);
  z-index: -1;
  opacity: 0.5;
}

.hero-subtitle {
  font-size: 1.125rem;
  font-weight: 300;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* Search and Filter Section */
.integration-search-section {
  padding: var(--spacing-xl) 0;
  background-color: var(--light-color);
  border-bottom: 1px solid var(--color-gray-200);
}

.search-filter-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 900px;
  margin: 0 auto;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl);
  padding-right: calc(var(--spacing-xl) + 1.25rem);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.search-icon {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
}

.filter-item {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-gray);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.875rem;
  border: 1px solid transparent;
}

.filter-item:hover {
  background-color: var(--color-gray-200);
  color: var(--text-primary);
}

.filter-item.active {
  background-color: var(--primary-color);
  color: var(--light-color);
}

/* Popular Integrations Section */
.popular-integrations-section {
  padding: var(--spacing-xxl) 0;
  background-color: var(--light-color);
}

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-xl);
}

.section-header h2 {
  font-size: 2.25rem;
  margin-bottom: var(--spacing-md);
}

.section-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.btn {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: var(--light-color);
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--light-color);
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

/* Integration Categories Section */
.integration-categories-section {
  padding: var(--spacing-xxl) 0;
  background-color: var(--bg-gray);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.category-card {
  background-color: var(--light-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  cursor: pointer;
  text-align: center;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.category-icon {
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
}

.category-card h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
}

.category-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
}

.category-count {
  display: inline-block;
  padding: 2px var(--spacing-md);
  background-color: var(--bg-gray);
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Integration Help Section */
.integration-help-section {
  padding: var(--spacing-xxl) 0;
  background-color: var(--light-color);
}

.help-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xxl);
  align-items: center;
}

.help-text h2 {
  font-size: 2.25rem;
  margin-bottom: var(--spacing-md);
}

.help-text p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.help-actions {
  display: flex;
  gap: var(--spacing-md);
}

.help-image img {
  width: 100%;
  max-width: 450px;
  border-radius: var(--border-radius-lg);
}

/* Modal for Integration Requests */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background-color: var(--light-color);
  border-radius: var(--border-radius-md);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.3s ease;
}

.modal-header {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}

.close-button:hover {
  background-color: var(--color-gray-100);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
}

/* Form Styles */
.form-group {
  margin-bottom: var(--spacing-md);
}

label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

input, textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-primary);
  font-size: 1rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
}

.submit-btn {
  width: 100%;
  padding: var(--spacing-md);
  font-weight: 500;
  margin-top: var(--spacing-md);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Responsive Styles */
@media (max-width: 992px) {
  .integrations-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .help-content {
    grid-template-columns: 1fr;
  }
  
  .help-image {
    display: none;
  }
  
  .hero-title {
    font-size: 2.75rem;
  }
}

@media (max-width: 768px) {
  .integrations-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .help-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle, 
  .section-header p, 
  .help-text p {
    font-size: 1rem;
  }
  
  .section-header h2, 
  .help-text h2 {
    font-size: 1.75rem;
  }
  
  .filter-container {
    overflow-x: auto;
    padding-bottom: var(--spacing-sm);
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
  
  .filter-item {
    white-space: nowrap;
  }
}
</style>
