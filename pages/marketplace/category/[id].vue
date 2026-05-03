<template>
  <div class="category-page">
    <!-- Category Header -->
    <section class="category-header">
      <div class="container">
        <div class="header-content">
          <div class="category-info">
            <div class="category-icon">
              <UIcon dynamic :name="getCategoryIcon(categoryId)" />
            </div>
            <div>
              <h1 class="category-title">{{ getCategoryName(categoryId) }}</h1>
              <p class="category-description">Discover the best {{ getCategoryName(categoryId) }} applications for your business</p>
            </div>
          </div>
          <div class="header-actions">
            <select v-model="sortBy" class="sort-select">
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Applications Grid -->
    <section class="applications-section">
      <div class="container">
        <CategoryApplications :selectedCategory="categoryId" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from '#app';
import CategoryApplications from '~/components/marketplace/CategoryApplications.vue';

const route = useRoute();
const router = useRouter();
const categoryId = computed(() => {
  console.log("Route params:", route.params);
  return route.params.id as string;
});
const sortBy = ref('popular');

// Advanced SEO implementation
const { applySEO, generateCategorySEO, generateHreflangTags } = useSEO();

// Apply category-specific SEO
onMounted(() => {
  console.log("Category page loaded with ID:", categoryId.value);
  if (!categoryId.value) {
    router.push('/marketplace');
    return;
  }
  
  // Apply SEO for this category
  const categoryName = getCategoryName(categoryId.value);
  applySEO({
    title: `${categoryName} Software Tools | Moonmart Marketplace`,
    description: `Discover the best ${categoryName.toLowerCase()} software and tools for your business. Compare features, pricing, and reviews to find the perfect ${categoryName.toLowerCase()} solution.`,
    keywords: `${categoryName.toLowerCase()} software, ${categoryName.toLowerCase()} tools, business ${categoryName.toLowerCase()}, ${categoryName.toLowerCase()} solutions, ${categoryName.toLowerCase()} applications`,
    canonical: `https://moonmart.ai/marketplace/category/${categoryId.value}`,
    ogImage: `/assets/images/categories/${categoryId.value}-og.jpg`,
    hreflang: generateHreflangTags(`/marketplace/category/${categoryId.value}`),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${categoryName} Software Directory`,
      description: `Comprehensive directory of ${categoryName.toLowerCase()} software and tools`,
      url: `https://moonmart.ai/marketplace/category/${categoryId.value}`
    }
  });
});

// Categories data mapping
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

// Get category name from id
const getCategoryName = (categoryId: string): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};

// Get category icon from id
const getCategoryIcon = (categoryId: string): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.icon : 'heroicons:squares-2x2';
};

// SEO Optimization
const hasPageParam = computed(() => !!(route.query.page || route.query.filter || route.query.sort))

useHead(() => ({
  title: `${getCategoryName(categoryId.value)} Applications - Moonmart Marketplace`,
  meta: [
    { 
      name: 'description', 
      content: `Explore the best ${getCategoryName(categoryId.value)} applications for your business on Moonmart Marketplace.` 
    },
    { property: 'og:title', content: `${getCategoryName(categoryId.value)} Applications - Moonmart Marketplace` },
    { 
      property: 'og:description', 
      content: `Explore the best ${getCategoryName(categoryId.value)} applications for your business on Moonmart Marketplace.` 
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `https://moonmart.ai/marketplace/category/${categoryId.value}` },
    { name: 'robots', content: hasPageParam.value ? 'noindex, follow' : 'index, follow' }
  ],
  link: [{ rel: 'canonical', href: `https://moonmart.ai/marketplace/category/${categoryId.value}` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(generateCategoryPageSchema(
        getCategoryName(categoryId.value),
        categoryId.value,
        []
      ))
    }
  ]
}));

// Wire category schema
const { generateCategoryPageSchema } = useSchemaMarkup();
</script>

<style scoped>
.category-page {
  padding-bottom: var(--spacing-xxl);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Category Header */
.category-header {
  padding: var(--spacing-xl) 0;
  background-color: white;
  border-bottom: 1px solid var(--color-gray-200);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.category-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.category-description {
  font-size: 1rem;
  color: var(--color-gray-600);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sort-select {
  padding: 0.6rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-gray-300);
  background-color: white;
  font-size: 0.9rem;
  color: var(--color-text-dark);
  min-width: 180px;
  cursor: pointer;
}

/* Applications Section */
.applications-section {
  padding: var(--spacing-xl) 0;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .category-title {
    font-size: 1.5rem;
  }
  
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .header-actions {
    width: 100%;
  }
  
  .sort-select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .category-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .category-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
