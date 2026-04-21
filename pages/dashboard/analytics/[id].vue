<template>
  <div class="analytics-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-navigation">
          <button class="back-btn" @click="$router.back()">
            <UIcon dynamic name="i-heroicons-arrow-left" />
            Back to Products
          </button>
        </div>
        
        <div class="title-section">
          <div class="product-info">
            <div class="product-image">
              <img 
                :src="product?.image" 
                :alt="product?.name"
                @error="handleImageError"
              />
            </div>
            <div class="product-details">
              <h1>{{ product?.name }} Analytics</h1>
              <p>Comprehensive analytics and performance insights for your product</p>
              <div class="product-meta">
                <span class="product-status" :class="product?.status">
                  <UIcon dynamic :name="getStatusIcon(product?.status || '')" />
                  {{ capitalizeStatus(product?.status || '') }}
                </span>
                <span class="product-category">{{ product?.category }}</span>
                <div class="product-rating">
                  <UIcon dynamic name="i-heroicons-star-solid" />
                  <span>{{ product?.rating }}</span>
                  <span class="review-count">({{ product?.reviewCount }} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-secondary" @click="exportAnalytics('pdf')">
            <UIcon dynamic name="i-heroicons-arrow-down-tray" />
            Export PDF
          </button>
          <button class="btn btn-secondary" @click="exportAnalytics('csv')">
            <UIcon dynamic name="i-heroicons-table-cells" />
            Export CSV
          </button>
          <button class="btn btn-primary" @click="shareAnalytics">
            <UIcon dynamic name="i-heroicons-share" />
            Share Report
          </button>
        </div>
      </div>
    </div>

    <!-- Analytics Overview Cards -->
    <div class="analytics-overview">
      <div class="overview-cards">
        <div class="metric-card">
          <div class="metric-icon">
            <UIcon dynamic name="i-heroicons-eye" />
          </div>
          <div class="metric-content">
            <h4>{{ formatNumber(product?.views || 0) }}</h4>
            <p>Total Views</p>
            <span class="metric-trend" :class="(product?.viewsTrend || 0) >= 0 ? 'positive' : 'negative'">
              {{ (product?.viewsTrend || 0) >= 0 ? '+' : '' }}{{ product?.viewsTrend || 0 }}% vs last month
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
          </div>
          <div class="metric-content">
            <h4>{{ formatNumber(product?.clicks || 0) }}</h4>
            <p>Total Clicks</p>
            <span class="metric-trend positive">
              CTR: {{ product?.ctr || 0 }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <UIcon dynamic name="i-heroicons-currency-dollar" />
          </div>
          <div class="metric-content">
            <h4>${{ formatNumber(product?.revenue || 0) }}</h4>
            <p>Revenue</p>
            <span class="metric-trend" :class="(product?.revenueTrend || 0) >= 0 ? 'positive' : 'negative'">
              {{ (product?.revenueTrend || 0) >= 0 ? '+' : '' }}{{ product?.revenueTrend || 0 }}% vs last month
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <UIcon dynamic name="i-heroicons-users" />
          </div>
          <div class="metric-content">
            <h4>{{ formatNumber(product?.activeUsers || 0) }}</h4>
            <p>Active Users</p>
            <span class="metric-trend positive">
              {{ product?.retention || 0 }}% retention rate
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Time Range Controls -->
      <div class="time-range-selector">
        <div class="time-buttons">
          <button 
            v-for="range in timeRanges" 
            :key="range.value"
            class="time-btn"
            :class="{ active: selectedTimeRange === range.value }"
            @click="selectedTimeRange = range.value"
          >
            {{ range.label }}
          </button>
        </div>
        <div class="date-picker">
          <button class="date-btn">
            <UIcon dynamic name="i-heroicons-calendar-days" />
            Custom Range
          </button>
        </div>
      </div>

      <!-- Charts and Analytics Grid -->
      <div class="analytics-grid">
        <!-- Performance Chart -->
        <div class="chart-container large">
          <div class="chart-header">
            <h3>Performance Overview</h3>
            <div class="chart-controls">
              <select v-model="chartMetric" class="metric-selector">
                <option value="views">Views</option>
                <option value="clicks">Clicks</option>
                <option value="revenue">Revenue</option>
                <option value="users">Active Users</option>
              </select>
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-data">
              <div 
                class="data-point" 
                v-for="i in 30" 
                :key="i" 
                :style="{ height: Math.random() * 100 + 20 + 'px' }"
              ></div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color primary"></span>
                <span>{{ chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Breakdown -->
        <div class="chart-container">
          <h3>Revenue Breakdown</h3>
          <div class="revenue-breakdown">
            <div class="revenue-item">
              <div class="revenue-label">
                <span class="revenue-dot subscription"></span>
                <span>Subscription Revenue</span>
              </div>
              <span class="revenue-amount">${{ formatNumber((product?.revenue || 0) * 0.7) }}</span>
              <span class="revenue-percent">70%</span>
            </div>
            <div class="revenue-item">
              <div class="revenue-label">
                <span class="revenue-dot addon"></span>
                <span>Add-on Revenue</span>
              </div>
              <span class="revenue-amount">${{ formatNumber((product?.revenue || 0) * 0.2) }}</span>
              <span class="revenue-percent">20%</span>
            </div>
            <div class="revenue-item">
              <div class="revenue-label">
                <span class="revenue-dot commission"></span>
                <span>Commission</span>
              </div>
              <span class="revenue-amount">${{ formatNumber((product?.revenue || 0) * 0.1) }}</span>
              <span class="revenue-percent">10%</span>
            </div>
          </div>
        </div>

        <!-- Geographic Performance -->
        <div class="chart-container">
          <h3>Geographic Performance</h3>
          <div class="geo-data">
            <div class="geo-item">
              <div class="geo-flag">🇺🇸</div>
              <div class="geo-info">
                <span class="geo-country">United States</span>
                <div class="geo-metrics">
                  <span>{{ formatNumber(Math.floor((product?.views || 0) * 0.4)) }} views</span>
                  <span>${{ formatNumber(Math.floor((product?.revenue || 0) * 0.45)) }} revenue</span>
                </div>
              </div>
              <div class="geo-percentage">45%</div>
            </div>

            <div class="geo-item">
              <div class="geo-flag">🇬🇧</div>
              <div class="geo-info">
                <span class="geo-country">United Kingdom</span>
                <div class="geo-metrics">
                  <span>{{ formatNumber(Math.floor((product?.views || 0) * 0.25)) }} views</span>
                  <span>${{ formatNumber(Math.floor((product?.revenue || 0) * 0.28)) }} revenue</span>
                </div>
              </div>
              <div class="geo-percentage">28%</div>
            </div>

            <div class="geo-item">
              <div class="geo-flag">🇩🇪</div>
              <div class="geo-info">
                <span class="geo-country">Germany</span>
                <div class="geo-metrics">
                  <span>{{ formatNumber(Math.floor((product?.views || 0) * 0.15)) }} views</span>
                  <span>${{ formatNumber(Math.floor((product?.revenue || 0) * 0.12)) }} revenue</span>
                </div>
              </div>
              <div class="geo-percentage">12%</div>
            </div>

            <div class="geo-item">
              <div class="geo-flag">🇫🇷</div>
              <div class="geo-info">
                <span class="geo-country">France</span>
                <div class="geo-metrics">
                  <span>{{ formatNumber(Math.floor((product?.views || 0) * 0.12)) }} views</span>
                  <span>${{ formatNumber(Math.floor((product?.revenue || 0) * 0.10)) }} revenue</span>
                </div>
              </div>
              <div class="geo-percentage">10%</div>
            </div>

            <div class="geo-item">
              <div class="geo-flag">🌍</div>
              <div class="geo-info">
                <span class="geo-country">Others</span>
                <div class="geo-metrics">
                  <span>{{ formatNumber(Math.floor((product?.views || 0) * 0.08)) }} views</span>
                  <span>${{ formatNumber(Math.floor((product?.revenue || 0) * 0.05)) }} revenue</span>
                </div>
              </div>
              <div class="geo-percentage">5%</div>
            </div>
          </div>
        </div>

        <!-- User Engagement -->
        <div class="chart-container">
          <h3>User Engagement Insights</h3>
          <div class="engagement-grid">
            <div class="engagement-card">
              <div class="engagement-metric">
                <UIcon dynamic name="i-heroicons-clock" />
                <div class="metric-data">
                  <span class="metric-value">3.4 min</span>
                  <span class="metric-label">Avg Session Time</span>
                </div>
              </div>
            </div>

            <div class="engagement-card">
              <div class="engagement-metric">
                <UIcon dynamic name="i-heroicons-arrow-path" />
                <div class="metric-data">
                  <span class="metric-value">2.8</span>
                  <span class="metric-label">Pages per Session</span>
                </div>
              </div>
            </div>

            <div class="engagement-card">
              <div class="engagement-metric">
                <UIcon dynamic name="i-heroicons-arrow-left-on-rectangle" />
                <div class="metric-data">
                  <span class="metric-value">32%</span>
                  <span class="metric-label">Bounce Rate</span>
                </div>
              </div>
            </div>

            <div class="engagement-card">
              <div class="engagement-metric">
                <UIcon dynamic name="i-heroicons-heart" />
                <div class="metric-data">
                  <span class="metric-value">{{ product?.rating || 0 }}</span>
                  <span class="metric-label">User Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Traffic Sources -->
        <div class="chart-container">
          <h3>Traffic Sources</h3>
          <div class="traffic-sources">
            <div class="traffic-item">
              <div class="traffic-info">
                <UIcon dynamic name="i-heroicons-magnifying-glass" />
                <span>Organic Search</span>
              </div>
              <div class="traffic-stats">
                <span class="traffic-percent">42%</span>
                <div class="traffic-bar">
                  <div class="traffic-fill" style="width: 42%"></div>
                </div>
              </div>
            </div>

            <div class="traffic-item">
              <div class="traffic-info">
                <UIcon dynamic name="i-heroicons-link" />
                <span>Direct</span>
              </div>
              <div class="traffic-stats">
                <span class="traffic-percent">28%</span>
                <div class="traffic-bar">
                  <div class="traffic-fill" style="width: 28%"></div>
                </div>
              </div>
            </div>

            <div class="traffic-item">
              <div class="traffic-info">
                <UIcon dynamic name="i-heroicons-share" />
                <span>Social Media</span>
              </div>
              <div class="traffic-stats">
                <span class="traffic-percent">18%</span>
                <div class="traffic-bar">
                  <div class="traffic-fill" style="width: 18%"></div>
                </div>
              </div>
            </div>

            <div class="traffic-item">
              <div class="traffic-info">
                <UIcon dynamic name="i-heroicons-envelope" />
                <span>Email Marketing</span>
              </div>
              <div class="traffic-stats">
                <span class="traffic-percent">12%</span>
                <div class="traffic-bar">
                  <div class="traffic-fill" style="width: 12%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="chart-container large">
          <h3>Recent Activity</h3>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">
                <UIcon dynamic name="i-heroicons-eye" />
              </div>
              <div class="activity-content">
                <span class="activity-text">New user viewed your product from United States</span>
                <span class="activity-time">2 minutes ago</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon">
                <UIcon dynamic name="i-heroicons-star" />
              </div>
              <div class="activity-content">
                <span class="activity-text">Received a 5-star review from john.doe@email.com</span>
                <span class="activity-time">1 hour ago</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon">
                <UIcon dynamic name="i-heroicons-currency-dollar" />
              </div>
              <div class="activity-content">
                <span class="activity-text">New subscription purchase: $49/month plan</span>
                <span class="activity-time">3 hours ago</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon">
                <UIcon dynamic name="i-heroicons-share" />
              </div>
              <div class="activity-content">
                <span class="activity-text">Product shared on social media 12 times</span>
                <span class="activity-time">6 hours ago</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon">
                <UIcon dynamic name="i-heroicons-puzzle-piece" />
              </div>
              <div class="activity-content">
                <span class="activity-text">New integration connected: Slack</span>
                <span class="activity-time">1 day ago</span>
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

// Get route parameters
const route = useRoute();
const productId = parseInt(route.params.id as string);

// Meta tags
useHead({
  title: 'Product Analytics - SaaSWorld Dashboard',
  meta: [
    { name: 'description', content: 'Detailed analytics and performance insights for your product' }
  ]
});

// State
const selectedTimeRange = ref('30d');
const chartMetric = ref('views');

const timeRanges = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' }
];

// Mock products data (same as products page)
const products = [
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
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=120&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=120&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=200&h=120&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=200&h=120&fit=crop'
  }
];

// Get current product
const product = computed(() => products.find(p => p.id === productId));

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const capitalizeStatus = (status: string) => {
  return status?.charAt(0).toUpperCase() + status?.slice(1) || '';
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

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=120&fit=crop';
};

const exportAnalytics = (format: string) => {
  console.log(`Exporting analytics data as ${format} for product:`, product.value?.name);
  // Implement export functionality
};

const shareAnalytics = () => {
  if (navigator.share) {
    navigator.share({
      title: `${product.value?.name} Analytics Report`,
      text: `Check out the analytics report for ${product.value?.name}`,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    console.log('Analytics URL copied to clipboard');
  }
};

// Redirect if product not found
if (process.client && !product.value) {
  navigateTo('/dashboard/products');
}
</script>

<style scoped>
/* Main Analytics Page Layout */
.analytics-page {
  padding: 0;
  margin: 0;
  min-height: 100vh;
  background: #f8fafc;
}

/* Page Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header-navigation {
  margin-bottom: 1.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e2e8f0;
  color: #374151;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.product-info {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.product-image {
  width: 4rem;
  height: 4rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.product-details p {
  color: #64748b;
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.product-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.product-status.approved {
  background: #dcfce7;
  color: #166534;
}

.product-status.pending {
  background: #fef3c7;
  color: #d97706;
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

/* Analytics Overview */
.analytics-overview {
  max-width: 1400px;
  margin: 0 auto 2rem auto;
  padding: 0 2rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.metric-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.metric-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.metric-content h4 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.metric-content p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.metric-trend {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.metric-trend.positive {
  background: #dcfce7;
  color: #166534;
}

.metric-trend.negative {
  background: #fef2f2;
  color: #dc2626;
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
}

/* Time Range Selector */
.time-range-selector {
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

.time-buttons {
  display: flex;
  gap: 0.5rem;
}

.time-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  background: #f3f4f6;
}

.time-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.date-picker {
  display: flex;
  gap: 0.5rem;
}

.date-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.date-btn:hover {
  background: #f3f4f6;
}

.metric-selector {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.chart-container {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  grid-column: span 6;
}

.chart-container.large {
  grid-column: span 12;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-container h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
}

/* Chart Placeholder */
.chart-placeholder {
  position: relative;
}

.chart-data {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 200px;
  margin-bottom: 1rem;
}

.data-point {
  flex: 1;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 2px 2px 0 0;
  opacity: 0.8;
  transition: all 0.2s;
}

.data-point:hover {
  opacity: 1;
}

.chart-legend {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.legend-color {
  width: 1rem;
  height: 0.75rem;
  border-radius: 0.25rem;
}

.legend-color.primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

/* Revenue Breakdown */
.revenue-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.revenue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.revenue-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.revenue-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.revenue-dot.subscription {
  background: #3b82f6;
}

.revenue-dot.addon {
  background: #10b981;
}

.revenue-dot.commission {
  background: #f59e0b;
}

.revenue-amount {
  font-weight: 600;
  color: #1e293b;
}

.revenue-percent {
  font-size: 0.875rem;
  color: #64748b;
  margin-left: 0.5rem;
}

/* Geographic Performance */
.geo-data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.geo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.geo-flag {
  font-size: 1.5rem;
}

.geo-info {
  flex: 1;
}

.geo-country {
  font-weight: 500;
  color: #1e293b;
  display: block;
  margin-bottom: 0.25rem;
}

.geo-metrics {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
}

.geo-percentage {
  font-weight: 600;
  color: #3b82f6;
}

/* User Engagement */
.engagement-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.engagement-card {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.engagement-metric {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.engagement-metric svg {
  color: #3b82f6;
  width: 1.25rem;
  height: 1.25rem;
}

.metric-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: #64748b;
}

/* Traffic Sources */
.traffic-sources {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.traffic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.traffic-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
}

.traffic-info svg {
  color: #3b82f6;
  width: 1rem;
  height: 1rem;
}

.traffic-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.traffic-percent {
  font-weight: 600;
  color: #1e293b;
  min-width: 3rem;
  text-align: right;
}

.traffic-bar {
  width: 100px;
  height: 0.5rem;
  background: #e2e8f0;
  border-radius: 0.25rem;
  overflow: hidden;
}

.traffic-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 0.25rem;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.activity-content {
  flex: 1;
}

.activity-text {
  display: block;
  color: #374151;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.875rem;
  color: #64748b;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .title-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    grid-column: span 1;
  }

  .chart-container.large {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .page-header,
  .main-content {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .analytics-overview {
    padding: 0 1rem;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .product-info {
    flex-direction: column;
    align-items: stretch;
  }

  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .time-range-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .engagement-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .time-buttons {
    flex-wrap: wrap;
  }
}
</style>
