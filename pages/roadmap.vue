<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Roadmap</h1>
      <p>See what's coming next in our development journey</p>
    </div>
    
    <div class="content">
      <div class="roadmap-item">
        <div class="roadmap-quarter">Q3 2025</div>
        <h3>Advanced Analytics</h3>
        <p>Enhanced reporting and insights dashboard with custom metrics and real-time data visualization.</p>
      </div>
      
      <div class="roadmap-item">
        <div class="roadmap-quarter">Q4 2025</div>
        <h3>Mobile App</h3>
        <p>Native mobile applications for iOS and Android with full feature parity and offline capabilities.</p>
      </div>
      
      <div class="roadmap-item">
        <div class="roadmap-quarter">Q1 2026</div>
        <h3>AI-Powered Features</h3>
        <p>Integration of machine learning algorithms for predictive analytics and automated workflows.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Roadmap'
})
</script>

<style scoped>
.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.roadmap-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-left: 2px solid var(--mm-gold);
  background: var(--mm-s2);
}

.roadmap-quarter {
  font-weight: bold;
  color: var(--mm-gold);
  margin-bottom: 0.5rem;
}

.roadmap-item h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}
</style>
