<template>
  <div class="category-index">
    <h1>All Categories</h1>
    <div class="categories-grid">
      <NuxtLink 
        v-for="(category, index) in categories" 
        :key="index"
        :to="`/marketplace/category/${category.id}`"
        class="category-card"
      >
        <div class="category-icon">
          <UIcon dynamic :name="category.icon" />
        </div>
        <h3>{{ category.name }}</h3>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Categories data
const categories = [
  { id: 'crm', name: 'CRM', icon: 'heroicons:user-group' },
  { id: 'marketing', name: 'Marketing', icon: 'heroicons:megaphone' },
  { id: 'productivity', name: 'Productivity', icon: 'heroicons:clipboard-document-check' },
  { id: 'development', name: 'Development', icon: 'heroicons:code-bracket' },
  { id: 'integration', name: 'Integration', icon: 'heroicons:arrows-right-left' },
  { id: 'finance', name: 'Finance', icon: 'heroicons:currency-dollar' },
  { id: 'communication', name: 'Communication', icon: 'heroicons:chat-bubble-oval-left-ellipsis' },
  { id: 'customer-support', name: 'Customer Support', icon: 'heroicons:lifebuoy' },
  { id: 'cloud', name: 'Cloud Services', icon: 'heroicons:cloud' },
  { id: 'design', name: 'Design', icon: 'heroicons:pencil-square' },
  { id: 'hr', name: 'HR & Recruiting', icon: 'heroicons:briefcase' },
  { id: 'analytics', name: 'Analytics', icon: 'heroicons:chart-bar' },
  { id: 'project-management', name: 'Project Management', icon: 'heroicons:clipboard-document-list' },
  { id: 'security', name: 'Security', icon: 'heroicons:shield-check' },
  { id: 'social-media', name: 'Social Media', icon: 'heroicons:share' },
  { id: 'education', name: 'Education', icon: 'heroicons:academic-cap' },
  { id: 'e-commerce', name: 'E-commerce', icon: 'heroicons:shopping-cart' },
];

useHead({
  title: 'All Categories - SaaSWorld Marketplace',
  meta: [
    { 
      name: 'description', 
      content: 'Explore all application categories in the SaaSWorld Marketplace.' 
    }
  ]
});
</script>

<style scoped>
.category-index {
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid #e5e7eb;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.category-icon {
  margin-bottom: 1rem;
  color: #4f46e5;
}

h3 {
  margin: 0;
  font-size: 1.1rem;
  text-align: center;
}
</style>
