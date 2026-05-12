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

  <!-- Subscribe modal -->
  <div v-if="showSubscribeModal" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:300;display:flex;align-items:center;justify-content:center;" @click.self="showSubscribeModal = false">
    <div style="background:#fff;border-radius:12px;padding:2rem;width:380px;max-width:95vw;">
      <h2 style="font-size:1.1rem;font-weight:700;margin:0 0 .5rem;">Get incident notifications</h2>
      <p style="font-size:.875rem;color:#64748b;margin:0 0 1rem;">We'll email you when services are impacted.</p>
      <template v-if="!subscribeMsg">
        <input v-model="subscribeEmail" type="email" placeholder="you@company.com" style="width:100%;padding:.6rem .9rem;border:1px solid #e2e8f0;border-radius:8px;font-size:.9rem;margin-bottom:.75rem;" @keydown.enter="submitSubscribe" />
        <p v-if="subscribeError" style="color:#dc2626;font-size:.8rem;margin:0 0 .5rem;">{{ subscribeError }}</p>
        <div style="display:flex;gap:.75rem;justify-content:flex-end;">
          <button style="padding:.5rem 1rem;border-radius:8px;border:1px solid #e2e8f0;background:transparent;cursor:pointer;" @click="showSubscribeModal = false">Cancel</button>
          <button style="padding:.5rem 1rem;border-radius:8px;background:#2563eb;color:#fff;border:none;cursor:pointer;" :disabled="subscribing" @click="submitSubscribe">{{ subscribing ? 'Subscribing…' : 'Subscribe' }}</button>
        </div>
      </template>
      <div v-else style="text-align:center;padding:1rem 0;">
        <p style="font-size:.95rem;color:#16a34a;font-weight:600;">{{ subscribeMsg }}</p>
        <button style="margin-top:1rem;padding:.5rem 1.25rem;border-radius:8px;background:#2563eb;color:#fff;border:none;cursor:pointer;" @click="showSubscribeModal = false">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const { 
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

const subscribeEmail = ref('')
const subscribeMsg = ref('')
const subscribeError = ref('')
const subscribing = ref(false)
const showSubscribeModal = ref(false)

const openSubscribeModal = () => {
  subscribeEmail.value = ''
  subscribeMsg.value = ''
  subscribeError.value = ''
  showSubscribeModal.value = true
}

async function submitSubscribe() {
  subscribeError.value = ''
  subscribing.value = true
  try {
    await $fetch('/api/status/subscribe', { method: 'POST', body: { email: subscribeEmail.value } })
    subscribeMsg.value = 'Subscribed! You will be notified of incidents.'
  } catch (err: any) {
    subscribeError.value = err?.data?.statusMessage || 'Could not subscribe. Try again.'
  } finally {
    subscribing.value = false
  }
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
