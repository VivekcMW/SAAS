<template>
  <div class="analytics-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Analytics</h1>
          <p>Detailed insights and performance metrics</p>
        </div>
        
        <div class="header-actions">
          <select v-model="selectedPeriod" class="period-select">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Analytics Grid -->
      <div class="analytics-grid">
        <!-- Main Chart -->
        <div class="analytics-card main-chart">
          <div class="card-header">
            <h3>Performance Overview</h3>
          </div>
          <div class="card-content">
            <DashboardAnalytics :data="analyticsData" :period="selectedPeriod" />
          </div>
        </div>

        <!-- Geographic Data -->
        <div class="analytics-card geo-chart">
          <div class="card-header">
            <h3>Geographic Distribution</h3>
          </div>
          <div class="card-content">
            <DashboardGeoMap :countries="geoData" />
          </div>
        </div>

        <!-- Detailed Stats -->
        <div class="analytics-card stats-card">
          <div class="card-header">
            <h3>Detailed Statistics</h3>
          </div>
          <div class="card-content">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon views">
                  <UIcon dynamic name="i-heroicons-eye" />
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ formatNumber(totalViews) }}</div>
                  <div class="stat-label">Total Views</div>
                  <div class="stat-change positive">+12.5%</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon clicks">
                  <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ formatNumber(totalClicks) }}</div>
                  <div class="stat-label">Total Clicks</div>
                  <div class="stat-change positive">+8.3%</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon conversion">
                  <UIcon dynamic name="i-heroicons-arrow-trending-up" />
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ conversionRate }}%</div>
                  <div class="stat-label">Conversion Rate</div>
                  <div class="stat-change negative">-2.1%</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon revenue">
                  <UIcon dynamic name="i-heroicons-currency-dollar" />
                </div>
                <div class="stat-details">
                  <div class="stat-value">${{ formatNumber(totalRevenue) }}</div>
                  <div class="stat-label">Total Revenue</div>
                  <div class="stat-change positive">+15.7%</div>
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
  title: 'Analytics - SaaSWorld Dashboard',
  meta: [
    { name: 'description', content: 'Detailed analytics and performance insights for your products' }
  ]
});

// State
const selectedPeriod = ref('30d');
const filtersActive = ref(false);

// Dashboard stats
const dashboardStats = ref({
  totalViews: 12540,
  revenue: 3850,
  products: 3
});

// Analytics data
const totalViews = ref(12540);
const totalClicks = ref(890);
const totalRevenue = ref(3850);

const conversionRate = computed(() => {
  return ((totalClicks.value / totalViews.value) * 100).toFixed(2);
});

// Mock analytics data
const analyticsData = computed(() => {
  const days = selectedPeriod.value === '7d' ? 7 : selectedPeriod.value === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const views = Math.floor(Math.random() * 500) + 100;
    const clicks = Math.floor(views * (Math.random() * 0.15 + 0.05));
    
    data.push({
      date: date.toISOString().split('T')[0],
      views,
      clicks,
      revenue: Math.floor(clicks * (Math.random() * 10 + 5))
    });
  }
  
  return data;
});

// Geographic data
const geoData = ref([
  { country: 'United States', visitors: 3542, percentage: 28.2 },
  { country: 'United Kingdom', visitors: 2103, percentage: 16.8 },
  { country: 'Germany', visitors: 1876, percentage: 15.0 },
  { country: 'Canada', visitors: 1254, percentage: 10.0 },
  { country: 'France', visitors: 987, percentage: 7.9 },
  { country: 'Australia', visitors: 765, percentage: 6.1 },
  { country: 'Netherlands', visitors: 543, percentage: 4.3 },
  { country: 'Others', visitors: 1470, percentage: 11.7 }
]);

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const handleToggleFilters = () => {
  filtersActive.value = !filtersActive.value;
};

const handleSearch = (query: string) => {
  console.log('Search analytics:', query);
};

const handleAddProduct = () => {
  navigateTo('/list-product');
};

const handleCreateReport = () => {
  console.log('Create analytics report');
};

const handleScheduleDemo = () => {
  console.log('Schedule analytics demo');
};

const handleExportData = () => {
  console.log('Export analytics data');
};
</script>

<style scoped>
/* Analytics Page Layout */
.analytics-page {
  min-height: 100vh;
  background: #ffffff;
  /* Account for FIXED subnav positioning - prevents content overlap */
  /* Main navbar (72px) + DashboardSubnav (~72px) = ~144px total */
  margin-top: 144px;
  padding: var(--spacing-lg);
  position: relative;
}

/* Standardized thin border radius for all cards */
.analytics-page .card,
.analytics-page .analytics-card,
.analytics-page .chart-card,
.analytics-page .stats-card {
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
  padding: 0 2rem;
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

.period-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
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

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Main Content */
.main-content {
  max-width: 100%;
  margin: 0;
  padding: 0 4rem 2rem 4rem;
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 2rem;
}

.main-chart {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
}

.geo-chart {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.stats-card {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

/* Analytics Cards */
.analytics-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;
}

.analytics-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem 2rem 1rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-content {
  padding: 0px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-icon.views {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.clicks {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.conversion {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.stat-change.positive {
  background: #dcfce7;
  color: #166534;
}

.stat-change.negative {
  background: #fef2f2;
  color: #dc2626;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    padding: 0 1rem;
  }

  .main-content {
    padding: 0 2rem 2rem 2rem;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .main-chart {
    grid-column: 1;
    grid-row: 1;
  }

  .geo-chart {
    grid-column: 1;
    grid-row: 2;
  }

  .stats-card {
    grid-column: 1;
    grid-row: 3;
  }
}

@media (max-width: 768px) {
  .analytics-page {
    /* Account for mobile navbar (64px) + subnav content (~72px) = ~136px total */
    /* Fixed subnav positioning requires explicit margin */
    margin-top: 136px;
    padding: var(--spacing-md);
  }

  .page-header {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .header-content {
    padding: 0;
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .main-content {
    padding: 0 var(--spacing-md) 2rem var(--spacing-md);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-header,
  .card-content {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: var(--spacing-md);
  }

  .header-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .main-content {
    padding: 0 var(--spacing-md) var(--spacing-lg) var(--spacing-md);
  }

  .analytics-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .analytics-page {
    padding: var(--spacing-sm);
    margin-top: 130px;
  }

  .page-header {
    padding: var(--spacing-sm);
  }

  .main-content {
    padding: 0 var(--spacing-sm) var(--spacing-md) var(--spacing-sm);
  }

  .header-content {
    gap: var(--spacing-sm);
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .analytics-grid {
    gap: var(--spacing-md);
  }

  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }

  .card-header,
  .card-content {
    padding: var(--spacing-sm);
  }
}
</style>

