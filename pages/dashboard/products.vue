<template>
  <div class="products-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Your Products</h1>
          <p>Manage and monitor your applications with comprehensive analytics</p>
        </div>
        
        <div class="header-actions">
          <NuxtLink to="/list-product" class="btn btn-primary">
            <UIcon dynamic name="i-heroicons-plus" />
            Add Product
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- KPI Overview Cards -->
    <div class="kpi-overview">
      <div class="kpi-card">
        <div class="kpi-icon">
          <UIcon dynamic name="i-heroicons-squares-2x2" />
        </div>
        <div class="kpi-content">
          <h3>{{ totalProducts }}</h3>
          <p>Total Products</p>
          <span class="kpi-change positive">+{{ newProductsThisMonth }} this month</span>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-icon">
          <UIcon dynamic name="i-heroicons-eye" />
        </div>
        <div class="kpi-content">
          <h3>{{ formatNumber(totalViews) }}</h3>
          <p>Total Views</p>
          <span class="kpi-change" :class="viewsChange >= 0 ? 'positive' : 'negative'">
            {{ viewsChange >= 0 ? '+' : '' }}{{ viewsChange }}% this week
          </span>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-icon">
          <UIcon dynamic name="i-heroicons-currency-dollar" />
        </div>
        <div class="kpi-content">
          <h3>${{ formatNumber(totalRevenue) }}</h3>
          <p>Total Revenue</p>
          <span class="kpi-change" :class="revenueChange >= 0 ? 'positive' : 'negative'">
            {{ revenueChange >= 0 ? '+' : '' }}{{ revenueChange }}% this month
          </span>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-icon">
          <UIcon dynamic name="i-heroicons-puzzle-piece" />
        </div>
        <div class="kpi-content">
          <h3>{{ totalIntegrations }}</h3>
          <p>Active Integrations</p>
          <span class="kpi-change positive">{{ activeIntegrationsCount }} services</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div v-if="filteredProducts.length === 0" class="empty-state">
        <div class="empty-icon">
          <UIcon dynamic name="i-heroicons-squares-plus" />
        </div>
        <h4>No products found</h4>
        <p>Try adjusting your filters or add your first product</p>
        <NuxtLink to="/list-product" class="btn btn-primary">
          <UIcon dynamic name="i-heroicons-plus" />
          Add Your First Product
        </NuxtLink>
      </div>

      <div v-else class="products-grid" :class="viewMode">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="product-card"
          @click="handleViewProduct(product)"
        >
          <!-- Product Header -->
          <div class="product-header">
            <div class="product-image">
              <img 
                :src="product.image" 
                :alt="product.name"
                @error="handleImageError"
              />
            </div>
            
            <div class="product-basic-info">
              <div class="product-title-row">
                <h4 class="product-name">{{ product.name }}</h4>
                <div class="product-status" :class="product.status">
                  <UIcon dynamic :name="getStatusIcon(product.status)" />
                  <span>{{ capitalizeStatus(product.status) }}</span>
                </div>
              </div>
              
              <div class="product-meta">
                <span class="product-category">{{ product.category }}</span>
                <div class="product-rating">
                  <UIcon dynamic name="i-heroicons-star-solid" />
                  <span>{{ product.rating }}</span>
                  <span class="review-count">({{ product.reviewCount }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Compact Performance Metrics -->
          <div class="product-metrics">
            <div class="metrics-row">
              <div class="metric-item">
                <UIcon dynamic name="i-heroicons-eye" />
                <div class="metric-content">
                  <span class="metric-value">{{ formatNumber(product.views) }}</span>
                  <span class="metric-label">Views</span>
                </div>
                <span class="metric-trend" :class="product.viewsTrend >= 0 ? 'positive' : 'negative'">
                  {{ product.viewsTrend >= 0 ? '+' : '' }}{{ product.viewsTrend }}%
                </span>
              </div>
              
              <div class="metric-item">
                <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
                <div class="metric-content">
                  <span class="metric-value">{{ formatNumber(product.clicks) }}</span>
                  <span class="metric-label">Clicks</span>
                </div>
                <span class="metric-ctr">{{ product.ctr }}% CTR</span>
              </div>
            </div>
            
            <div class="metrics-row">
              <div class="metric-item">
                <UIcon dynamic name="i-heroicons-currency-dollar" />
                <div class="metric-content">
                  <span class="metric-value">${{ formatNumber(product.revenue) }}</span>
                  <span class="metric-label">Revenue</span>
                </div>
                <span class="metric-trend" :class="product.revenueTrend >= 0 ? 'positive' : 'negative'">
                  {{ product.revenueTrend >= 0 ? '+' : '' }}{{ product.revenueTrend }}%
                </span>
              </div>
              
              <div class="metric-item">
                <UIcon dynamic name="i-heroicons-users" />
                <div class="metric-content">
                  <span class="metric-value">{{ formatNumber(product.activeUsers) }}</span>
                  <span class="metric-label">Users</span>
                </div>
                <span class="metric-retention">{{ product.retention }}% retention</span>
              </div>
            </div>
          </div>

          <!-- Compact Integrations & Actions -->
          <div class="product-footer">
            <div class="integrations-summary">
              <div class="integration-preview">
                <div 
                  v-for="integration in product.integrations.services.slice(0, 3)" 
                  :key="integration.name"
                  class="integration-icon"
                  :class="integration.status"
                  :title="integration.name"
                >
                  <img :src="integration.icon" :alt="integration.name" />
                </div>
                <span class="integration-count" v-if="product.integrations.services.length > 3">
                  +{{ product.integrations.services.length - 3 }}
                </span>
              </div>
              <div class="integration-status-text">
                <span>{{ product.integrations.active }} active</span>
                <span v-if="product.integrations.pending > 0" class="pending-text">
                  {{ product.integrations.pending }} pending
                </span>
              </div>
            </div>

            <div class="card-actions">
              <button 
                class="action-btn promote"
                @click.stop="navigateToPromote(product)"
                title="Promote Product"
              >
                <UIcon dynamic name="i-heroicons-megaphone" />
              </button>
              
              <button 
                class="action-btn primary"
                @click.stop="navigateToAnalytics(product)"
                title="View Analytics"
              >
                <UIcon dynamic name="i-heroicons-chart-bar" />
              </button>
              
              <button 
                class="action-btn secondary"
                @click.stop="navigateToIntegrations(product)"
                title="Manage Integrations"
              >
                <UIcon dynamic name="i-heroicons-puzzle-piece" />
              </button>
              
              <div class="action-menu" @click.stop>
                <button 
                  class="action-btn menu-btn"
                  @click="toggleProductMenu(product.id)"
                  title="More Options"
                >
                  <UIcon dynamic name="i-heroicons-ellipsis-horizontal" />
                </button>
                
                <div 
                  v-if="activeProductMenu === product.id" 
                  class="menu-dropdown"
                  @click.stop
                >
                  <button class="menu-item" @click="editProduct(product)">
                    <UIcon dynamic name="i-heroicons-pencil" />
                    Edit
                  </button>
                  <button class="menu-item" @click="duplicateProduct(product)">
                    <UIcon dynamic name="i-heroicons-document-duplicate" />
                    Duplicate
                  </button>
                  <button class="menu-item" @click="shareProduct(product)">
                    <UIcon dynamic name="i-heroicons-share" />
                    Share
                  </button>
                  <div class="menu-divider"></div>
                  <button class="menu-item danger" @click="deleteProduct(product)">
                    <UIcon dynamic name="i-heroicons-trash" />
                    Delete
                  </button>
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
import { ref, computed } from 'vue';

// Use auth composable
const { isAuthenticated, currentUser, handleLogin, handleLogout } = useAuth();

// Meta tags
useHead({
  title: 'Products - SaaSWorld Dashboard',
  meta: [
    { name: 'description', content: 'Manage your products and track their performance with comprehensive analytics' }
  ]
});

// State
const viewMode = ref('grid');
const searchQuery = ref('');
const statusFilter = ref('');
const categoryFilter = ref('');
const sortBy = ref('name');
const activeProductMenu = ref<number | null>(null);

// Enhanced mock products data with comprehensive KPIs and integrations
const products = ref([
  {
    id: 1,
    name: 'TaskFlow Pro',
    status: 'approved',
    views: 25400,
    clicks: 1800,
    revenue: 12500,
    activeUsers: 3200,
    rating: 4.8,
    reviewCount: 142,
    ctr: 7.1,
    retention: 89,
    viewsTrend: 15.2,
    revenueTrend: 8.7,
    lastUpdate: '2024-01-20',
    category: 'Productivity',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=120&fit=crop',
    integrations: {
      active: 8,
      pending: 2,
      total: 12,
      services: [
        { name: 'Slack', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg', status: 'active' },
        { name: 'Google Drive', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg', status: 'active' },
        { name: 'Trello', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg', status: 'active' },
        { name: 'Zapier', icon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=32&h=32&fit=crop', status: 'pending' },
        { name: 'Microsoft Teams', icon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=32&h=32&fit=crop', status: 'active' },
        { name: 'Notion', icon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=32&h=32&fit=crop', status: 'active' }
      ]
    }
  },
  {
    id: 2,
    name: 'Analytics Hub',
    status: 'pending',
    views: 18900,
    clicks: 950,
    revenue: 8200,
    activeUsers: 1850,
    rating: 4.6,
    reviewCount: 89,
    ctr: 5.0,
    retention: 76,
    viewsTrend: -3.2,
    revenueTrend: 12.1,
    lastUpdate: '2024-01-18',
    category: 'Analytics',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=120&fit=crop',
    integrations: {
      active: 6,
      pending: 1,
      total: 10,
      services: [
        { name: 'Google Analytics', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg', status: 'active' },
        { name: 'Mixpanel', icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=32&h=32&fit=crop', status: 'active' },
        { name: 'Segment', icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=32&h=32&fit=crop', status: 'pending' },
        { name: 'Amplitude', icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=32&h=32&fit=crop', status: 'active' },
        { name: 'Hotjar', icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=32&h=32&fit=crop', status: 'active' }
      ]
    }
  },
  {
    id: 3,
    name: 'Design Studio',
    status: 'approved',
    views: 32000,
    clicks: 2400,
    revenue: 18000,
    activeUsers: 4100,
    rating: 4.9,
    reviewCount: 203,
    ctr: 7.5,
    retention: 92,
    viewsTrend: 22.5,
    revenueTrend: 18.9,
    lastUpdate: '2024-01-22',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=200&h=120&fit=crop',
    integrations: {
      active: 12,
      pending: 3,
      total: 18,
      services: [
        { name: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', status: 'active' },
        { name: 'Adobe Creative Cloud', icon: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=32&h=32&fit=crop', status: 'active' },
        { name: 'Sketch', icon: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=32&h=32&fit=crop', status: 'active' },
        { name: 'InVision', icon: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=32&h=32&fit=crop', status: 'pending' },
        { name: 'Canva', icon: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=32&h=32&fit=crop', status: 'active' },
        { name: 'Unsplash', icon: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=32&h=32&fit=crop', status: 'active' }
      ]
    }
  },
  {
    id: 4,
    name: 'CRM Master',
    status: 'approved',
    views: 15600,
    clicks: 1120,
    revenue: 9800,
    activeUsers: 2100,
    rating: 4.7,
    reviewCount: 156,
    ctr: 7.2,
    retention: 84,
    viewsTrend: 9.8,
    revenueTrend: 15.6,
    lastUpdate: '2024-01-19',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=200&h=120&fit=crop',
    integrations: {
      active: 9,
      pending: 2,
      total: 14,
      services: [
        { name: 'Salesforce', icon: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=32&h=32&fit=crop', status: 'active' },
        { name: 'HubSpot', icon: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=32&h=32&fit=crop', status: 'active' },
        { name: 'Mailchimp', icon: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=32&h=32&fit=crop', status: 'active' },
        { name: 'Pipedrive', icon: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=32&h=32&fit=crop', status: 'pending' },
        { name: 'Zoom', icon: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=32&h=32&fit=crop', status: 'active' }
      ]
    }
  }
]);

// Computed properties
const totalProducts = computed(() => products.value.length);
const totalViews = computed(() => products.value.reduce((sum, product) => sum + product.views, 0));
const totalRevenue = computed(() => products.value.reduce((sum, product) => sum + product.revenue, 0));
const totalIntegrations = computed(() => products.value.reduce((sum, product) => sum + product.integrations.active, 0));
const activeIntegrationsCount = computed(() => {
  const uniqueServices = new Set();
  products.value.forEach(product => {
    product.integrations.services.forEach(service => {
      if (service.status === 'active') uniqueServices.add(service.name);
    });
  });
  return uniqueServices.size;
});

// Mock data for trends
const newProductsThisMonth = ref(2);
const viewsChange = ref(12.5);
const revenueChange = ref(18.3);

// Filtered products
const filteredProducts = computed(() => {
  let filtered = [...products.value];
  
  // Search filter
  if (searchQuery.value) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(product => product.status === statusFilter.value);
  }
  
  // Category filter
  if (categoryFilter.value) {
    filtered = filtered.filter(product => 
      product.category.toLowerCase() === categoryFilter.value.toLowerCase()
    );
  }
  
  // Sort
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'views':
          return b.views - a.views;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'rating':
          return b.rating - a.rating;
        case 'lastUpdate':
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }
  
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
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusIcon = (status: string) => {
  const icons: { [key: string]: string } = {
    approved: 'i-heroicons-check-circle',
    pending: 'i-heroicons-clock',
    rejected: 'i-heroicons-x-circle',
    draft: 'i-heroicons-document'
  };
  return icons[status] || 'i-heroicons-question-mark-circle';
};

const getPerformanceLevel = (product: any) => {
  const score = (product.rating * 20) + (product.retention * 0.5) + (product.ctr * 2);
  if (score >= 120) return 'excellent';
  if (score >= 100) return 'good';
  if (score >= 80) return 'average';
  return 'needs-improvement';
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=120&fit=crop';
};

const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};

const filterProducts = () => {
  // Filtering is handled by computed property
};

const toggleProductMenu = (productId: number) => {
  activeProductMenu.value = activeProductMenu.value === productId ? null : productId;
};

// Product action handlers
const handleViewProduct = (product: any) => {
  console.log('Viewing product:', product.name);
  navigateTo(`/marketplace/app/${product.id}`);
};

const editProduct = (product: any) => {
  console.log('Editing product:', product.name);
  navigateTo(`/list-product?edit=${product.id}`);
  activeProductMenu.value = null;
};

const duplicateProduct = (product: any) => {
  console.log('Duplicating product:', product.name);
  // Add duplication logic here
  activeProductMenu.value = null;
};

const shareProduct = (product: any) => {
  if (navigator.share) {
    navigator.share({
      title: product.name,
      text: `Check out ${product.name} on SaaSWorld`,
      url: `${window.location.origin}/marketplace/app/${product.id}`
    });
  } else {
    navigator.clipboard.writeText(`${window.location.origin}/marketplace/app/${product.id}`);
    console.log('Product URL copied to clipboard');
  }
  activeProductMenu.value = null;
};

const deleteProduct = (product: any) => {
  if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
    const index = products.value.findIndex(p => p.id === product.id);
    if (index > -1) {
      products.value.splice(index, 1);
      console.log('Product deleted:', product.name);
    }
  }
  activeProductMenu.value = null;
};

// Modal handlers
const navigateToIntegrations = (product: any) => {
  // Navigate to integrations page with product data
  navigateTo(`/dashboard/integrations/${product.id}`);
};

const navigateToAnalytics = (product: any) => {
  // Navigate to analytics page with product data
  navigateTo(`/dashboard/analytics/${product.id}`);
};

const navigateToPromote = (product: any) => {
  // Calculate potential impressions based on product performance
  const potentialImpressions = Math.round(product.views * 2.5);
  const suggestedBudget = Math.round(product.revenue * 0.15);
  
  // Create promotion data
  const promotionData = {
    productId: product.id,
    productName: product.name,
    category: product.category,
    currentViews: product.views,
    currentRevenue: product.revenue,
    rating: product.rating,
    reviewCount: product.reviewCount,
    potentialImpressions: potentialImpressions,
    suggestedBudget: suggestedBudget,
    targetLocations: ['United States', 'Canada', 'United Kingdom', 'Australia'],
    keyMetrics: {
      ctr: product.ctr,
      retention: product.retention,
      activeUsers: product.activeUsers
    }
  };
  
  // Navigate to budget page with promotion data
  navigateTo({
    path: '/dashboard/budget',
    query: {
      promote: 'true',
      data: btoa(JSON.stringify(promotionData))
    }
  });
};

const exportAnalytics = (product: any) => {
  console.log('Exporting analytics for:', product.name);
  // Implement export logic
  activeProductMenu.value = null;
};

// Close menus when clicking outside
const closeMenus = () => {
  activeProductMenu.value = null;
};

if (process.client) {
  document.addEventListener('click', closeMenus);
}
</script>

<style scoped>
/* Main Products Page Layout */
.products-page {
  min-height: 100vh;
  background: #ffffff;
  /* Account for FIXED subnav positioning - prevents content overlap */
  /* Main navbar (72px) + DashboardSubnav (~72px) = ~144px total */
  margin-top: 144px;
  padding: var(--spacing-lg);
  position: relative;
}

/* Standardized thin border radius for all cards */
.products-page .card,
.products-page .analytics-card,
.products-page .product-card,
.products-page .kpi-card,
.products-page .chart-card,
.products-page .stats-card {
  border-radius: 6px !important;
}

/* Page Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem;
  margin: 0 0 2rem 0;
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
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
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

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* KPI Overview */
.kpi-overview {
  max-width: 100%;
  margin: 0 0 1.5rem 0;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 72px;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover::before {
  opacity: 1;
}

.kpi-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.kpi-content {
  flex: 1;
  min-width: 0;
}

.kpi-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 2px 0;
  line-height: 1.2;
}

.kpi-content p {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0 0 4px 0;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.kpi-change {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  display: inline-block;
  letter-spacing: 0.025em;
}

.kpi-change.positive {
  background: #dcfce7;
  color: #047857;
}

.kpi-change.negative {
  background: #fef2f2;
  color: #dc2626;
}

/* Main Content */
.main-content {
  max-width: 100%;
  margin: 0;
  padding: 0 2rem 2rem 2rem;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem auto;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1.5rem;
}

.empty-state h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 2rem 0;
}

/* Products Grid */
.products-grid {
  display: grid;
  gap: 1.5rem;
}

.products-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.products-grid.list {
  grid-template-columns: 1fr;
}

/* Product Cards */
.product-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.product-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.product-header {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.product-image {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-basic-info {
  flex: 1;
  min-width: 0;
}

.product-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;
}

.product-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.product-status.approved {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.product-status.pending {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.product-status.rejected {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.product-status.draft {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.product-status svg {
  width: 0.875rem;
  height: 0.875rem;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.product-category {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.product-rating svg {
  color: #fbbf24;
  width: 1rem;
  height: 1rem;
}

.review-count {
  color: #64748b;
  font-size: 0.75rem;
}

/* Compact Performance Metrics */
.product-metrics {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.metrics-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.metrics-row:last-child {
  margin-bottom: 0;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.metric-item svg {
  color: #3b82f6;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.metric-label {
  display: block;
  font-size: 0.625rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 1px;
}

.metric-trend,
.metric-ctr,
.metric-retention {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.metric-trend.positive,
.metric-ctr,
.metric-retention {
  background: #dcfce7;
  color: #166534;
}

.metric-trend.negative {
  background: #fef2f2;
  color: #dc2626;
}

/* Compact Footer with Integrations & Actions */
.product-footer {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: white;
}

.integrations-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.integration-preview {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.integration-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  position: relative;
}

.integration-icon.active {
  border-color: #10b981;
}

.integration-icon.pending {
  border-color: #f59e0b;
}

.integration-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.integration-count {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  margin-left: 0.25rem;
}

.integration-status-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.integration-status-text span {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.2;
}

.pending-text {
  color: #d97706 !important;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-btn.promote {
  background: #10b981;
  color: white;
}

.action-btn.promote:hover {
  background: #059669;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

.action-btn.menu-btn {
  background: #f8fafc;
  color: #6b7280;
  border: 1px solid #e2e8f0;
}

.action-btn.menu-btn:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.action-btn svg {
  width: 1rem;
  height: 1rem;
}

.action-menu {
  position: relative;
}

.menu-dropdown {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 140px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  color: #374151;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger:hover {
  background: #fef2f2;
}

.menu-item svg {
  width: 0.875rem;
  height: 0.875rem;
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.25rem 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .header-actions {
    justify-content: space-between;
  }

  .kpi-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .kpi-card {
    padding: 0.875rem 1rem;
    min-height: 68px;
  }
  
  .kpi-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .kpi-content h3 {
    font-size: 1.375rem;
  }

  .products-grid.grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .products-page {
    /* Account for mobile navbar (64px) + subnav content (~72px) = ~136px total */
    /* Fixed subnav positioning requires explicit padding */
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

  .header-actions {
    justify-content: flex-start;
  }

  .kpi-overview {
    grid-template-columns: 1fr;
    padding: 0 var(--spacing-md);
    gap: var(--spacing-md);
  }
  
  .kpi-card {
    padding: 0.75rem 1rem;
    min-height: 64px;
    gap: 0.75rem;
  }
  
  .kpi-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .kpi-content h3 {
    font-size: 1.25rem;
  }
  
  .kpi-content p {
    font-size: 0.75rem;
  }
  
  .kpi-change {
    font-size: 0.65rem;
  }

  .products-grid.grid {
    grid-template-columns: 1fr;
  }

  .product-header {
    padding: 1rem;
  }

  .product-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .metrics-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .product-metrics {
    padding: 0.75rem 1rem;
  }

  .product-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    padding: 1rem;
  }

  .integrations-summary {
    justify-content: center;
  }

  .card-actions {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .products-page {
    padding: var(--spacing-sm);
    margin-top: 130px;
  }

  .page-header,
  .main-content {
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }

  .header-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .kpi-overview {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .kpi-card {
    padding: var(--spacing-sm);
    min-height: 60px;
  }

  .kpi-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .kpi-content h3 {
    font-size: 1.25rem;
  }

  .product-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
  }

  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .metrics-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }

  .product-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }
}
</style>


