<template>
  <div class="service-status-list">
    <div class="service-category" v-for="(categoryServices, category) in servicesByCategory" :key="category">
      <div class="category-header">
        <h2 class="category-title">{{ getCategoryTitle(category) }}</h2>
        <div class="category-status">
          <UIcon :name="getCategoryStatusIcon(categoryServices)" :style="{ color: getCategoryStatusColor(categoryServices) }" />
          <span>{{ getCategoryStatusText(categoryServices) }}</span>
        </div>
      </div>
      
      <div class="services-grid">
        <div 
          v-for="service in categoryServices" 
          :key="service.id"
          class="service-card"
          :class="service.status"
        >
          <div class="service-header">
            <div class="service-info">
              <UIcon :name="service.icon || 'i-heroicons-cube'" class="service-icon" />
              <div class="service-details">
                <h3 class="service-name">{{ service.name }}</h3>
                <p class="service-description">{{ service.description }}</p>
              </div>
            </div>
            
            <div class="service-status-badge" :class="service.status">
              <UIcon :name="getStatusIcon(service.status)" />
              <span>{{ getStatusText(service.status) }}</span>
            </div>
          </div>
          
          <div class="service-metrics">
            <div class="metric">
              <div class="metric-label">Uptime (30d)</div>
              <div class="metric-value" :class="getUptimeClass(service.uptime.last30d)">
                {{ formatUptime(service.uptime.last30d) }}
              </div>
            </div>
            
            <div class="metric" v-if="service.responseTime">
              <div class="metric-label">Response Time</div>
              <div class="metric-value" :class="getResponseTimeClass(service.responseTime)">
                {{ formatResponseTime(service.responseTime) }}
              </div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Status</div>
              <div class="metric-value status" :style="{ color: getStatusColor(service.status) }">
                {{ getStatusText(service.status) }}
              </div>
            </div>
          </div>
          
          <!-- Uptime History Mini Chart -->
          <div class="uptime-chart">
            <div class="chart-label">Last 30 days</div>
            <div class="chart-bars">
              <div 
                v-for="(day, index) in generateMiniUptimeData(service)" 
                :key="index"
                class="chart-bar"
                :class="getUptimeBarClass(day)"
                :title="`${day.toFixed(1)}% uptime`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { 
  servicesByCategory,
  getStatusColor,
  getStatusIcon,
  formatUptime,
  formatResponseTime
} = useStatusData()

const getCategoryTitle = (category: string) => {
  const titles = {
    core: 'Core Services',
    integration: 'Third-Party Integrations', 
    infrastructure: 'Infrastructure'
  }
  return titles[category as keyof typeof titles] || category
}

const getCategoryStatusIcon = (services: any[]) => {
  const hasOutage = services.some(s => s.status === 'outage')
  const hasDegraded = services.some(s => s.status === 'degraded')
  const hasMaintenance = services.some(s => s.status === 'maintenance')
  
  if (hasOutage) return 'i-heroicons-x-circle'
  if (hasDegraded) return 'i-heroicons-exclamation-triangle'
  if (hasMaintenance) return 'i-heroicons-wrench-screwdriver'
  return 'i-heroicons-check-circle'
}

const getCategoryStatusColor = (services: any[]) => {
  const hasOutage = services.some(s => s.status === 'outage')
  const hasDegraded = services.some(s => s.status === 'degraded')
  const hasMaintenance = services.some(s => s.status === 'maintenance')
  
  if (hasOutage) return '#EF4444'
  if (hasDegraded) return '#F59E0B'
  if (hasMaintenance) return '#3B82F6'
  return '#10B981'
}

const getCategoryStatusText = (services: any[]) => {
  const hasOutage = services.some(s => s.status === 'outage')
  const hasDegraded = services.some(s => s.status === 'degraded')
  const hasMaintenance = services.some(s => s.status === 'maintenance')
  
  if (hasOutage) return 'Service Issues'
  if (hasDegraded) return 'Degraded Performance'
  if (hasMaintenance) return 'Maintenance'
  return 'All Operational'
}

const getStatusText = (status: string) => {
  const texts = {
    operational: 'Operational',
    degraded: 'Degraded',
    outage: 'Outage',
    maintenance: 'Maintenance'
  }
  return texts[status as keyof typeof texts] || 'Unknown'
}

const getUptimeClass = (uptime: number) => {
  if (uptime >= 99.5) return 'excellent'
  if (uptime >= 99) return 'good'
  if (uptime >= 98) return 'fair'
  return 'poor'
}

const getResponseTimeClass = (responseTime: number) => {
  if (responseTime <= 100) return 'excellent'
  if (responseTime <= 200) return 'good'
  if (responseTime <= 500) return 'fair'
  return 'poor'
}

const generateMiniUptimeData = (service: any) => {
  // Generate 30 days of mock uptime data for visualization
  const data = []
  for (let i = 0; i < 30; i++) {
    // Generate realistic uptime data based on service status
    let uptime = 100
    if (service.status === 'degraded') {
      uptime = 98 + Math.random() * 2
    } else if (service.status === 'outage') {
      uptime = 85 + Math.random() * 15
    } else {
      uptime = 99.5 + Math.random() * 0.5
    }
    data.push(uptime)
  }
  return data
}

const getUptimeBarClass = (uptime: number) => {
  if (uptime >= 99.5) return 'excellent'
  if (uptime >= 99) return 'good'
  if (uptime >= 98) return 'fair'
  return 'poor'
}
</script>

<style scoped>
.service-status-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.service-category {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.category-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.category-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
  position: relative;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-card.operational {
  border-left: 4px solid #10B981;
}

.service-card.degraded {
  border-left: 4px solid #F59E0B;
  background: #fffbeb;
}

.service-card.outage {
  border-left: 4px solid #EF4444;
  background: #fef2f2;
}

.service-card.maintenance {
  border-left: 4px solid #3B82F6;
  background: #eff6ff;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.service-info {
  display: flex;
  gap: 0.75rem;
  flex: 1;
}

.service-icon {
  font-size: 1.5rem;
  color: #6b7280;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.service-details {
  flex: 1;
}

.service-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.service-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.service-status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.service-status-badge.operational {
  background: #d1fae5;
  color: #065f46;
}

.service-status-badge.degraded {
  background: #fef3c7;
  color: #92400e;
}

.service-status-badge.outage {
  background: #fee2e2;
  color: #991b1b;
}

.service-status-badge.maintenance {
  background: #dbeafe;
  color: #1e40af;
}

.service-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.metric-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.metric-value.excellent {
  color: #059669;
}

.metric-value.good {
  color: #0891b2;
}

.metric-value.fair {
  color: #d97706;
}

.metric-value.poor {
  color: #dc2626;
}

.metric-value.status {
  font-size: 0.875rem;
  text-transform: capitalize;
}

.uptime-chart {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.chart-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.chart-bars {
  display: flex;
  gap: 2px;
  height: 24px;
  align-items: end;
}

.chart-bar {
  flex: 1;
  min-width: 3px;
  border-radius: 1px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.chart-bar:hover {
  opacity: 0.8;
}

.chart-bar.excellent {
  background: #10B981;
  height: 100%;
}

.chart-bar.good {
  background: #06b6d4;
  height: 80%;
}

.chart-bar.fair {
  background: #f59e0b;
  height: 60%;
}

.chart-bar.poor {
  background: #ef4444;
  height: 40%;
}

/* Responsive */
@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: 1fr;
  }

  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .service-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .service-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .service-metrics {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .chart-bars {
    gap: 1px;
  }
}
</style>
