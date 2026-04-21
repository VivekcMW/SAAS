<template>
  <nav class="breadcrumb-nav" aria-label="Breadcrumb">
    <div class="container mx-auto px-4">
      <ol class="breadcrumb-list flex items-center space-x-2 text-sm text-gray-600">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="breadcrumb-item flex items-center"
        >
          <template v-if="index < items.length - 1">
            <NuxtLink 
              :to="item.url" 
              class="breadcrumb-link hover:text-primary transition-colors"
              :aria-label="`Go to ${item.name}`"
            >
              {{ item.name }}
            </NuxtLink>
            <span class="breadcrumb-separator mx-2 text-gray-400" aria-hidden="true">
              /
            </span>
          </template>
          <template v-else>
            <span class="breadcrumb-current text-gray-900 font-medium" aria-current="page">
              {{ item.name }}
            </span>
          </template>
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface Props {
  items: BreadcrumbItem[];
}

// Generate structured data for breadcrumbs
const props = defineProps<Props>();

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `https://saasworld.com${item.url}`
        }))
      })
    }
  ]
});
</script>

<style scoped>
.breadcrumb-nav {
  background-color: var(--color-gray-50, #f9fafb);
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
  padding: 12px 0;
}

.breadcrumb-list {
  font-size: 0.875rem;
}

.breadcrumb-link {
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary, #4f46e5);
}

.breadcrumb-separator {
  color: var(--color-gray-400, #9ca3af);
}

.breadcrumb-current {
  color: var(--color-gray-900, #111827);
  font-weight: 500;
}

@media (max-width: 640px) {
  .breadcrumb-nav {
    padding: 8px 0;
  }
  
  .breadcrumb-list {
    font-size: 0.8125rem;
  }
}
</style>