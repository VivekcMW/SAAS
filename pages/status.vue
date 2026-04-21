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
  title: 'System Status - SaasWorld',
  description: 'Real-time status of SaasWorld systems, services, and integrations. Check current uptime, incidents, and maintenance schedules.',
  keywords: 'saasworld status, system status, uptime, service health, api status, integration status, incidents, maintenance',
  canonical: 'https://saasworld.com/status',
  ogType: 'website',
  hreflang: generateHreflangTags('/status'),
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'SaasWorld System Status',
    description: 'Real-time status page showing the health of SaasWorld systems and services',
    url: 'https://saasworld.com/status',
    mainEntity: {
      '@type': 'MonitoringSystem',
      name: 'SaasWorld Status Monitor',
      description: 'Continuous monitoring of SaasWorld platform health'
    }
  }
})

// Status Data
const { 
  lastRefresh, 
  isLoading, 
  refreshStatus, 
  formatIncidentTime 
} = useStatusData()

// Page Title
useHead({
  title: 'System Status - SaasWorld'
})
</script>

<style scoped>
.status-page {
  min-height: 100vh;
  background: #f9fafb;
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
  background: #f9fafb;
}

.incidents-section {
  padding: 3rem 0;
  background: white;
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
