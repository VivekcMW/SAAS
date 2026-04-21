<template>
  <section class="hero-section">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">
          System <span class="highlight">Status</span>
        </h1>
        <p class="hero-subtitle">
          Monitor the real-time status of our platform services and integrations. Stay informed about any ongoing incidents or maintenance windows.
        </p>
      </div>
    </div>
  </section>

  <!-- Quick Stats Section -->
  <div class="status-summary">
    <div class="container">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Overall Uptime</div>
          <div class="summary-value">{{ formatUptime(overallUptime) }}</div>
          <div class="summary-period">Last 30 days</div>
        </div>
        
        <div class="summary-item">
          <div class="summary-label">Average Response</div>
          <div class="summary-value">{{ formatResponseTime(averageResponseTime) }}</div>
          <div class="summary-period">Across all services</div>
        </div>
        
        <div class="summary-item">
          <div class="summary-label">Active Incidents</div>
          <div class="summary-value" :class="{ 'has-incidents': activeIncidents.length > 0 }">
            {{ activeIncidents.length }}
          </div>
          <div class="summary-period">Currently ongoing</div>
        </div>
        
        <div class="summary-item">
          <div class="summary-label">Last Updated</div>
          <div class="summary-value">{{ getRelativeTime(lastRefresh) }}</div>
          <div class="summary-period">{{ formatIncidentTime(lastRefresh) }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Active Incidents Alert -->
  <div v-if="activeIncidents.length > 0" class="active-incidents-alert">
    <div class="container">
      <div class="alert-header">
        <UIcon name="i-heroicons-exclamation-triangle" class="alert-icon" />
        <h3>Active Incidents</h3>
      </div>
      <div class="incidents-list">
        <div 
          v-for="incident in activeIncidents" 
          :key="incident.id"
          class="incident-item"
          :class="incident.severity"
        >
          <div class="incident-content">
            <h4>{{ incident.title }}</h4>
            <p>{{ incident.description }}</p>
            <div class="incident-meta">
              <span class="incident-status" :class="incident.status">{{ incident.status }}</span>
              <span class="incident-time">{{ getRelativeTime(incident.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { 
  systemStatus, 
  overallUptime, 
  averageResponseTime, 
  activeIncidents, 
  lastRefresh,
  isLoading,
  refreshStatus,
  getStatusColor,
  getStatusIcon,
  formatUptime,
  formatResponseTime,
  formatIncidentTime,
  getRelativeTime
} = useStatusData()

const getStatusText = (status: string) => {
  const texts = {
    operational: 'All Systems Operational',
    outage: 'Service Outage',
    maintenance: 'Maintenance in Progress'
  }
  return texts[status as keyof typeof texts] || 'Status Unknown'
}

const openSubscribeModal = () => {
  // TODO: Implement subscription modal
  console.log('Opening subscribe modal...')
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  padding: calc(var(--spacing-xxl) * 2) 0;
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
  font-size: 3.25rem;
  line-height: 1.2;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
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
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: var(--spacing-lg);
}

.status-icon {
  font-size: 2rem;
}

.status-text {
  font-size: 1.25rem;
  font-weight: 600;
}

/* Quick Stats Section */
.status-summary {
  padding: var(--spacing-xxl) 0;
  background: #f8fafc;
}

.status-summary .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.summary-value.has-incidents {
  color: var(--primary-color);
}

.summary-period {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* Active Incidents Alert */
.active-incidents-alert {
  padding: var(--spacing-xl) 0;
  background: #fef2f2;
}

.active-incidents-alert .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  background: white;
  border: 2px solid #fecaca;
  border-radius: 1rem;
  padding: 1.5rem;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.alert-icon {
  color: #dc2626;
  font-size: 1.25rem;
}

.alert-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #dc2626;
}

.incidents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.incident-item {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  border-left: 4px solid;
  text-align: left;
}

.incident-item.minor {
  border-left-color: #F59E0B;
}

.incident-item.major {
  border-left-color: #EF4444;
}

.incident-item.critical {
  border-left-color: #DC2626;
}

.incident-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.incident-content p {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.incident-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.incident-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  text-transform: capitalize;
}

.incident-status.investigating {
  background: #fef2f2;
  color: #dc2626;
}

.incident-status.identified {
  background: #fef3c7;
  color: #d97706;
}

.incident-status.monitoring {
  background: #eff6ff;
  color: #2563eb;
}

.incident-time {
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .status-indicator {
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .status-summary .container {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }
}
</style>
