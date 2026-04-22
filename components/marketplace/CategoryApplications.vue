<template>
  <div class="category-applications">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading applications...</p>
    </div>
    
    <div v-else-if="applications.length === 0" class="no-results">
      <div class="no-results-icon">
        <UIcon name="i-heroicons-magnifying-glass" dynamic  />
      </div>
      <h3>No applications found for this category</h3>
      <p>Try selecting a different category</p>
    </div>
    
    <template v-else>
      <!-- Section: Sponsored Applications -->
      <div v-if="sponsoredApps.length > 0" class="section-container">
        <h2 class="section-title">
          <UIcon name="i-heroicons-sparkles" dynamic class="section-icon"  />
          Sponsored Applications
        </h2>
        <div class="apps-grid">
          <div v-for="app in sponsoredApps" :key="app.id" class="grid-item">
            <ProductCard 
              :product="transformAppData(app, 'sponsored')"
              layout="vertical"
              variant="sponsored"
              @view-details="navigateToApp"
              @toggle-favorite="handleToggleFavorite"
              @card-click="navigateToApp"
            />
          </div>
        </div>
      </div>
      
      <!-- Section: Trending Applications -->
      <div v-if="trendingApps.length > 0" class="section-container">
        <h2 class="section-title">
          <UIcon name="i-heroicons-chart-bar-solid" dynamic class="section-icon" />
          Trending Applications
        </h2>
        <div class="apps-grid">
          <div v-for="app in trendingApps" :key="app.id" class="grid-item">
            <ProductCard 
              :product="transformAppData(app, 'trending')"
              layout="vertical"
              variant="trending"
              @view-details="navigateToApp"
              @toggle-favorite="handleToggleFavorite"
              @card-click="navigateToApp"
            />
          </div>
        </div>
      </div>
      
      <!-- Section: All Category Applications -->
      <div class="section-container">
        <h2 class="section-title">
          <UIcon name="i-heroicons-squares-2x2" dynamic class="section-icon" />
          {{ getCategoryName(props.selectedCategory) }} Applications
        </h2>
        <div class="apps-grid">
          <div v-for="app in regularApps" :key="app.id" class="grid-item">
            <ProductCard 
              :product="transformAppData(app, 'regular')"
              layout="vertical"
              variant="regular"
              @view-details="navigateToApp"
              @toggle-favorite="handleToggleFavorite"
              @card-click="navigateToApp"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, useNuxtApp } from '#imports';
import { useRoute, useRouter } from '#app';

// Use the global market from plugin with safety checks
const nuxtApp = useNuxtApp();
let formatCurrency, getLocalizedPrice, currentRegionSettings;

try {
  // Try to use the global market plugin
  if (nuxtApp.$globalMarket) {
    formatCurrency = nuxtApp.$globalMarket.formatCurrency;
    getLocalizedPrice = nuxtApp.$globalMarket.getLocalizedPrice;
    currentRegionSettings = nuxtApp.$globalMarket.currentRegionSettings;
  } else {
    // Fallback implementation if plugin not available
    console.warn('Global market plugin not available in CategoryApplications');
    formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
    getLocalizedPrice = (amount: number) => amount;
    currentRegionSettings = computed(() => ({ 
      currency: 'USD', 
      locale: 'en-US',
      name: 'United States',
      tax: 8.5,
      flag: 'us'
    }));
  }
} catch (error) {
  console.error('Error setting up global market in CategoryApplications:', error);
  // Safe fallbacks
  formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  getLocalizedPrice = (amount: number) => amount;
  currentRegionSettings = computed(() => ({ 
    currency: 'USD', 
    locale: 'en-US',
    name: 'United States',
    tax: 8.5,
    flag: 'us'
  }));
}

// Define props
const props = defineProps<{
  selectedCategory: string;
}>();

// Types
interface AppPricing {
  type: 'free' | 'trial' | 'paid';
  value?: number;
  period?: string;
}

interface Application {
  id: string;
  name: string;
  logo: string;
  provider?: string;
  description: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  pricing: AppPricing;
  category: string;
  featured?: boolean;
  trending?: boolean;
  sponsored?: boolean;
  addedDate?: string;
}

// Categories data mapping
const categories = [
  { id: 'crm', name: 'CRM', icon: 'heroicons:user-group' },
  { id: 'marketing', name: 'Marketing', icon: 'heroicons:megaphone' },
  { id: 'productivity', name: 'Productivity', icon: 'heroicons:clipboard-document-check' },
  { id: 'development', name: 'Development', icon: 'heroicons:code-bracket' },
  { id: 'integration', name: 'Integration', icon: 'heroicons:arrows-right-left' },
  { id: 'finance', name: 'Finance', icon: 'heroicons:currency-dollar' },
  { id: 'communication', name: 'Communication', icon: 'heroicons:chat-bubble-oval-left-ellipsis' },
  { id: 'customer-support', name: 'Customer Support', icon: 'heroicons:lifebuoy' },
  { id: 'cloud', name: 'Cloud Services', icon: 'heroicons:cloud' },
  { id: 'design', name: 'Design', icon: 'heroicons:pencil-square' },
  { id: 'hr', name: 'HR & Recruiting', icon: 'heroicons:briefcase' },
  { id: 'analytics', name: 'Analytics', icon: 'heroicons:chart-bar' },
  { id: 'project-management', name: 'Project Management', icon: 'heroicons:clipboard-document-list' },
  { id: 'security', name: 'Security', icon: 'heroicons:shield-check' },
  { id: 'social-media', name: 'Social Media', icon: 'heroicons:share' },
  { id: 'education', name: 'Education', icon: 'heroicons:academic-cap' },
  { id: 'e-commerce', name: 'E-commerce', icon: 'heroicons:shopping-cart' }
];

// Get category name from id
const getCategoryName = (categoryId: string): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};

// State
const applications = ref<Application[]>([]);
const loading = ref(true);

// Router
const route = useRoute();
const router = useRouter();

// Navigation function
const navigateToApp = (appId: string) => {
  router.push(`/marketplace/app/${appId}`);
};

// Transform app data for the global ProductCard component
const transformAppData = (app: Application, variant: 'regular' | 'sponsored' | 'trending' = 'regular') => {
  // Generate mock growth stats for trending apps
  const growthStats = variant === 'trending' ? {
    percentage: Math.floor(Math.random() * 50) + 10, // 10-60% growth
    period: 'week',
    trend: 'up' as const
  } : undefined;

  // Generate mock premium features for sponsored apps
  const premiumFeatures = variant === 'sponsored' ? [
    'Premium Support',
    'Advanced Analytics',
    '99.9% Uptime',
    'Priority Integration',
    'Dedicated Manager'
  ] : undefined;

  return {
    id: app.id,
    name: app.name,
    logo: app.logo,
    rating: app.rating,
    reviewCount: app.reviewCount,
    activeUsers: Math.floor(Math.random() * 100000) + 10000, // Mock active users data
    pricing: app.pricing,
    isFavorited: false, // TODO: Implement favorites system
    growthStats,
    premiumFeatures
  };
};

// Handle favorite toggle
const handleToggleFavorite = (appId: string, isFavorited: boolean) => {
  console.log(`Toggle favorite for ${appId}: ${isFavorited}`);
  // TODO: Implement favorites persistence
};

// Computed properties for different app sections
const sponsoredApps = computed(() => {
  return applications.value.filter(app => app.sponsored);
});

const trendingApps = computed(() => {
  const filtered = applications.value.filter(app => app.trending && !app.sponsored);
  return filtered;
});

const regularApps = computed(() => {
  const filtered = applications.value.filter(app => !app.sponsored && !app.trending);
  return filtered;
});

// Utility functions
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatPrice = (pricing: AppPricing): string => {
  if (pricing.type === 'free') return 'Free';
  if (pricing.type === 'trial') return 'Free Trial';
  
  const value = pricing.value || 0;
  const period = pricing.period || 'month';
  
  const localizedPrice = getLocalizedPrice(value);
  return `${formatCurrency(localizedPrice)}/${period}`;
};

// Image error handling
const handleImageError = (event: Event, app: Application) => {
  const target = event.target as HTMLImageElement;
  
  // First try to find an alternative image based on category or name
  const appNameLower = app.name.toLowerCase();
  const categoryLower = app.category.toLowerCase();
  
  // List of integration icons available
  const integrationIcons = [
    'salesforce', 'slack', 'google', 'microsoft', 'zoom', 'dropbox', 'github', 
    'asana', 'zapier', 'trello', 'jira', 'hubspot', 'mailchimp', 'stripe', 
    'zendesk', 'aws', 'docusign', 'quickbooks', 'linkedin'
  ];
  
  // Try to match app name or category to available icons
  for (const icon of integrationIcons) {
    if (appNameLower.includes(icon) || categoryLower.includes(icon)) {
      target.src = `/assets/images/integrations/${icon}.svg`;
      return;
    }
  }
  
  // Category-specific fallback icons
  if (categoryLower === 'crm' || appNameLower.includes('crm')) {
    target.src = '/assets/images/integrations/salesforce.svg';
  } else if (categoryLower === 'communication' || appNameLower.includes('chat')) {
    target.src = '/assets/images/integrations/slack.svg';
  } else if (categoryLower === 'productivity' || appNameLower.includes('tasks')) {
    target.src = '/assets/images/integrations/asana.svg';
  } else if (categoryLower === 'development' || appNameLower.includes('code')) {
    target.src = '/assets/images/integrations/github.svg';
  } else if (categoryLower === 'finance' || appNameLower.includes('payment')) {
    target.src = '/assets/images/integrations/stripe.svg';
  } else {
    target.src = '/assets/images/integrations/integration-support.svg';
  }
};

// Load applications
const loadApplications = async () => {
  loading.value = true;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Extended mock data with at least 10 apps for each major category
  let allMockApps: Application[] = [
    // CRM Category
    {
      id: 'crm-001',
      name: 'SalesForce CRM',
      logo: '/assets/images/integrations/salesforce.svg',
      provider: 'Salesforce Inc.',
      description: 'Complete customer relationship management platform with analytics, automation, and integrations.',
      rating: 4.7,
      reviewCount: 256,
      tags: ['CRM', 'Sales', 'Marketing'],
      pricing: { type: 'paid', value: 29, period: 'month' },
      category: 'crm',
      featured: true,
      sponsored: true,
      addedDate: '2025-03-15'
    },
    {
      id: 'crm-002',
      name: 'HubSpot CRM',
      logo: '/assets/images/integrations/hubspot.svg',
      provider: 'HubSpot Inc.',
      description: 'Customer relationship management platform with marketing, sales, customer service, and CMS capabilities.',
      rating: 4.5,
      reviewCount: 387,
      tags: ['CRM', 'Marketing', 'Sales'],
      pricing: { type: 'paid', value: 45, period: 'month' },
      category: 'crm',
      addedDate: '2025-02-15',
      sponsored: true
    },
    {
      id: 'crm-003',
      name: 'Zoho CRM',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Zoho Corporation',
      description: 'Web-based CRM designed to attract, retain, and satisfy customers to grow your business.',
      rating: 4.3,
      reviewCount: 215,
      tags: ['CRM', 'Sales', 'Customer Service'],
      pricing: { type: 'paid', value: 14, period: 'month' },
      category: 'crm',
      addedDate: '2025-01-10',
      trending: true
    },
    {
      id: 'crm-004',
      name: 'Microsoft Dynamics 365',
      logo: '/assets/images/integrations/microsoft.svg',
      provider: 'Microsoft',
      description: 'Unified CRM and ERP capabilities with AI insights to drive better customer engagement and satisfaction.',
      rating: 4.4,
      reviewCount: 189,
      tags: ['CRM', 'ERP', 'Business Intelligence'],
      pricing: { type: 'paid', value: 65, period: 'month' },
      category: 'crm',
      addedDate: '2024-12-05'
    },
    {
      id: 'crm-005',
      name: 'Pipedrive',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Pipedrive Inc.',
      description: 'Sales-focused CRM tool designed to help you close deals by visualizing your sales pipeline.',
      rating: 4.2,
      reviewCount: 176,
      tags: ['CRM', 'Sales Pipeline', 'Deal Management'],
      pricing: { type: 'trial', value: 15, period: 'month' },
      category: 'crm',
      addedDate: '2025-03-20'
    },
    {
      id: 'crm-006',
      name: 'Freshsales CRM',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Freshworks Inc.',
      description: 'Modern CRM with built-in phone, email, and activity tracking to engage with prospects better.',
      rating: 4.1,
      reviewCount: 132,
      tags: ['CRM', 'Contact Management', 'Lead Scoring'],
      pricing: { type: 'free', value: 0, period: 'month' },
      category: 'crm',
      addedDate: '2025-04-15'
    },
    {
      id: 'crm-007',
      name: 'Insightly CRM',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Insightly Inc.',
      description: 'Project management and CRM solution to build relationships and deliver projects successfully.',
      rating: 4.0,
      reviewCount: 124,
      tags: ['CRM', 'Project Management', 'Relationship Mapping'],
      pricing: { type: 'paid', value: 29, period: 'month' },
      category: 'crm',
      addedDate: '2025-02-10'
    },
    {
      id: 'crm-008',
      name: 'Agile CRM',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Agile CRM Inc.',
      description: 'All-in-one CRM with sales, marketing, and service automation in a single platform.',
      rating: 3.9,
      reviewCount: 110,
      tags: ['CRM', 'Marketing Automation', 'Helpdesk'],
      pricing: { type: 'paid', value: 9, period: 'month' },
      category: 'crm',
      addedDate: '2024-11-25'
    },
    {
      id: 'crm-009',
      name: 'Close CRM',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Close.io',
      description: 'Sales communication platform with built-in calling, SMS, and email sequences.',
      rating: 4.4,
      reviewCount: 98,
      tags: ['CRM', 'Sales Communication', 'Email Tracking'],
      pricing: { type: 'paid', value: 25, period: 'month' },
      category: 'crm',
      addedDate: '2025-05-05',
      trending: true
    },
    {
      id: 'crm-010',
      name: 'Copper CRM',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Copper Inc.',
      description: 'CRM designed for G Suite users to eliminate manual data entry and help teams work together.',
      rating: 4.2,
      reviewCount: 87,
      tags: ['CRM', 'G Suite', 'Relationship Management'],
      pricing: { type: 'paid', value: 19, period: 'month' },
      category: 'crm',
      addedDate: '2025-01-30'
    },
    
    // Marketing Category
    {
      id: 'marketing-001',
      name: 'Mailchimp Marketing',
      logo: '/assets/images/integrations/mailchimp.svg',
      provider: 'Mailchimp',
      description: 'Email marketing platform with campaign creation, automation, subscriber management, and analytics.',
      rating: 4.3,
      reviewCount: 178,
      tags: ['Email', 'Marketing', 'Automation'],
      pricing: { type: 'paid', value: 14, period: 'month' },
      category: 'marketing',
      addedDate: '2025-02-28',
      sponsored: true
    },
    {
      id: 'marketing-002',
      name: 'SEMrush',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'SEMrush',
      description: 'All-in-one marketing toolkit for digital marketing professionals to improve online visibility.',
      rating: 4.6,
      reviewCount: 245,
      tags: ['SEO', 'SEM', 'Competitor Analysis'],
      pricing: { type: 'paid', value: 119, period: 'month' },
      category: 'marketing',
      addedDate: '2025-03-15',
      trending: true
    },
    {
      id: 'marketing-003',
      name: 'HubSpot Marketing',
      logo: '/assets/images/integrations/hubspot.svg',
      provider: 'HubSpot Inc.',
      description: 'Complete marketing automation software with lead generation and inbound marketing tools.',
      rating: 4.5,
      reviewCount: 312,
      tags: ['Inbound Marketing', 'Lead Generation', 'Analytics'],
      pricing: { type: 'paid', value: 45, period: 'month' },
      category: 'marketing',
      addedDate: '2025-01-20',
      sponsored: true
    },
    {
      id: 'marketing-004',
      name: 'Canva Pro',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Canva Pty Ltd',
      description: 'Graphic design platform that allows users to create social media graphics, presentations, and other visual content.',
      rating: 4.8,
      reviewCount: 427,
      tags: ['Design', 'Content Creation', 'Social Media'],
      pricing: { type: 'paid', value: 12.99, period: 'month' },
      category: 'marketing',
      addedDate: '2024-12-10'
    },
    {
      id: 'marketing-005',
      name: 'Buffer',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Buffer Inc.',
      description: 'Social media management platform to schedule posts, track performance, and manage accounts.',
      rating: 4.4,
      reviewCount: 186,
      tags: ['Social Media', 'Content Scheduling', 'Analytics'],
      pricing: { type: 'trial', value: 15, period: 'month' },
      category: 'marketing',
      addedDate: '2025-02-05'
    },
    {
      id: 'marketing-006',
      name: 'Hootsuite',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Hootsuite Inc.',
      description: 'Social media management platform that supports social network integrations for multiple accounts.',
      rating: 4.2,
      reviewCount: 215,
      tags: ['Social Media', 'Marketing', 'Team Collaboration'],
      pricing: { type: 'paid', value: 49, period: 'month' },
      category: 'marketing',
      addedDate: '2025-04-10',
      trending: true
    },
    {
      id: 'marketing-007',
      name: 'Adobe Campaign',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Adobe Inc.',
      description: 'Multi-channel campaign management solution for designing customer experiences and automating campaigns.',
      rating: 4.3,
      reviewCount: 142,
      tags: ['Campaign Management', 'Email Marketing', 'Personalization'],
      pricing: { type: 'paid', value: 150, period: 'month' },
      category: 'marketing',
      addedDate: '2025-03-25'
    },
    {
      id: 'marketing-008',
      name: 'ActiveCampaign',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'ActiveCampaign LLC',
      description: 'Customer experience automation platform that helps businesses connect and engage with customers.',
      rating: 4.5,
      reviewCount: 198,
      tags: ['Email Marketing', 'Automation', 'CRM'],
      pricing: { type: 'paid', value: 29, period: 'month' },
      category: 'marketing',
      addedDate: '2024-11-15'
    },
    {
      id: 'marketing-009',
      name: 'Ahrefs',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Ahrefs Pte Ltd',
      description: 'SEO tools to grow search traffic, research competitors, and monitor your niche.',
      rating: 4.7,
      reviewCount: 287,
      tags: ['SEO', 'Keyword Research', 'Backlink Analysis'],
      pricing: { type: 'paid', value: 99, period: 'month' },
      category: 'marketing',
      addedDate: '2025-01-05'
    },
    {
      id: 'marketing-010',
      name: 'Constant Contact',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Constant Contact Inc.',
      description: 'Email marketing platform with templates, list management, and tracking tools.',
      rating: 4.0,
      reviewCount: 156,
      tags: ['Email Marketing', 'Contact Management', 'Analytics'],
      pricing: { type: 'paid', value: 20, period: 'month' },
      category: 'marketing',
      addedDate: '2025-05-20'
    },
    
    // Productivity Category
    {
      id: 'productivity-001',
      name: 'Asana Tasks',
      logo: '/assets/images/integrations/asana.svg',
      provider: 'Asana Inc.',
      description: 'Advanced project management tool with team collaboration features, timeline tracking, and resource allocation.',
      rating: 4.5,
      reviewCount: 189,
      tags: ['Project Management', 'Collaboration'],
      pricing: { type: 'trial', value: 19, period: 'month' },
      category: 'productivity',
      trending: true,
      addedDate: '2025-04-20'
    },
    {
      id: 'productivity-002',
      name: 'Trello Boards',
      logo: '/assets/images/integrations/trello.svg',
      provider: 'Atlassian',
      description: 'Visual project management with customizable boards, lists, and cards to organize and prioritize projects.',
      rating: 4.4,
      reviewCount: 215,
      tags: ['Organization', 'Productivity', 'Kanban'],
      pricing: { type: 'free', value: 0, period: 'month' },
      category: 'productivity',
      addedDate: '2024-12-10'
    },
    {
      id: 'productivity-003',
      name: 'Monday.com',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'monday.com Ltd.',
      description: 'Work operating system (Work OS) to build custom workflow apps in minutes.',
      rating: 4.6,
      reviewCount: 325,
      tags: ['Work OS', 'Project Management', 'Team Collaboration'],
      pricing: { type: 'paid', value: 10, period: 'month' },
      category: 'productivity',
      addedDate: '2025-01-15',
      sponsored: true
    },
    {
      id: 'productivity-004',
      name: 'Notion',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Notion Labs, Inc.',
      description: 'All-in-one workspace for notes, documents, wikis, projects, and team collaboration.',
      rating: 4.7,
      reviewCount: 356,
      tags: ['Notes', 'Wikis', 'Project Management'],
      pricing: { type: 'free', value: 0, period: 'month' },
      category: 'productivity',
      addedDate: '2025-03-10',
      trending: true
    },
    {
      id: 'productivity-005',
      name: 'Evernote',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Evernote Corporation',
      description: 'Note-taking app designed for organizing, task management and archiving.',
      rating: 4.3,
      reviewCount: 278,
      tags: ['Notes', 'Organization', 'Task Management'],
      pricing: { type: 'paid', value: 7.99, period: 'month' },
      category: 'productivity',
      addedDate: '2025-02-25'
    },
    {
      id: 'productivity-006',
      name: 'ClickUp',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'ClickUp',
      description: 'Project management platform to replace all productivity tools with a single solution.',
      rating: 4.5,
      reviewCount: 198,
      tags: ['Project Management', 'Task Tracking', 'Docs'],
      pricing: { type: 'free', value: 0, period: 'month' },
      category: 'productivity',
      addedDate: '2025-04-05'
    },
    {
      id: 'productivity-007',
      name: 'Todoist',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'Doist',
      description: 'Task manager and to-do list app that helps organize work and life.',
      rating: 4.4,
      reviewCount: 187,
      tags: ['Task Management', 'To-Do Lists', 'Reminders'],
      pricing: { type: 'paid', value: 4, period: 'month' },
      category: 'productivity',
      addedDate: '2024-11-20'
    },
    {
      id: 'productivity-008',
      name: 'Slack',
      logo: '/assets/images/integrations/slack.svg',
      provider: 'Slack Technologies',
      description: 'Business communication platform offering many IRC-style features, including persistent chat rooms.',
      rating: 4.8,
      reviewCount: 423,
      tags: ['Communication', 'Team Collaboration', 'Chat'],
      pricing: { type: 'paid', value: 8, period: 'month' },
      category: 'productivity',
      addedDate: '2025-02-10',
      sponsored: true
    },
    {
      id: 'productivity-009',
      name: 'Google Workspace',
      logo: '/assets/images/integrations/google.svg',
      provider: 'Google LLC',
      description: 'Collection of cloud computing, productivity and collaboration tools, software and products.',
      rating: 4.6,
      reviewCount: 387,
      tags: ['Email', 'Docs', 'Cloud Storage'],
      pricing: { type: 'paid', value: 6, period: 'month' },
      category: 'productivity',
      addedDate: '2024-12-15'
    },
    {
      id: 'productivity-010',
      name: 'Microsoft 365',
      logo: '/assets/images/integrations/microsoft.svg',
      provider: 'Microsoft',
      description: 'Subscription service offering Microsoft Office apps and cloud services.',
      rating: 4.5,
      reviewCount: 356,
      tags: ['Office', 'Email', 'Cloud Storage'],
      pricing: { type: 'paid', value: 5, period: 'month' },
      category: 'productivity',
      addedDate: '2025-01-05'
    },
    
    // Development Category
    {
      id: 'development-001',
      name: 'GitHub Enterprise',
      logo: '/assets/images/integrations/github.svg',
      provider: 'Microsoft',
      description: 'Enterprise-level code hosting platform with advanced security features, code review tools, and CI/CD integration.',
      rating: 4.8,
      reviewCount: 312,
      tags: ['Version Control', 'Code', 'Development'],
      pricing: { type: 'paid', value: 21, period: 'user/month' },
      category: 'development',
      addedDate: '2025-01-15',
      sponsored: true
    },
    {
      id: 'development-002',
      name: 'GitLab',
      logo: '/assets/images/integrations/integration-support.svg',
      provider: 'GitLab Inc.',
      description: 'Complete DevOps platform delivered as a single application for all stages of the DevOps lifecycle.',
      rating: 4.7,
      reviewCount: 287,
      tags: ['CI/CD', 'DevOps', 'Version Control'],
      pricing: { type: 'paid', value: 19, period: 'user/month' },
      category: 'development',
      addedDate: '2025-02-20'
    },
    {
      id: 'development-003',
      name: 'Visual Studio Code',
      logo: '/assets/images/integrations/microsoft.svg',
      provider: 'Microsoft',
      description: 'Free source-code editor made by Microsoft for Windows, Linux and macOS with debugging and Git support.',
      rating: 4.9,
      reviewCount: 523,
      tags: ['Code Editor', 'IDE', 'Development Tool'],
      pricing: { type: 'free', value: 0, period: 'month' },
      category: 'development',
      addedDate: '2024-12-05',
      trending: true
    },
    
    // Add at least 10 apps for each main category...
    
    // Integration Category
    {
      id: 'integration-001',
      name: 'Zapier Connect',
      logo: '/assets/images/integrations/zapier.svg',
      provider: 'Zapier Inc.',
      description: 'Real-time data synchronization platform for businesses with multi-source integration capabilities.',
      rating: 4.2,
      reviewCount: 127,
      tags: ['Data', 'Integration', 'Sync'],
      pricing: { type: 'paid', value: 49, period: 'month' },
      category: 'integration',
      trending: true,
      addedDate: '2025-05-05'
    },
    
    // Finance Category
    {
      id: 'finance-001',
      name: 'Stripe Payments',
      logo: '/assets/images/integrations/stripe.svg',
      provider: 'Stripe Inc.',
      description: 'Online payment processing for internet businesses. Offers APIs for customizable checkouts and subscriptions.',
      rating: 4.9,
      reviewCount: 476,
      tags: ['Payments', 'Finance', 'E-commerce'],
      pricing: { type: 'paid', value: 0, period: 'transaction' },
      category: 'finance',
      addedDate: '2025-05-20',
      trending: true
    },
    {
      id: 'finance-002',
      name: 'QuickBooks',
      logo: '/assets/images/integrations/quickbooks.svg',
      provider: 'Intuit Inc.',
      description: 'Accounting software that handles payment, payroll, bills, and invoicing.',
      rating: 4.6,
      reviewCount: 385,
      tags: ['Accounting', 'Bookkeeping', 'Invoicing'],
      pricing: { type: 'paid', value: 25, period: 'month' },
      category: 'finance',
      addedDate: '2025-01-10',
      sponsored: true
    },
    
    // Customer Support Category
    {
      id: 'customer-support-001',
      name: 'Zendesk Support',
      logo: '/assets/images/integrations/zendesk.svg',
      provider: 'Zendesk Inc.',
      description: 'Customer service software and support ticketing system with knowledge base, live chat, and automation.',
      rating: 4.6,
      reviewCount: 324,
      tags: ['Support', 'Customer Service', 'Tickets'],
      pricing: { type: 'paid', value: 19, period: 'agent/month' },
      category: 'customer-support',
      trending: true,
      addedDate: '2025-04-10'
    },
    
    // Communication Category
    {
      id: 'communication-001',
      name: 'Zoom Meetings',
      logo: '/assets/images/integrations/zoom.svg',
      provider: 'Zoom Video Communications',
      description: 'Video conferencing, web conferencing, webinars, and screen-sharing software with mobile collaboration.',
      rating: 4.7,
      reviewCount: 521,
      tags: ['Video', 'Conferencing', 'Meetings'],
      pricing: { type: 'paid', value: 14.99, period: 'host/month' },
      category: 'communication',
      addedDate: '2025-03-01',
      sponsored: true
    },
    
    // Cloud Category
    {
      id: 'cloud-001',
      name: 'AWS Cloud',
      logo: '/assets/images/integrations/aws.svg',
      provider: 'Amazon',
      description: 'Comprehensive cloud services platform offering compute power, database storage, content delivery, and more.',
      rating: 4.8,
      reviewCount: 648,
      tags: ['Cloud', 'Hosting', 'Infrastructure'],
      pricing: { type: 'paid', value: 0, period: 'usage' },
      category: 'cloud',
      trending: true,
      addedDate: '2025-05-15'
    }
  ];
  
  // Add more apps for additional categories
  
  // Design Category
  if (props.selectedCategory === 'design' && !allMockApps.some(app => app.category === 'design')) {
    allMockApps = [...allMockApps, 
      {
        id: 'design-001',
        name: 'Figma',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Figma, Inc.',
        description: 'Collaborative design tool for teams to work together on interface design projects.',
        rating: 4.8,
        reviewCount: 423,
        tags: ['UI Design', 'Prototyping', 'Collaboration'],
        pricing: { type: 'trial', value: 15, period: 'month' },
        category: 'design',
        addedDate: '2025-03-10',
        sponsored: true
      },
      {
        id: 'design-002',
        name: 'Adobe XD',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Adobe Inc.',
        description: 'Vector-based user experience design tool for web apps and mobile apps.',
        rating: 4.5,
        reviewCount: 345,
        tags: ['UX Design', 'Prototyping', 'Wireframing'],
        pricing: { type: 'paid', value: 9.99, period: 'month' },
        category: 'design',
        addedDate: '2025-02-15',
        trending: true
      },
      {
        id: 'design-003',
        name: 'Sketch',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Sketch B.V.',
        description: 'Digital design toolkit with an intuitive interface for creating high-quality assets.',
        rating: 4.6,
        reviewCount: 287,
        tags: ['UI Design', 'Vector Editing', 'Prototyping'],
        pricing: { type: 'paid', value: 99, period: 'year' },
        category: 'design',
        addedDate: '2025-01-20'
      },
      {
        id: 'design-004',
        name: 'InVision',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'InVision',
        description: 'Digital product design platform with tools for ideation, design, prototyping, and collaboration.',
        rating: 4.3,
        reviewCount: 213,
        tags: ['Prototyping', 'Design Systems', 'Collaboration'],
        pricing: { type: 'trial', value: 19, period: 'month' },
        category: 'design',
        addedDate: '2025-02-28'
      },
      {
        id: 'design-005',
        name: 'Adobe Photoshop',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Adobe Inc.',
        description: 'Industry-standard photo editing software with advanced creative tools.',
        rating: 4.7,
        reviewCount: 512,
        tags: ['Photo Editing', 'Graphic Design', 'Illustration'],
        pricing: { type: 'paid', value: 20.99, period: 'month' },
        category: 'design',
        addedDate: '2025-03-15',
        trending: true
      },
      {
        id: 'design-006',
        name: 'Adobe Illustrator',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Adobe Inc.',
        description: 'Industry-standard vector graphics software for creating logos, icons, and illustrations.',
        rating: 4.6,
        reviewCount: 432,
        tags: ['Vector Graphics', 'Logo Design', 'Illustration'],
        pricing: { type: 'paid', value: 20.99, period: 'month' },
        category: 'design',
        addedDate: '2025-01-05'
      },
      {
        id: 'design-007',
        name: 'Affinity Designer',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Serif Ltd.',
        description: 'Professional graphic design software with pixel-perfect tools for vector and raster design.',
        rating: 4.4,
        reviewCount: 178,
        tags: ['Vector Graphics', 'Illustration', 'Graphic Design'],
        pricing: { type: 'paid', value: 54.99, period: 'one-time' },
        category: 'design',
        addedDate: '2025-04-10'
      },
      {
        id: 'design-008',
        name: 'Procreate',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Savage Interactive',
        description: 'Powerful sketching, painting, and illustration app designed for tablet users.',
        rating: 4.9,
        reviewCount: 624,
        tags: ['Digital Painting', 'Illustration', 'Drawing'],
        pricing: { type: 'paid', value: 9.99, period: 'one-time' },
        category: 'design',
        addedDate: '2025-05-01'
      },
      {
        id: 'design-009',
        name: 'Blender',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Blender Foundation',
        description: 'Free and open-source 3D computer graphics software for creating animated films, visual effects, and 3D models.',
        rating: 4.5,
        reviewCount: 312,
        tags: ['3D Modeling', 'Animation', 'Rendering'],
        pricing: { type: 'free', value: 0, period: 'month' },
        category: 'design',
        addedDate: '2025-03-28'
      },
      {
        id: 'design-010',
        name: 'CorelDRAW',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Corel Corporation',
        description: 'Professional vector illustration and page layout software for graphic design.',
        rating: 4.2,
        reviewCount: 187,
        tags: ['Vector Graphics', 'Page Layout', 'Typography'],
        pricing: { type: 'paid', value: 22.99, period: 'month' },
        category: 'design',
        addedDate: '2025-02-10',
        sponsored: true
      }
    ];
  }
  
  // Analytics Category
  if (props.selectedCategory === 'analytics' && !allMockApps.some(app => app.category === 'analytics')) {
    allMockApps = [...allMockApps, 
      {
        id: 'analytics-001',
        name: 'Google Analytics',
        logo: '/assets/images/integrations/google.svg',
        provider: 'Google',
        description: 'Web analytics service that tracks and reports website traffic and user behavior.',
        rating: 4.7,
        reviewCount: 587,
        tags: ['Web Analytics', 'Traffic Analysis', 'Reporting'],
        pricing: { type: 'free', value: 0, period: 'month' },
        category: 'analytics',
        addedDate: '2025-01-15',
        sponsored: true
      },
      {
        id: 'analytics-002',
        name: 'Mixpanel',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Mixpanel Inc.',
        description: 'Product analytics platform that helps businesses analyze user behavior across their applications.',
        rating: 4.5,
        reviewCount: 312,
        tags: ['Product Analytics', 'User Behavior', 'Event Tracking'],
        pricing: { type: 'trial', value: 25, period: 'month' },
        category: 'analytics',
        addedDate: '2025-02-20',
        trending: true
      },
      {
        id: 'analytics-003',
        name: 'Tableau',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Salesforce',
        description: 'Interactive data visualization and business intelligence software focused on data analysis.',
        rating: 4.6,
        reviewCount: 423,
        tags: ['Data Visualization', 'Business Intelligence', 'Reporting'],
        pricing: { type: 'paid', value: 70, period: 'month' },
        category: 'analytics',
        addedDate: '2025-03-10'
      },
      {
        id: 'analytics-004',
        name: 'Amplitude',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Amplitude Inc.',
        description: 'Digital analytics platform that helps companies build better products through data-driven decisions.',
        rating: 4.4,
        reviewCount: 287,
        tags: ['Product Analytics', 'User Insights', 'Behavioral Analytics'],
        pricing: { type: 'trial', value: 40, period: 'month' },
        category: 'analytics',
        addedDate: '2025-02-05',
        trending: true
      },
      {
        id: 'analytics-005',
        name: 'Looker',
        logo: '/assets/images/integrations/google.svg',
        provider: 'Google Cloud',
        description: 'Business intelligence and big data analytics platform that helps explore, share, and visualize data.',
        rating: 4.3,
        reviewCount: 213,
        tags: ['Business Intelligence', 'Data Modeling', 'Dashboards'],
        pricing: { type: 'paid', value: 3000, period: 'year' },
        category: 'analytics',
        addedDate: '2025-04-15'
      },
      {
        id: 'analytics-006',
        name: 'Hotjar',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Hotjar Ltd.',
        description: 'Behavior analytics and user feedback tool that helps understand user behavior on websites.',
        rating: 4.5,
        reviewCount: 342,
        tags: ['Heatmaps', 'Session Recording', 'User Feedback'],
        pricing: { type: 'trial', value: 32, period: 'month' },
        category: 'analytics',
        addedDate: '2025-01-25'
      },
      {
        id: 'analytics-007',
        name: 'Power BI',
        logo: '/assets/images/integrations/microsoft.svg',
        provider: 'Microsoft',
        description: 'Interactive data visualization tools with self-service business intelligence capabilities.',
        rating: 4.5,
        reviewCount: 389,
        tags: ['Business Intelligence', 'Data Visualization', 'Dashboards'],
        pricing: { type: 'paid', value: 9.99, period: 'month' },
        category: 'analytics',
        addedDate: '2025-03-20',
        sponsored: true
      },
      {
        id: 'analytics-008',
        name: 'Pendo',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Pendo.io, Inc.',
        description: 'Product adoption and analytics platform that helps teams build better software.',
        rating: 4.3,
        reviewCount: 187,
        tags: ['Product Analytics', 'User Onboarding', 'Feature Usage'],
        pricing: { type: 'trial', value: 0, period: 'month' },
        category: 'analytics',
        addedDate: '2025-05-10'
      },
      {
        id: 'analytics-009',
        name: 'CleverTap',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'CleverTap',
        description: 'Customer lifecycle management and mobile analytics platform for user engagement.',
        rating: 4.2,
        reviewCount: 142,
        tags: ['Mobile Analytics', 'User Engagement', 'Marketing Automation'],
        pricing: { type: 'trial', value: 0, period: 'month' },
        category: 'analytics',
        addedDate: '2025-04-05'
      },
      {
        id: 'analytics-010',
        name: 'Google Data Studio',
        logo: '/assets/images/integrations/google.svg',
        provider: 'Google',
        description: 'Data visualization and reporting tool that transforms data into informative dashboards.',
        rating: 4.4,
        reviewCount: 267,
        tags: ['Data Visualization', 'Reporting', 'Dashboards'],
        pricing: { type: 'free', value: 0, period: 'month' },
        category: 'analytics',
        addedDate: '2025-02-01'
      }
    ];
  }
  
  // Integration Category
  if (props.selectedCategory === 'integration' && !allMockApps.some(app => app.category === 'integration')) {
    allMockApps = [...allMockApps, 
      {
        id: 'integration-001',
        name: 'Zapier',
        logo: '/assets/images/integrations/zapier.svg',
        provider: 'Zapier Inc.',
        description: 'Online automation tool that connects your favorite apps, enabling you to automate workflows.',
        rating: 4.7,
        reviewCount: 512,
        tags: ['Automation', 'Workflow', 'Integration'],
        pricing: { type: 'trial', value: 19.99, period: 'month' },
        category: 'integration',
        addedDate: '2025-01-10',
        sponsored: true
      },
      {
        id: 'integration-002',
        name: 'MuleSoft',
        logo: '/assets/images/integrations/salesforce.svg',
        provider: 'Salesforce',
        description: 'Integration and API platform that connects applications, data, and devices in the cloud or on-premises.',
        rating: 4.5,
        reviewCount: 287,
        tags: ['API Management', 'Enterprise Integration', 'ESB'],
        pricing: { type: 'paid', value: 0, period: 'custom' },
        category: 'integration',
        addedDate: '2025-03-15',
        trending: true
      },
      {
        id: 'integration-003',
        name: 'Workato',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Workato Inc.',
        description: 'Intelligent automation platform that helps businesses integrate their applications and automate workflows.',
        rating: 4.4,
        reviewCount: 213,
        tags: ['Workflow Automation', 'Enterprise Integration', 'RPA'],
        pricing: { type: 'paid', value: 0, period: 'custom' },
        category: 'integration',
        addedDate: '2025-02-20'
      },
      {
        id: 'integration-004',
        name: 'Tray.io',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Tray.io',
        description: 'General automation platform that enables businesses to connect tools, automate processes and streamline data flow.',
        rating: 4.3,
        reviewCount: 176,
        tags: ['Workflow Automation', 'API Integration', 'Low-Code'],
        pricing: { type: 'trial', value: 0, period: 'month' },
        category: 'integration',
        addedDate: '2025-04-05'
      },
      {
        id: 'integration-005',
        name: 'Boomi',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Dell Technologies',
        description: 'Cloud-based integration platform as a service (iPaaS) for connecting cloud and on-premises applications.',
        rating: 4.5,
        reviewCount: 245,
        tags: ['iPaaS', 'API Management', 'EDI'],
        pricing: { type: 'paid', value: 0, period: 'custom' },
        category: 'integration',
        addedDate: '2025-01-25',
        trending: true
      },
      {
        id: 'integration-006',
        name: 'Integromat',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Celonis',
        description: 'Online automation platform that connects apps and services to automate repetitive tasks.',
        rating: 4.6,
        reviewCount: 312,
        tags: ['Automation', 'Workflow', 'Integration'],
        pricing: { type: 'free', value: 0, period: 'month' },
        category: 'integration',
        addedDate: '2025-03-10'
      },
      {
        id: 'integration-007',
        name: 'IFTTT',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'IFTTT Inc.',
        description: 'Platform that connects apps, devices, and services to trigger one or more automations.',
        rating: 4.2,
        reviewCount: 189,
        tags: ['Automation', 'IoT', 'Smart Home'],
        pricing: { type: 'free', value: 0, period: 'month' },
        category: 'integration',
        addedDate: '2025-01-15'
      },
      {
        id: 'integration-008',
        name: 'Jitterbit',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Jitterbit Inc.',
        description: 'API integration platform that enables companies to quickly connect SaaS, on-premises, and cloud applications.',
        rating: 4.3,
        reviewCount: 157,
        tags: ['API Integration', 'iPaaS', 'Data Integration'],
        pricing: { type: 'paid', value: 0, period: 'custom' },
        category: 'integration',
        addedDate: '2025-02-10'
      },
      {
        id: 'integration-009',
        name: 'Anypoint Platform',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'MuleSoft',
        description: 'Complete solution for API-led connectivity that creates a seamless application network.',
        rating: 4.4,
        reviewCount: 201,
        tags: ['API Management', 'Integration', 'Microservices'],
        pricing: { type: 'paid', value: 0, period: 'custom' },
        category: 'integration',
        addedDate: '2025-04-15',
        sponsored: true
      },
      {
        id: 'integration-010',
        name: 'Automate.io',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Automate.io',
        description: 'Cloud-based integration platform that connects cloud applications and automates marketing, sales, and business processes.',
        rating: 4.1,
        reviewCount: 132,
        tags: ['Automation', 'Workflow', 'Business Process'],
        pricing: { type: 'trial', value: 49, period: 'month' },
        category: 'integration',
        addedDate: '2025-03-25'
      }
    ];
  }
  
  // Cloud Services Category
  if (props.selectedCategory === 'cloud' && !allMockApps.some(app => app.category === 'cloud')) {
    allMockApps = [...allMockApps, 
      {
        id: 'cloud-001',
        name: 'AWS EC2',
        logo: '/assets/images/integrations/aws.svg',
        provider: 'Amazon Web Services',
        description: 'Secure and resizable compute capacity in the cloud with complete control of your computing resources.',
        rating: 4.7,
        reviewCount: 578,
        tags: ['Cloud Computing', 'Virtual Machines', 'IaaS'],
        pricing: { type: 'paid', value: 0, period: 'usage' },
        category: 'cloud',
        addedDate: '2025-01-15',
        sponsored: true
      },
      {
        id: 'cloud-002',
        name: 'Microsoft Azure',
        logo: '/assets/images/integrations/microsoft.svg',
        provider: 'Microsoft',
        description: 'Cloud computing platform and infrastructure for building, deploying, and managing applications and services.',
        rating: 4.5,
        reviewCount: 423,
        tags: ['Cloud Platform', 'IaaS', 'PaaS'],
        pricing: { type: 'paid', value: 0, period: 'usage' },
        category: 'cloud',
        addedDate: '2025-02-10',
        trending: true
      },
      {
        id: 'cloud-003',
        name: 'Google Cloud Platform',
        logo: '/assets/images/integrations/google.svg',
        provider: 'Google',
        description: 'Suite of cloud computing services that runs on the same infrastructure that Google uses internally.',
        rating: 4.6,
        reviewCount: 398,
        tags: ['Cloud Platform', 'Big Data', 'Machine Learning'],
        pricing: { type: 'paid', value: 0, period: 'usage' },
        category: 'cloud',
        addedDate: '2025-03-05'
      },
      {
        id: 'cloud-004',
        name: 'Digital Ocean',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'DigitalOcean Inc.',
        description: 'Cloud infrastructure provider focused on simplifying web infrastructure for software developers.',
        rating: 4.4,
        reviewCount: 312,
        tags: ['Cloud Computing', 'VPS', 'Developer Tools'],
        pricing: { type: 'paid', value: 5, period: 'month' },
        category: 'cloud',
        addedDate: '2025-01-25'
      },
      {
        id: 'cloud-005',
        name: 'IBM Cloud',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'IBM',
        description: 'Cloud computing services for building and scaling applications and services globally.',
        rating: 4.2,
        reviewCount: 231,
        tags: ['Cloud Platform', 'AI', 'Blockchain'],
        pricing: { type: 'paid', value: 0, period: 'usage' },
        category: 'cloud',
        addedDate: '2025-03-20'
      },
      {
        id: 'cloud-006',
        name: 'Heroku',
        logo: '/assets/images/integrations/salesforce.svg',
        provider: 'Salesforce',
        description: 'Cloud platform as a service supporting several programming languages for building, running, and operating applications.',
        rating: 4.3,
        reviewCount: 289,
        tags: ['PaaS', 'Application Deployment', 'Developer Tools'],
        pricing: { type: 'free', value: 0, period: 'month' },
        category: 'cloud',
        addedDate: '2025-02-15',
        trending: true
      },
      {
        id: 'cloud-007',
        name: 'Oracle Cloud',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Oracle Corporation',
        description: 'Enterprise-grade cloud solutions for running any workload in an enterprise-grade cloud environment.',
        rating: 4.1,
        reviewCount: 176,
        tags: ['Enterprise Cloud', 'Database', 'IaaS'],
        pricing: { type: 'paid', value: 0, period: 'usage' },
        category: 'cloud',
        addedDate: '2025-04-10'
      },
      {
        id: 'cloud-008',
        name: 'Linode',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Akamai Technologies',
        description: 'Cloud hosting provider offering high-performance SSD Linux servers for all of your infrastructure needs.',
        rating: 4.5,
        reviewCount: 213,
        tags: ['Cloud Hosting', 'VPS', 'Linux'],
        pricing: { type: 'paid', value: 5, period: 'month' },
        category: 'cloud',
        addedDate: '2025-01-05'
      },
      {
        id: 'cloud-009',
        name: 'Alibaba Cloud',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Alibaba Group',
        description: 'Suite of cloud computing services that includes elastic computing, database services, and storage.',
        rating: 4.3,
        reviewCount: 187,
        tags: ['Cloud Platform', 'Global Infrastructure', 'IaaS'],
        pricing: { type: 'paid', value: 0, period: 'usage' },
        category: 'cloud',
        addedDate: '2025-03-15',
        sponsored: true
      },
      {
        id: 'cloud-010',
        name: 'Cloudflare',
        logo: '/assets/images/integrations/integration-support.svg',
        provider: 'Cloudflare Inc.',
        description: 'Global network designed to make everything you connect to the Internet secure, private, fast, and reliable.',
        rating: 4.7,
        reviewCount: 345,
        tags: ['CDN', 'Security', 'Edge Computing'],
        pricing: { type: 'free', value: 0, period: 'month' },
        category: 'cloud',
        addedDate: '2025-02-25'
      }
    ];
  }

  console.log("Loading applications for category:", props.selectedCategory);
  
  // Filter by the selected category
  const filteredApps = allMockApps.filter(app => app.category === props.selectedCategory);
  console.log("Found matching apps:", filteredApps.length);
  
  // If no apps found for the category, generate placeholder apps
  if (filteredApps.length === 0) {
    console.log("No apps found for category, generating placeholders");
    
    // Create 10 placeholder apps for the category
    const placeholderApps = Array(10).fill(0).map((_, index) => {
      const id = `${props.selectedCategory}-${(index + 1).toString().padStart(3, '0')}`;
      const categoryName = getCategoryName(props.selectedCategory);
      
      // Create more meaningful names based on the category
      let appName = `${categoryName} App ${index + 1}`;
      let appDesc = `A powerful ${categoryName} application designed to help businesses streamline operations and increase productivity.`;
      
      // Create category-specific app names
      if (props.selectedCategory === 'crm') {
        const crmNames = ['Customer Connect', 'LeadMaster', 'SalesTrack', 'ClientView', 'RelationManager'];
        appName = index < crmNames.length ? crmNames[index] : `${crmNames[index % crmNames.length]} Pro ${Math.floor(index/5) + 1}`;
        appDesc = 'Comprehensive CRM solution for managing customer relationships, tracking leads, and streamlining sales workflows.';
      } else if (props.selectedCategory === 'marketing') {
        const marketingNames = ['CampaignPro', 'LeadGen Plus', 'MarketInsight', 'AudienceTrack', 'ConversionBoost'];
        appName = index < marketingNames.length ? marketingNames[index] : `${marketingNames[index % marketingNames.length]} Pro ${Math.floor(index/5) + 1}`;
        appDesc = 'Marketing automation platform to create, manage, and analyze campaigns across multiple channels.';
      } else if (props.selectedCategory === 'productivity') {
        const prodNames = ['TaskMaster', 'WorkFlow', 'TimeTracker', 'ProjectHub', 'TeamSync'];
        appName = index < prodNames.length ? prodNames[index] : `${prodNames[index % prodNames.length]} Pro ${Math.floor(index/5) + 1}`;
        appDesc = 'Productivity suite for organizing tasks, managing workloads, and boosting team efficiency.';
      }
      
      return {
        id: id,
        name: appName,
        logo: '/assets/images/integrations/integration-support.svg',
        provider: `${categoryName} Solutions Inc.`,
        description: appDesc,
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: 50 + Math.floor(Math.random() * 250),
        tags: [categoryName, 'SaaS', index % 2 === 0 ? 'Enterprise' : 'Small Business'],
        pricing: index % 3 === 0 ? { type: 'free' as const, value: 0, period: 'month' } : (index % 3 === 1 ? { type: 'trial' as const, value: 19.99, period: 'month' } : { type: 'paid' as const, value: 9.99 + (index * 5), period: 'month' }),
        category: props.selectedCategory,
        addedDate: `2025-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
        sponsored: index === 0 || index === 9,
        trending: index === 1 || index === 2,
      };
    });
    
    applications.value = placeholderApps;
  } else {
    applications.value = filteredApps;
  }
  
  loading.value = false;
};

// Watch for changes in the selected category
watch(() => props.selectedCategory, (newCategory) => {
  if (newCategory) {
    console.log("Selected category changed to:", newCategory);
    loadApplications();
  }
}, { immediate: true });

// Load applications on component mount
onMounted(() => {
  console.log("CategoryApplications mounted with category:", props.selectedCategory);
  if (props.selectedCategory) {
    loadApplications();
  }
});
</script>

<style scoped>
.category-applications {
  width: 100%;
}

.section-container {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-dark, #111827);
  gap: 0.5rem;
}

.section-icon {
  color: var(--color-primary, #4338ca);
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* App Card Styles */
.grid-item {
  border-radius: 0;
  overflow: hidden;
}

.app-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.app-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #2563eb;
}

/* Status Badge Styles */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.sponsored {
  background-color: #0f766e;
  color: #ffffff;
}

.status-badge.trending {
  background-color: #dc2626;
  color: #ffffff;
}

.status-badge.recent {
  background-color: #FFE66D;
  color: #2C3E50;
}

/* App Header Styles */
.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-logo {
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f9fafb;
  padding: 8px;
  border: 1px solid #e5e7eb;
}

.app-logo img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.app-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* App Categories Styles */
.app-categories {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.app-provider {
  font-size: 0.85rem;
  color: #6b7280;
}

.app-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.app-tag {
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0;
  white-space: nowrap;
}

.app-tag-more {
  background: #e5e7eb;
  color: #374151;
}

/* App Description */
.app-description {
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  color: #4b5563;
  flex-grow: 1;
}

/* App Meta Styles */
.app-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-pricing {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.price-label {
  font-size: 0.8rem;
  color: #6b7280;
}

.free-tag {
  background-color: #ecfdf5;
  color: #047857;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 0;
}

.trial-tag {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 0;
}

.price-tag {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.stars {
  display: flex;
  align-items: center;
}

.star {
  color: #d1d5db;
}

.star.filled {
  color: #f59e0b;
}

.rating-value {
  font-weight: 600;
  font-size: 0.85rem;
  color: #111827;
}

.rating-count {
  font-size: 0.75rem;
  color: #6b7280;
}

/* App Footer */
.app-footer {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.app-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #4338ca, #3730a3);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
}

.btn.full-width {
  width: 100%;
}

/* Loading and No Results */
.loading-container, .no-results {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.no-results-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .apps-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .app-card {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .apps-grid {
    grid-template-columns: 1fr;
  }
  
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .app-logo {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
}
</style>
