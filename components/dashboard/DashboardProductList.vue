<template>
  <div class="product-list">
    <div v-if="products.length === 0" class="empty-state">
      <div class="empty-icon">
        <UIcon dynamic name="i-heroicons-squares-plus" />
      </div>
      <h4>No products listed yet</h4>
      <p>Start by adding your first product to the marketplace</p>
      <NuxtLink to="/list-product" class="btn btn-primary">
        <UIcon dynamic name="i-heroicons-plus" />
        Add Your First Product
      </NuxtLink>
    </div>

    <div v-else class="products-grid">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="product-card"
        @click="viewProduct(product)"
      >
        <!-- Product Image -->
        <div class="product-image">
          <img 
            :src="product.image" 
            :alt="product.name"
            @error="handleImageError"
          />
          <div class="product-status" :class="product.status">
            <UIcon dynamic :name="getStatusIcon(product.status)" />
            <span>{{ capitalizeStatus(product.status) }}</span>
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <div class="product-header">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-category">{{ product.category }}</div>
          </div>

          <!-- Product Stats -->
          <div class="product-stats">
            <div class="stat-group">
              <div class="stat-item">
                <UIcon dynamic name="i-heroicons-eye" />
                <span>{{ formatNumber(product.views) }} views</span>
              </div>
              <div class="stat-item">
                <UIcon dynamic name="i-heroicons-cursor-arrow-rays" />
                <span>{{ formatNumber(product.clicks) }} clicks</span>
              </div>
            </div>
            
            <div class="revenue-stat">
              <UIcon dynamic name="i-heroicons-currency-dollar" />
              <span>${{ formatNumber(product.revenue) }}</span>
            </div>
          </div>

          <!-- Product Actions -->
          <div class="product-actions">
            <button 
              class="action-btn view-btn"
              @click.stop="viewProduct(product)"
              title="View Details"
            >
              <UIcon dynamic name="i-heroicons-eye" />
            </button>
            
            <button 
              class="action-btn edit-btn"
              @click.stop="editProduct(product)"
              title="Edit Product"
            >
              <UIcon dynamic name="i-heroicons-pencil" />
            </button>
            
            <button 
              class="action-btn analytics-btn"
              @click.stop="viewAnalytics(product)"
              title="View Analytics"
            >
              <UIcon dynamic name="i-heroicons-chart-bar" />
            </button>
            
            <div class="action-menu" @click.stop>
              <button 
                class="action-btn menu-btn"
                @click="toggleMenu(product.id)"
                title="More Options"
              >
                <UIcon dynamic name="i-heroicons-ellipsis-horizontal" />
              </button>
              
              <div 
                v-if="activeMenu === product.id" 
                class="menu-dropdown"
                @click.stop
              >
                <button class="menu-item" @click="duplicateProduct(product)">
                  <UIcon dynamic name="i-heroicons-document-duplicate" />
                  Duplicate
                </button>
                <button class="menu-item" @click="shareProduct(product)">
                  <UIcon dynamic name="i-heroicons-share" />
                  Share
                </button>
                <div class="menu-divider"></div>
                <button class="menu-item danger" @click="deleteProduct(product)">
                  <UIcon dynamic name="i-heroicons-trash" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Last Updated -->
          <div class="product-footer">
            <span class="last-updated">
              Updated {{ formatDate(product.lastUpdate) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMore && products.length > 0" class="load-more-section">
      <button class="btn btn-secondary" @click="loadMore">
        <UIcon dynamic name="i-heroicons-arrow-down" />
        Load More Products
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  products: {
    type: Array as () => Array<{
      id: number;
      name: string;
      status: string;
      views: number;
      clicks: number;
      revenue: number;
      lastUpdate: string;
      category: string;
      image: string;
    }>,
    required: true
  }
});

const emit = defineEmits(['loadMore', 'viewProduct', 'editProduct', 'deleteProduct']);

// State
const activeMenu = ref<number | null>(null);
const hasMore = ref(false); // Would be determined by API response

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusIcon = (status: string) => {
  const icons: { [key: string]: string } = {
    approved: 'i-heroicons-check-circle',
    pending: 'i-heroicons-clock',
    rejected: 'i-heroicons-x-circle',
    draft: 'i-heroicons-document'
  };
  return icons[status] || 'i-heroicons-question-mark-circle';
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=120&fit=crop';
};

const toggleMenu = (productId: number) => {
  activeMenu.value = activeMenu.value === productId ? null : productId;
};

const viewProduct = (product: any) => {
  emit('viewProduct', product);
  // Navigate to product details
  navigateTo(`/marketplace/app/${product.id}`);
};

const editProduct = (product: any) => {
  emit('editProduct', product);
  // Navigate to edit form
  navigateTo(`/list-product?edit=${product.id}`);
};

const viewAnalytics = (product: any) => {
  // Open analytics modal or navigate to analytics page
  console.log('View analytics for:', product.name);
};

const duplicateProduct = (product: any) => {
  // Duplicate product logic
  console.log('Duplicate product:', product.name);
  activeMenu.value = null;
};

const shareProduct = (product: any) => {
  // Share product logic
  if (navigator.share) {
    navigator.share({
      title: product.name,
      text: `Check out ${product.name} on SaaSWorld`,
      url: `${window.location.origin}/marketplace/app/${product.id}`
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/marketplace/app/${product.id}`);
  }
  activeMenu.value = null;
};

const deleteProduct = (product: any) => {
  if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
    emit('deleteProduct', product);
  }
  activeMenu.value = null;
};

const loadMore = () => {
  emit('loadMore');
};

// Close menu when clicking outside
const closeMenus = () => {
  activeMenu.value = null;
};

// Add click listener to close menus
if (process.client) {
  document.addEventListener('click', closeMenus);
}
</script>

<style scoped>
.product-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-md);
}

.empty-state h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  font-size: 0.9rem;
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
  padding-right: var(--spacing-xs);
}

.product-card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.product-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.product-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-status {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.product-status.approved {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.product-status.pending {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.product-status.rejected {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.product-status.draft {
  background: rgba(107, 114, 128, 0.9);
  color: white;
}

.product-info {
  padding: var(--spacing-md);
}

.product-header {
  margin-bottom: var(--spacing-sm);
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.3;
}

.product-category {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-light);
  padding: 2px var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  display: inline-block;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  border-top: 1px solid var(--color-gray-100);
  border-bottom: 1px solid var(--color-gray-100);
}

.stat-group {
  display: flex;
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stat-item svg {
  font-size: 0.9rem;
}

.revenue-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color);
}

.product-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--primary-color-light);
}

.action-menu {
  position: relative;
  margin-left: auto;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-xs);
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 10;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: none;
  text-align: left;
  font-size: 0.85rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: var(--bg-light);
}

.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  background: #fef2f2;
}

.menu-divider {
  height: 1px;
  background: var(--color-gray-200);
  margin: var(--spacing-xs) 0;
}

.product-footer {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.load-more-section {
  text-align: center;
  padding: var(--spacing-lg) 0;
  border-top: 1px solid var(--color-gray-200);
  margin-top: var(--spacing-md);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.btn-secondary {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background: var(--bg-light);
  border-color: var(--primary-color);
}

/* Custom scrollbar for products grid */
.products-grid::-webkit-scrollbar {
  width: 4px;
}

.products-grid::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: 2px;
}

.products-grid::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: 2px;
}

.products-grid::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

@media (max-width: 768px) {
  .product-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
  
  .stat-group {
    gap: var(--spacing-sm);
  }
  
  .product-actions {
    justify-content: space-between;
  }
  
  .action-menu {
    margin-left: 0;
  }
}
</style>
