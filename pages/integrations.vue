<template>
  <div class="integrations-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Connect <span class="highlight">Moonmart</span> with your favorite tools</h1>
          <p class="hero-subtitle">We integrate with over 100+ applications and services to supercharge your workflow and boost productivity.</p>
        </div>
      </div>
    </section>
    
    <!-- Search and Filter Section -->
    <section class="integration-search-section">
      <div class="container">
        <div class="search-filter-container">
          <div class="search-container">
            <input v-model="searchQuery" type="text" placeholder="Search integrations..." class="search-input">
            <div class="search-icon">
              <UIcon dynamic name="i-heroicons-magnifying-glass" />
            </div>
          </div>
          <div class="filter-container">
            <div class="filter-item" :class="{ active: selectedCategory === 'all' }" @click="filterCategory('all')">
              All
            </div>
            <div
v-for="category in categories" :key="category" class="filter-item" 
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
          <div v-for="(category, index) in categoryDetails" :key="index" class="category-card" @click="filterCategory(category.name)">
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


    <!-- Request Integration Modal -->
    <div v-if="showRequestForm" class="modal-overlay" @click="showRequestForm = false">
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
              <input id="integration-name" v-model="requestForm.name" type="text" required placeholder="e.g., Zapier, Asana, etc.">
            </div>
            <div class="form-group">
              <label for="integration-url">Integration Website (optional)</label>
              <input id="integration-url" v-model="requestForm.url" type="url" placeholder="https://...">
            </div>
            <div class="form-group">
              <label for="integration-description">Why do you need this integration?</label>
              <textarea id="integration-description" v-model="requestForm.description" rows="4" required placeholder="Describe how you would use this integration..."/>
            </div>
            <div class="form-group">
              <label for="integration-email">Your Email</label>
              <input id="integration-email" v-model="requestForm.email" type="email" required placeholder="Your email address">
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
    description: 'Connect Moonmart with Slack to send notifications, updates, and alerts to your team channels.',
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
    description: 'Schedule and manage Zoom meetings directly from Moonmart.',
    category: 'Communication',
    popular: true,
    link: '#'
  },
  {
    name: 'Dropbox',
    logo: '/assets/images/integrations/dropbox.svg',
    description: 'Store and share files seamlessly between Moonmart and Dropbox.',
    category: 'Storage',
    popular: false,
    link: '#'
  },
  {
    name: 'Salesforce',
    logo: '/assets/images/integrations/salesforce.svg',
    description: 'Sync customer data, leads, and opportunities between Moonmart and Salesforce CRM.',
    category: 'CRM',
    popular: true,
    link: '#'
  },
  {
    name: 'HubSpot',
    logo: '/assets/images/integrations/hubspot.svg',
    description: 'Connect your marketing, sales, and customer service data between Moonmart and HubSpot.',
    category: 'Marketing',
    popular: true,
    link: '#'
  },
  {
    name: 'Mailchimp',
    logo: '/assets/images/integrations/mailchimp.svg',
    description: 'Sync your email marketing campaigns and contact lists between Moonmart and Mailchimp.',
    category: 'Marketing',
    popular: false,
    link: '#'
  },
  {
    name: 'Asana',
    logo: '/assets/images/integrations/asana.svg',
    description: 'Manage projects and tasks efficiently by connecting Moonmart with Asana.',
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
    description: 'Process payments and manage subscriptions by integrating Moonmart with Stripe.',
    category: 'Finance',
    popular: true,
    link: '#'
  },
  {
    name: 'QuickBooks',
    logo: '/assets/images/integrations/quickbooks.svg',
    description: 'Sync your financial data and accounting records between Moonmart and QuickBooks.',
    category: 'Finance',
    popular: false,
    link: '#'
  },
  {
    name: 'Zendesk',
    logo: '/assets/images/integrations/zendesk.svg',
    description: 'Improve customer support by connecting Moonmart with Zendesk help desk software.',
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
    description: 'Connect Moonmart with 3,000+ apps through automated workflows.',
    category: 'Automation',
    popular: true,
    link: '#'
  },
  {
    name: 'Trello',
    logo: '/assets/images/integrations/trello.svg',
    description: 'Manage your projects with visual boards by connecting Moonmart with Trello.',
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
    description: 'Connect your team communication tools with Moonmart.'
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
    description: 'Integrate your file storage systems with Moonmart.'
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
const submitIntegrationRequest = async () => {
  submitting.value = true;
  try {
    await $fetch('/api/integrations/request', {
      method: 'POST',
      body: {
        name: requestForm.value.name,
        url: requestForm.value.url || undefined,
        description: requestForm.value.description,
        email: requestForm.value.email
      }
    });
    requestForm.value = { name: '', url: '', description: '', email: '' };
    showRequestForm.value = false;
    alert('Your integration request has been submitted. Our team will review it soon!');
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Failed to submit request. Please try again.');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* ── Page wrapper ──────────────────────────────────────────── */
.integrations-page {
  margin-top: 144px;
  min-height: calc(100vh - 144px);
  background: var(--mm-bg);
  color: var(--mm-pearl);
  font-family: var(--f-ui);
}

@media (max-width: 768px) {
  .integrations-page {
    margin-top: 136px;
    min-height: calc(100vh - 136px);
  }
}

/* ── Shared container ──────────────────────────────────────── */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Hero ──────────────────────────────────────────────────── */
.hero-section {
  padding: 72px 0 64px;
  background: var(--mm-bg);
  text-align: center;
}

.hero-content {
  max-width: 760px;
  margin: 0 auto;
}

.hero-title {
  font-family: var(--f-ui);
  font-size: var(--t-3xl);
  font-weight: 700;
  color: var(--mm-pearl);
  line-height: 1.15;
  margin: 0 0 20px;
  letter-spacing: -0.02em;
}

.highlight {
  color: var(--mm-gold);
  position: relative;
  display: inline-block;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 0;
  width: 100%;
  height: 8px;
  background: var(--mm-sea);
  z-index: -1;
  opacity: 0.35;
  border-radius: 2px;
}

.hero-subtitle {
  font-size: var(--t-base);
  font-weight: 400;
  color: var(--mm-silver);
  line-height: 1.65;
  margin: 0 auto;
  max-width: 620px;
}

/* ── Search & Filter ───────────────────────────────────────── */
.integration-search-section {
  padding: 32px 0;
  background: var(--mm-s1);
  border-bottom: 0.5px solid var(--b1);
  position: sticky;
  top: 72px;
  z-index: 20;
}

.search-filter-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-full);
  font-family: var(--f-ui);
  font-size: var(--t-sm);
  background: var(--mm-s2);
  color: var(--mm-pearl);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  box-sizing: border-box;
}

.search-input::placeholder { color: var(--mm-slate); }

.search-input:focus {
  outline: none;
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}

.search-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--mm-slate);
  pointer-events: none;
  display: flex;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.filter-item {
  padding: 5px 14px;
  border-radius: var(--r-full);
  background: var(--mm-s2);
  color: var(--mm-slate);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--t-sm);
  font-weight: 500;
  border: 0.5px solid var(--b1);
  user-select: none;
}

.filter-item:hover {
  background: var(--mm-s3);
  color: var(--mm-silver);
  border-color: var(--b2);
}

.filter-item.active {
  background: var(--mm-gold);
  color: var(--mm-bg);
  border-color: var(--mm-gold);
  font-weight: 700;
}

/* ── Section shared ────────────────────────────────────────── */
.section-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 36px;
}

.section-header h2 {
  font-family: var(--f-ui);
  font-size: var(--t-2xl);
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}

.section-header p {
  font-size: var(--t-base);
  color: var(--mm-silver);
  margin: 0;
  line-height: 1.6;
}

/* ── Integrations grid ─────────────────────────────────────── */
.popular-integrations-section {
  padding: 64px 0;
  background: var(--mm-bg);
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

/* ── Category cards ────────────────────────────────────────── */
.integration-categories-section {
  padding: 64px 0;
  background: var(--mm-s1);
  border-top: 0.5px solid var(--b1);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.category-card {
  background: var(--mm-s2);
  border-radius: var(--bw-radius);
  padding: 28px 20px;
  border: 0.5px solid var(--b1);
  transition: border-color var(--transition-fast), transform var(--transition-normal);
  cursor: pointer;
  text-align: center;
}

.category-card:hover {
  border-color: var(--mm-gold);
  transform: translateY(-3px);
}

.category-icon {
  color: var(--mm-gold);
  background: var(--mm-gold-soft);
  width: 52px;
  height: 52px;
  border-radius: var(--bw-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.category-icon :deep(svg) { width: 22px; height: 22px; }

.category-card h3 {
  font-family: var(--f-ui);
  font-size: var(--t-base);
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 6px;
}

.category-card p {
  font-size: var(--t-sm);
  color: var(--mm-silver);
  margin: 0 0 14px;
  line-height: 1.5;
}

.category-count {
  display: inline-block;
  padding: 2px 12px;
  background: var(--mm-s3);
  border-radius: 999px;
  font-size: var(--t-xs);
  color: var(--mm-slate);
  font-weight: 600;
  border: 0.5px solid var(--b1);
}

/* ── Buttons ───────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: var(--r-md);
  font-family: var(--f-ui);
  font-size: var(--t-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: var(--mm-gold);
  color: var(--mm-bg);
  border: 0.5px solid var(--mm-gold);
}

.btn-primary:hover {
  background: var(--mm-gold-l);
  border-color: var(--mm-gold-l);
}

.btn-outline {
  background: transparent;
  border: 0.5px solid var(--b2);
  color: var(--mm-silver);
}

.btn-outline:hover {
  border-color: var(--mm-gold);
  color: var(--mm-gold);
}

/* ── Modal ─────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 9, 15, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: var(--mm-s1);
  border-radius: var(--bw-radius-lg);
  border: 0.5px solid var(--b2);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  animation: scaleIn 0.25s ease;
}

.modal-header {
  padding: 20px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.5px solid var(--b1);
}

.modal-header h3 {
  font-family: var(--f-ui);
  font-size: var(--t-md);
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  background: var(--mm-s2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--mm-slate);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast), background var(--transition-fast);
}

.close-button:hover {
  background: var(--mm-s3);
  color: var(--mm-pearl);
}

.modal-body {
  padding: 20px 24px 24px;
}

/* ── Form ──────────────────────────────────────────────────── */
.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: var(--t-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mm-slate);
}

input, textarea {
  width: 100%;
  padding: 9px 12px;
  border: 0.5px solid var(--b2);
  border-radius: var(--r-md);
  font-family: var(--f-ui);
  font-size: var(--t-sm);
  background: var(--mm-s2);
  color: var(--mm-pearl);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  box-sizing: border-box;
}

input::placeholder, textarea::placeholder { color: var(--mm-slate); }

input:focus, textarea:focus {
  outline: none;
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 3px var(--mm-gold-soft);
}

.submit-btn {
  width: 100%;
  justify-content: center;
  padding: 11px 20px;
  margin-top: 8px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Animations ────────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 992px) {
  .integrations-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  .hero-title { font-size: var(--t-2xl); }
}

@media (max-width: 768px) {
  .hero-section { padding: 48px 0 40px; }
  .hero-title { font-size: clamp(28px, 7vw, 40px); }
  .integrations-grid { grid-template-columns: 1fr; }
  .categories-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
  .section-header h2 { font-size: var(--t-xl); }
  .btn { width: 100%; justify-content: center; }
  .integration-search-section { position: static; }
}
</style>
