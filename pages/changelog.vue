<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Changelog</h1>
      <p>Stay updated with the latest features and improvements</p>
    </div>
    
    <div class="content">
      <div class="changelog-entry">
        <h2>Version 2.1.0 - July 2025</h2>
        <ul>
          <li>Enhanced global market support</li>
          <li>Improved performance and stability</li>
          <li>New integration features</li>
        </ul>
      </div>
      
      <div class="changelog-entry">
        <h2>Version 2.0.0 - June 2025</h2>
        <ul>
          <li>Complete UI redesign</li>
          <li>Multi-language support</li>
          <li>Enhanced security features</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Changelog'
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

.changelog-entry {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 0.5px solid var(--b1);
  border-radius: var(--r-sm);
}

.changelog-entry h2 {
  margin-bottom: 1rem;
  color: var(--mm-gold);
}

.changelog-entry ul {
  list-style-type: disc;
  margin-left: 1.5rem;
}

.changelog-entry li {
  margin-bottom: 0.5rem;
}
</style>
