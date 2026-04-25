<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Documentation</h1>
      <p>Complete guides and API references for Moonmart</p>
    </div>
    
    <div class="content">
      <div class="doc-section">
        <h2>Getting Started</h2>
        <ul>
          <li><a href="#quick-start">Quick Start Guide</a></li>
          <li><a href="#installation">Installation</a></li>
          <li><a href="#configuration">Configuration</a></li>
        </ul>
      </div>
      
      <div class="doc-section">
        <h2>API Reference</h2>
        <ul>
          <li><a href="#auth-api">Authentication API</a></li>
          <li><a href="#user-api">User Management API</a></li>
          <li><a href="#data-api">Data API</a></li>
        </ul>
      </div>
      
      <div class="doc-section">
        <h2>Tutorials</h2>
        <ul>
          <li><a href="#integration-tutorial">Integration Tutorial</a></li>
          <li><a href="#workflow-tutorial">Workflow Setup</a></li>
          <li><a href="#customization-tutorial">Customization Guide</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Documentation'
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

.doc-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
}

.doc-section h2 {
  margin-bottom: 1rem;
  color: var(--mm-gold);
}

.doc-section ul {
  list-style-type: none;
  padding: 0;
}

.doc-section li {
  margin-bottom: 0.5rem;
}

.doc-section a {
  color: var(--mm-gold);
  text-decoration: none;
  padding: 0.5rem 0;
  display: block;
  border-bottom: 0.5px solid var(--b1);
}

.doc-section a:hover {
  text-decoration: underline;
}
</style>
