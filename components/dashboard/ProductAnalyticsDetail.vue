<template>
  <div class="analytics-detail">
    <!-- Analytics Overview -->
    <div class="analytics-overview">
      <div class="overview-cards">
        <div class="metric-card">
          <div class="metric-icon">
            <UIcon dynamic name="i-heroicons-eye" />
          </div>
          <div class="metric-content">
            <h4>{{ formatNumber(product.views) }}</h4>
            <p>Total Views</p>
            <span class="metric-trend" :class="product.viewsTrend >= 0 ? 'positive' : 'negative'">
              {{ product.viewsTrend >= 0 ? '+' : '' }}{{ product.viewsTrend }}% vs last month
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
          </div>
          <div class="metric-content">
            <h4>{{ formatNumber(product.clicks) }}</h4>
            <p>Total Clicks</p>
            <span class="metric-trend positive">
              CTR: {{ product.ctr }}%
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <UIcon dynamic name="i-heroicons-currency-dollar" />
          </div>
          <div class="metric-content">
            <h4>${{ formatNumber(product.revenue) }}</h4>
            <p>Revenue</p>
            <span class="metric-trend" :class="product.revenueTrend >= 0 ? 'positive' : 'negative'">
              {{ product.revenueTrend >= 0 ? '+' : '' }}{{ product.revenueTrend }}% vs last month
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <UIcon dynamic name="i-heroicons-users" />
          </div>
          <div class="metric-content">
            <h4>{{ formatNumber(product.activeUsers) }}</h4>
            <p>Active Users</p>
            <span class="metric-trend positive">
              {{ product.retention }}% retention rate
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Range Selector -->
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
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <h3>Views & Clicks Over Time</h3>
        <div class="chart-placeholder">
          <div class="chart-data">
            <div class="data-point" v-for="i in 30" :key="i" :style="{ height: Math.random() * 100 + 20 + 'px' }"></div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color views"></span>
              <span>Views</span>
            </div>
            <div class="legend-item">
              <span class="legend-color clicks"></span>
              <span>Clicks</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <h3>Revenue Breakdown</h3>
        <div class="revenue-breakdown">
          <div class="revenue-item">
            <div class="revenue-label">
              <span class="revenue-dot subscription"></span>
              <span>Subscription Revenue</span>
            </div>
            <span class="revenue-amount">${{ formatNumber(product.revenue * 0.7) }}</span>
          </div>
          <div class="revenue-item">
            <div class="revenue-label">
              <span class="revenue-dot addon"></span>
              <span>Add-on Revenue</span>
            </div>
            <span class="revenue-amount">${{ formatNumber(product.revenue * 0.2) }}</span>
          </div>
          <div class="revenue-item">
            <div class="revenue-label">
              <span class="revenue-dot commission"></span>
              <span>Commission</span>
            </div>
            <span class="revenue-amount">${{ formatNumber(product.revenue * 0.1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Geographic Performance -->
    <div class="geographic-section">
      <h3>Geographic Performance</h3>
      <div class="geo-data">
        <div class="geo-item">
          <div class="geo-flag">🇺🇸</div>
          <div class="geo-info">
            <span class="geo-country">United States</span>
            <div class="geo-metrics">
              <span>{{ formatNumber(Math.floor(product.views * 0.4)) }} views</span>
              <span>${{ formatNumber(Math.floor(product.revenue * 0.45)) }} revenue</span>
            </div>
          </div>
          <div class="geo-percentage">45%</div>
        </div>

        <div class="geo-item">
          <div class="geo-flag">🇬🇧</div>
          <div class="geo-info">
            <span class="geo-country">United Kingdom</span>
            <div class="geo-metrics">
              <span>{{ formatNumber(Math.floor(product.views * 0.25)) }} views</span>
              <span>${{ formatNumber(Math.floor(product.revenue * 0.28)) }} revenue</span>
            </div>
          </div>
          <div class="geo-percentage">28%</div>
        </div>

        <div class="geo-item">
          <div class="geo-flag">🇩🇪</div>
          <div class="geo-info">
            <span class="geo-country">Germany</span>
            <div class="geo-metrics">
              <span>{{ formatNumber(Math.floor(product.views * 0.15)) }} views</span>
              <span>${{ formatNumber(Math.floor(product.revenue * 0.12)) }} revenue</span>
            </div>
          </div>
          <div class="geo-percentage">12%</div>
        </div>

        <div class="geo-item">
          <div class="geo-flag">🇫🇷</div>
          <div class="geo-info">
            <span class="geo-country">France</span>
            <div class="geo-metrics">
              <span>{{ formatNumber(Math.floor(product.views * 0.12)) }} views</span>
              <span>${{ formatNumber(Math.floor(product.revenue * 0.10)) }} revenue</span>
            </div>
          </div>
          <div class="geo-percentage">10%</div>
        </div>

        <div class="geo-item">
          <div class="geo-flag">🌍</div>
          <div class="geo-info">
            <span class="geo-country">Others</span>
            <div class="geo-metrics">
              <span>{{ formatNumber(Math.floor(product.views * 0.08)) }} views</span>
              <span>${{ formatNumber(Math.floor(product.revenue * 0.05)) }} revenue</span>
            </div>
          </div>
          <div class="geo-percentage">5%</div>
        </div>
      </div>
    </div>

    <!-- User Engagement -->
    <div class="engagement-section">
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
              <span class="metric-value">{{ product.rating }}</span>
              <span class="metric-label">User Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
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
      </div>
    </div>

    <!-- Export Options -->
    <div class="export-section">
      <h3>Export Analytics</h3>
      <div class="export-options">
        <button class="export-btn" @click="exportData('pdf')">
          <UIcon dynamic name="i-heroicons-document" />
          Export as PDF
        </button>
        <button class="export-btn" @click="exportData('csv')">
          <UIcon dynamic name="i-heroicons-table-cells" />
          Export as CSV
        </button>
        <button class="export-btn" @click="exportData('excel')">
          <UIcon dynamic name="i-heroicons-document-chart-bar" />
          Export as Excel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const selectedTimeRange = ref('30d');

const timeRanges = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' }
];

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const exportData = (format: string) => {
  console.log(`Exporting analytics data as ${format} for product:`, props.product.name);
  // Implement export functionality
};
</script>

<style scoped>
.analytics-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Overview Cards */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.metric-card {
  background: var(--bg-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-lg);
  background: var(--primary-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 1.2rem;
}

.metric-content h4 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.metric-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-xs);
}

.metric-trend {
  font-size: 0.8rem;
  font-weight: 500;
}

.metric-trend.positive {
  color: #10b981;
}

.metric-trend.negative {
  color: #ef4444;
}

/* Time Range Selector */
.time-range-selector {
  display: flex;
  justify-content: center;
}

.time-buttons {
  display: flex;
  gap: var(--spacing-xs);
  background: var(--bg-light);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-md);
}

.time-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: none;
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.time-btn.active {
  background: var(--primary-color);
  color: white;
}

.time-btn:hover:not(.active) {
  background: white;
  color: var(--text-primary);
}

/* Charts */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
}

.chart-container {
  background: var(--bg-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.chart-container h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-data {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 160px;
}

.data-point {
  flex: 1;
  background: linear-gradient(to top, var(--primary-color), var(--primary-color-light));
  border-radius: 2px 2px 0 0;
  min-height: 20px;
}

.chart-legend {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.views {
  background: var(--primary-color);
}

.legend-color.clicks {
  background: var(--primary-color-light);
}

/* Revenue Breakdown */
.revenue-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.revenue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.revenue-item:last-child {
  border-bottom: none;
}

.revenue-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.revenue-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.revenue-dot.subscription {
  background: #10b981;
}

.revenue-dot.addon {
  background: #3b82f6;
}

.revenue-dot.commission {
  background: #f59e0b;
}

.revenue-amount {
  font-weight: 600;
  color: var(--text-primary);
}

/* Geographic Section */
.geographic-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.geo-data {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.geo-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--border-radius-md);
}

.geo-flag {
  font-size: 1.5rem;
}

.geo-info {
  flex: 1;
}

.geo-country {
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.geo-metrics {
  display: flex;
  gap: var(--spacing-md);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.geo-percentage {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.1rem;
}

/* Engagement Section */
.engagement-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.engagement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.engagement-card {
  background: var(--bg-light);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.engagement-metric {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.engagement-metric svg {
  font-size: 1.2rem;
  color: var(--primary-color);
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Activity Section */
.activity-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--border-radius-md);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-md);
  background: var(--primary-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  display: block;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Export Section */
.export-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.export-options {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: white;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--primary-color-light);
}

/* Responsive Design */
@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .engagement-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .export-options {
    flex-direction: column;
  }
  
  .geo-metrics {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}
</style>
