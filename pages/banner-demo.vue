<template>
  <div class="banner-demo-page container">
    <h1>Ad Banner Showcase</h1>
    
    <div class="demo-section">
      <h2>Top Position Banner</h2>
      <MarketplaceAdBanner position="top" />
    </div>
    
    <div class="demo-section">
      <h2>Middle Position Banner</h2>
      <MarketplaceAdBanner position="middle" />
    </div>
    
    <div class="demo-section sidebar-demo">
      <h2>Sidebar Position Banner</h2>
      <div class="sidebar-container">
        <MarketplaceAdBanner position="sidebar" />
      </div>
    </div>
  </div>
</template>

<script setup>
import MarketplaceAdBanner from '~/components/marketplace/MarketplaceAdBanner.vue';
</script>

<style scoped>
.banner-demo-page {
  padding: var(--spacing-xl) 0;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: var(--spacing-xl);
  text-align: center;
  font-size: 2rem;
}

.demo-section {
  margin-bottom: var(--spacing-xxl);
}

h2 {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-gray-200);
}

.sidebar-demo {
  display: flex;
  flex-direction: column;
}

.sidebar-container {
  width: 300px;
  height: 400px;
  border: 1px dashed var(--color-gray-300);
  padding: var(--spacing-md);
  background-color: var(--color-gray-100);
}

@media (max-width: 768px) {
  .sidebar-container {
    width: 100%;
  }
}
</style>
