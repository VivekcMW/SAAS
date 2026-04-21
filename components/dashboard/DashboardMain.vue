<template>
  <div class="dashboard-main">
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <div class="container">
        <!-- Overview Section with Analytics and Metrics -->
        <div class="overview-section">
          <div class="overview-layout">
            <!-- Analytics Chart - Left Side -->
            <div class="analytics-container">
              <div class="dashboard-card analytics-card">
                <div class="card-header">
                  <h3>Visitor Analytics</h3>
                  <div class="card-actions">
                    <select v-model="selectedPeriod" class="period-select">
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                    </select>
                  </div>
                </div>
                <div class="card-content">
                  <DashboardAnalytics :data="analyticsData" :period="selectedPeriod" />
                </div>
              </div>
            </div>

            <!-- Metrics Cards - Right Side (Vertical) -->
            <div class="metrics-container">
              <div class="overview-card compact">
                <div class="card-icon views">
                  <UIcon dynamic name="i-heroicons-eye" />
                </div>
                <div class="card-content">
                  <p class="card-title">Total Views</p>
                  <h3 class="card-number">{{ formatNumber(dashboardData.totalViews) }}</h3>
                </div>
              </div>
              
              <div class="overview-card compact">
                <div class="card-icon clicks">
                  <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
                </div>
                <div class="card-content">
                  <p class="card-title">Total Clicks</p>
                  <h3 class="card-number">{{ formatNumber(dashboardData.totalClicks) }}</h3>
                </div>
              </div>
              
              <div class="overview-card compact">
                <div class="card-icon ctr">
                  <UIcon dynamic name="i-heroicons-chart-bar-square" />
                </div>
                <div class="card-content">
                  <p class="card-title">CTR</p>
                  <h3 class="card-number">{{ dashboardData.ctr }}%</h3>
                </div>
              </div>
              
              <div class="overview-card compact">
                <div class="card-icon revenue">
                  <UIcon dynamic name="i-heroicons-currency-dollar" />
                </div>
                <div class="card-content">
                  <p class="card-title">Revenue</p>
                  <h3 class="card-number">${{ formatNumber(dashboardData.revenue) }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Geographic Distribution - Full Page Width with 70/30 Split -->
      <div class="full-width-section">
        <div class="geo-row">
          <!-- Global Views Card - 70% -->
          <div class="dashboard-card geo-card">
            <div class="card-header">
              <div class="geo-header">
                <h3>Global Views</h3>
                <p class="geo-subtitle">Views by region</p>
              </div>
            </div>
            <div class="card-content">
              <DashboardGeoMap :countries="geoData" />
            </div>
          </div>

          <!-- Top Countries Card - 30% -->
          <div class="dashboard-card top-countries-card">
            <div class="card-header">
              <h3>Top Countries</h3>
            </div>
            <div class="card-content">
              <div class="top-countries-list">
                <div 
                  v-for="country in topCountriesData" 
                  :key="country.country"
                  class="country-stat"
                >
                  <div class="country-flag">{{ getCountryFlag(country.country) }}</div>
                  <div class="country-details">
                    <span class="country-name">{{ country.country }}</span>
                    <span class="country-views">{{ formatViews(country.visitors) }} views</span>
                  </div>
                  <div class="country-sparkline">
                    <svg width="60" height="20">
                      <path
                        :d="generateSparklinePath(country.sparkline)"
                        :stroke="getSparklineColor(country.trend)"
                        stroke-width="1.5"
                        fill="none"
                        class="sparkline-path"
                      />
                    </svg>
                    <div class="trend-indicator" :class="country.trend">
                      <UIcon 
                        dynamic 
                        :name="country.trend === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
                      />
                    </div>
                  </div>
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
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['logout']);

// State
const selectedPeriod = ref('30d');

// Mock dashboard data
const dashboardData = ref({
  products: [
    {
      id: 1,
      name: 'TaskFlow Pro',
      status: 'approved',
      views: 2540,
      clicks: 180,
      revenue: 1250,
      lastUpdate: '2024-01-20',
      category: 'Productivity',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'Analytics Hub',
      status: 'pending',
      views: 1890,
      clicks: 95,
      revenue: 800,
      lastUpdate: '2024-01-18',
      category: 'Analytics',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      name: 'Design Studio',
      status: 'approved',
      views: 3200,
      clicks: 240,
      revenue: 1800,
      lastUpdate: '2024-01-22',
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=100&h=100&fit=crop'
    }
  ],
  totalViews: 12540,
  totalClicks: 1840,
  ctr: 14.7,
  countries: 45,
  revenue: 3850,
  activities: [
    {
      id: 1,
      type: 'product_view',
      message: 'TaskFlow Pro received 25 new views',
      timestamp: '2024-01-22T10:30:00Z',
      icon: 'i-heroicons-eye'
    },
    {
      id: 2,
      type: 'product_approved',
      message: 'Design Studio has been approved',
      timestamp: '2024-01-22T09:15:00Z',
      icon: 'i-heroicons-check-circle'
    },
    {
      id: 3,
      type: 'new_review',
      message: 'New review received for TaskFlow Pro',
      timestamp: '2024-01-21T16:45:00Z',
      icon: 'i-heroicons-star'
    },
    {
      id: 4,
      type: 'payment',
      message: 'Payment of $450 received',
      timestamp: '2024-01-21T14:20:00Z',
      icon: 'i-heroicons-currency-dollar'
    }
  ]
});

// Analytics data
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
  { 
    country: 'United States', 
    visitors: 3542, 
    percentage: 28.2,
    sparkline: [2800, 2950, 3100, 3250, 3400, 3542],
    trend: 'up'
  },
  { 
    country: 'United Kingdom', 
    visitors: 2103, 
    percentage: 16.8,
    sparkline: [2200, 2150, 2080, 2120, 2090, 2103],
    trend: 'down'
  },
  { 
    country: 'Germany', 
    visitors: 1876, 
    percentage: 15.0,
    sparkline: [1650, 1720, 1780, 1820, 1850, 1876],
    trend: 'up'
  },
  { 
    country: 'Canada', 
    visitors: 1254, 
    percentage: 10.0,
    sparkline: [1180, 1200, 1220, 1235, 1245, 1254],
    trend: 'up'
  },
  { 
    country: 'France', 
    visitors: 987, 
    percentage: 7.9,
    sparkline: [1100, 1050, 1020, 1000, 995, 987],
    trend: 'down'
  },
  { 
    country: 'Australia', 
    visitors: 765, 
    percentage: 6.1,
    sparkline: [720, 735, 750, 758, 762, 765],
    trend: 'up'
  },
  { 
    country: 'Netherlands', 
    visitors: 543, 
    percentage: 4.3,
    sparkline: [480, 510, 525, 535, 540, 543],
    trend: 'up'
  },
  { 
    country: 'Japan', 
    visitors: 432, 
    percentage: 3.4,
    sparkline: [450, 445, 440, 435, 433, 432],
    trend: 'down'
  },
  { 
    country: 'Brazil', 
    visitors: 387, 
    percentage: 3.1,
    sparkline: [320, 340, 360, 375, 382, 387],
    trend: 'up'
  },
  { 
    country: 'India', 
    visitors: 298, 
    percentage: 2.4,
    sparkline: [250, 265, 280, 290, 295, 298],
    trend: 'up'
  },
  { 
    country: 'Spain', 
    visitors: 234, 
    percentage: 1.9,
    sparkline: [260, 250, 245, 240, 237, 234],
    trend: 'down'
  },
  { 
    country: 'Italy', 
    visitors: 198, 
    percentage: 1.6,
    sparkline: [180, 185, 190, 195, 197, 198],
    trend: 'up'
  },
  { 
    country: 'Mexico', 
    visitors: 156, 
    percentage: 1.2,
    sparkline: [140, 145, 150, 152, 154, 156],
    trend: 'up'
  },
  { 
    country: 'Others', 
    visitors: 223, 
    percentage: 1.8,
    sparkline: [200, 205, 210, 215, 220, 223],
    trend: 'up'
  }
]);

// Utility functions
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Top countries data
const topCountriesData = computed(() => {
  return geoData.value
    .filter(c => c.country !== 'Others')
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);
});

const maxCountryViews = computed(() => {
  return Math.max(...geoData.value.map(c => c.visitors));
});

const formatViews = (views: number) => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
};

const getCountryFlag = (country: string) => {
  const flags: { [key: string]: string } = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Brazil': '🇧🇷',
    'India': '🇮🇳',
    'China': '🇨🇳',
    'Mexico': '🇲🇽',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Netherlands': '🇳🇱',
    'Argentina': '🇦🇷',
    'South Africa': '🇿🇦'
  };
  return flags[country] || '🌍';
};

// Sparkline chart generation
const generateSparklinePath = (data: number[]) => {
  if (!data || data.length === 0) return '';
  
  const width = 60;
  const height = 20;
  const padding = 2;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - ((value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });
  
  return `M${points.join(' L')}`;
};

const getSparklineColor = (trend: string) => {
  return trend === 'up' ? '#10b981' : '#ef4444';
};
</script>

<style scoped>
.dashboard-main {
  background-color: transparent; /* Let parent control background */
  flex: 1;
}

.dashboard-content {
  padding: 0; /* Remove padding, let parent handle it */
}

.container {
  max-width: 100%;
  margin: 0;
  padding: 0 var(--spacing-lg);
}

.overview-section {
  margin-bottom: 22px;
}

.overview-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 22px;
  align-items: start;
}

.analytics-container {
  height: 100%;
}

.analytics-container .dashboard-card {
  height: 100%;
  min-height: 280px;
}

.metrics-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: var(--spacing-md);
  height: 100%;
  max-width: none; /* Remove width constraint */
  width: 100%; /* Use full available width */
}

.overview-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--spacing-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
  min-height: 120px;
}

.overview-card.compact {
  padding: var(--spacing-lg); /* Increased padding for better full-width appearance */
  min-height: 120px; /* Consistent height */
  gap: var(--spacing-sm);
  flex: 1; /* Allow cards to flex and fill space */
}

.overview-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-title);
  color: white;
  flex-shrink: 0;
  margin-bottom: var(--spacing-xs);
}

.overview-card.compact .card-icon {
  width: 48px;
  height: 48px;
  font-size: var(--fs-title-sm);
}

.card-icon.products {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.views {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-icon.clicks {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.card-icon.ctr {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.card-icon.countries {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-xs);
}

.card-title {
  color: var(--text-secondary);
  font-size: var(--fs-caption);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.card-number {
  font-size: var(--fs-heading);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.overview-card.compact .card-number {
  font-size: var(--fs-title);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

.dashboard-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  color: var(--text-primary);
  font-size: var(--fs-title-sm);
  font-weight: 600;
  margin: 0;
}

/* Geographic card header styles */
.geo-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.geo-header h3 {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--text-primary);
}

.geo-subtitle {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

/* Special content padding for geo card */
.geo-card .card-content {
  padding: var(--spacing-lg);
}

.top-countries-card .card-content {
  padding: var(--spacing-lg) 0;
}

/* Top Countries Card Styles */
.top-countries-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  max-height: 400px;
  overflow-y: auto;
}

.country-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  min-width: 0;
}

.country-stat:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.country-flag {
  font-size: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.country-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
  min-width: 0;
}

.country-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.country-views {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.country-sparkline {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.sparkline-path {
  transition: stroke 0.3s ease;
}

.trend-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.trend-indicator.up {
  background: #dcfce7;
  color: #10b981;
}

.trend-indicator.down {
  background: #fee2e2;
  color: #ef4444;
}

.card-header h3 {
  font-size: var(--fs-title-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.card-content {
  padding: var(--spacing-lg);
}

.period-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: var(--fs-sm);
  background: white;
  cursor: pointer;
}

.analytics-card {
  grid-column: span 2;
  height: 450px; /* Increased height for better chart display */
  width: 100%;
}

.analytics-card .card-content {
  padding: 0;
  height: calc(450px - 73px); /* Updated calculation based on new card height */
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent content overflow */
}

/* Full width geographic card */
.geo-card.full-width {
  grid-column: 1 / -1;
  width: 100%;
}

/* Full page width section for geographic distribution */
.full-width-section {
  width: 100%;
  margin: var(--spacing-xl) 0;
  padding: 0;
}

.geo-row {
  display: grid;
  grid-template-columns: 7fr 3fr; /* Better 70/30 split */
  gap: var(--spacing-xl);
  width: 100%;
  padding: 0 var(--spacing-lg);
}

.geo-card {
  flex: none;
  max-width: none;
}

.top-countries-card {
  flex: none;
  max-width: none;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--fs-sm);
}

@media (max-width: 1200px) {
  .overview-layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .metrics-container {
    grid-template-columns: 1fr 1fr;
    max-width: none;
  }
  
  .overview-card.compact {
    min-width: auto;
  }
  
  .analytics-container .dashboard-card {
    min-height: 350px;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-card,
  .geo-card {
    grid-column: span 1;
  }
  
  .geo-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .analytics-card {
    grid-column: span 1;
    height: 380px; /* Increased mobile height for better chart display */
    width: 100%;
  }
  
  .analytics-card .card-content {
    height: calc(380px - 65px); /* Updated calculation for mobile */
    width: 100%;
    overflow: hidden;
  }
  
  .full-width-section {
    padding: 0;
    margin: var(--spacing-lg) 0;
  }
  
  .geo-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    padding: 0 var(--spacing-md);
  }
  
  .geo-card,
  .top-countries-card {
    max-width: 100%;
  }
  
  .top-countries-list {
    max-height: 300px;
    grid-template-columns: 1fr;
  }
  
  .country-stat {
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .country-flag {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  
  .country-name {
    font-size: 13px;
  }
  
  .country-views {
    font-size: 11px;
  }
  
  .country-sparkline {
    gap: 4px;
  }
  
  .trend-indicator {
    width: 14px;
    height: 14px;
    font-size: 9px;
  }
  
  .metrics-container {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
    max-width: none;
  }
  
  .overview-card.compact {
    min-width: auto;
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .analytics-container .dashboard-card {
    min-height: 300px;
  }
  
  .card-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--spacing-sm);
  }
  
  .overview-section {
    margin-bottom: var(--spacing-lg);
  }
  
  .metrics-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    gap: var(--spacing-sm);
    height: auto;
  }
  
  .overview-card.compact .card-number {
    font-size: var(--fs-title);
  }
  
  .overview-card.compact .card-icon {
    width: 40px;
    height: 40px;
    font-size: var(--fs-base);
  }
  
  .card-title {
    font-size: var(--fs-caption);
  }
  
  .geo-row {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .analytics-card {
    height: 320px;
  }
  
  .analytics-card .card-content {
    height: calc(320px - 60px);
  }
  
  .top-countries-list {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }
  
  .country-stat {
    padding: var(--spacing-xs);
    gap: var(--spacing-xs);
  }
}
</style>
