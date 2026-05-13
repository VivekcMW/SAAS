<template>
  <div class="status-page">
    <!-- Hero Section with Overall Status -->
    <section class="status-hero">
      <div class="container">
        <StatusOverview />
      </div>
    </section>

    <!-- Services Status Section -->
    <section class="services-section">
      <div class="container">
        <ServiceStatusList />
      </div>
    </section>

    <!-- Uptime Chart Section -->
    <section class="uptime-section">
      <div class="container">
        <UptimeChart />
      </div>
    </section>

    <!-- Incident History Section -->
    <section class="incidents-section">
      <div class="container">
        <IncidentHistory />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// SEO Configuration
const { applySEO, generateHreflangTags } = useSEO()

applySEO({
  title: 'System Status - Moonmart',
  description: 'Real-time status of Moonmart systems, services, and integrations. Check current uptime, incidents, and maintenance schedules.',
  keywords: 'saasworld status, system status, uptime, service health, api status, integration status, incidents, maintenance',
  canonical: 'https://moonmart.ai/status',
  ogType: 'website',
  hreflang: generateHreflangTags('/status'),
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Moonmart System Status',
    description: 'Real-time status page showing the health of Moonmart systems and services',
    url: 'https://moonmart.ai/status',
    mainEntity: {
      '@type': 'MonitoringSystem',
      name: 'Moonmart Status Monitor',
      description: 'Continuous monitoring of Moonmart platform health'
    }
  }
})

// Status Data
const { 
  lastRefresh: _lastRefresh, 
  isLoading: _isLoading, 
  refreshStatus: _refreshStatus, 
  formatIncidentTime: _formatIncidentTime 
} = useStatusData()

// Page Title
useHead({
  title: 'System Status - Moonmart'
})
</script>

<style scoped>
.status-page {
  min-height: 100vh;
  background: var(--mm-bg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.status-hero {
  padding: 2rem 0;
}

.services-section {
  padding: 3rem 0;
}

.uptime-section {
  padding: 2rem 0;
  background: var(--mm-s1);
}

.incidents-section {
  padding: 3rem 0;
  background: var(--mm-bg);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
}

@media (max-width: 480px) {
  .status-hero {
    padding: 1rem 0;
  }
  
  .services-section,
  .incidents-section {
    padding: 2rem 0;
  }
  
  .uptime-section {
    padding: 1.5rem 0;
  }
}
</style>
