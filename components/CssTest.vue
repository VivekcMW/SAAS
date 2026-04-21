<!-- CSS Test Component -->
<template>
  <div class="css-test-container">
    <h1 class="test-heading">CSS Test Component</h1>
    <div class="test-box primary">Primary Color Box</div>
    <div class="test-box secondary">Secondary Color Box</div>
    <div class="test-box text-primary">Text Primary Color Box</div>
    <div class="test-box text-secondary">Text Secondary Color Box</div>
    
    <!-- Inline style test to check if Vue styling works -->
    <div style="background-color: blue; color: white; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
      Inline Style Test (Should be blue)
    </div>
  </div>
</template>

<script setup>
// No functionality needed
</script>

<style>
/* These styles use CSS variables that should be defined in our global CSS */
.css-test-container {
  padding: 2rem;
  background-color: var(--bg-gray);
  border-radius: 8px;
  margin: 2rem;
}

.test-heading {
  color: var(--dark-color);
  margin-bottom: 1rem;
}

.test-box {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  color: white;
  text-align: center;
}

.primary {
  background-color: var(--primary-color);
}

.secondary {
  background-color: var(--secondary-color);
}

.text-primary {
  background-color: var(--text-primary);
}

.text-secondary {
  background-color: var(--text-secondary);
}
</style>
