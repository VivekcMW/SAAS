<template>
  <div class="css-test-page">
    <h1 class="test-title">CSS Test Page</h1>
    
    <!-- Original CSS Tests -->
    <div class="test-section">
      <h2>CSS Variables Test</h2>
      <div class="primary-box">Primary Color Background</div>
      <div class="secondary-box">Secondary Color Background</div>
      <button class="btn btn-primary">Primary Button</button>
      <button class="btn btn-secondary">Secondary Button</button>
    </div>
    
    <div class="test-section">
      <h2>Typography Test</h2>
      <p class="text-primary">Primary Text Color</p>
      <p class="text-secondary">Secondary Text Color</p>
    </div>
    
    <div class="test-section">
      <h2>Layout Test</h2>
      <div class="container">
        <div class="grid grid-cols-3">
          <div class="card">Card 1</div>
          <div class="card">Card 2</div>
          <div class="card">Card 3</div>
        </div>
      </div>
    </div>
    
    <!-- New CSS Test Component -->
    <div class="test-section">
      <h2>CSS Test Component</h2>
      <CssTest />
    </div>
  </div>
</template>

<script setup>
// Import the CSS test component
import CssTest from '~/components/CssTest.vue';

// Set page meta
useHead({
  title: 'CSS Test - SaaSWorld'
});
</script>

<style scoped>
.css-test-page {
  padding: 2rem;
  font-family: var(--font-primary, 'Poppins', sans-serif);
}

.test-title {
  color: var(--primary-color, #FF8838);
  text-align: center;
  margin-bottom: 2rem;
}

.test-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid var(--color-gray-300, #ddd);
  border-radius: var(--border-radius-md, 6px);
}

.primary-box {
  background-color: var(--primary-color, #FF8838);
  color: white;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: var(--border-radius-md, 6px);
}

.secondary-box {
  background-color: var(--secondary-color, #F9C845);
  color: var(--dark-color, #1E1E1E);
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: var(--border-radius-md, 6px);
}

.card {
  background: white;
  padding: 1rem;
  border-radius: var(--border-radius-md, 6px);
  border: 1px solid var(--color-gray-300, #ddd);
  text-align: center;
}

/* Fallback styles if CSS variables fail */
.css-test-page {
  --primary-color: #FF8838;
  --secondary-color: #F9C845;
  --dark-color: #1E1E1E;
  --color-gray-300: #D1D5DB;
  --border-radius-md: 6px;
  --font-primary: 'Poppins', sans-serif;
}
</style>
