<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Ensure critical CSS is loaded early
useHead({
  link: [
    { rel: 'stylesheet', href: '/styles.css' }
  ]
})
</script>

<style>
/* Force apply global styles directly in app.vue */
:root {
  /* Color Variables */
  --primary-color: #FF8838;
  --secondary-color: #F9C845;
  --dark-color: #1E1E1E;
  --light-color: #FFFFFF;
  --bg-gray: #F8F9FA;
  --text-primary: #4A5568;
  --text-secondary: #718096;
  
  /* Spacing Variables */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Border Radius */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  --border-radius-xl: 12px;
}

/* Global Component Styles */
body {
  font-family: var(--font-primary);
  color: var(--text-primary);
  background-color: var(--bg-gray);
  margin: 0;
  padding: 0;
}

/* Button Styles */
.btn {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--dark-color);
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
</style>
