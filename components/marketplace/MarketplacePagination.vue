<template>
  <div class="marketplace-pagination" v-if="totalPages > 1">
    <div class="pagination-info">
      <span class="info-text">
        Showing <span class="info-highlight">{{ startItem }}-{{ endItem }}</span> 
        of <span class="info-highlight">{{ totalItems }}</span> applications
      </span>
    </div>
    
    <div class="pagination-controls">
      <button 
        class="pagination-btn" 
        :class="{ 'disabled': currentPage === 1 }" 
        :disabled="currentPage === 1"
        @click="goToPage(1)"
        aria-label="Go to first page"
      >
        <UIcon name="i-heroicons-chevron-double-left" dynamic />
      </button>
      
      <button 
        class="pagination-btn" 
        :class="{ 'disabled': currentPage === 1 }" 
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)" 
        aria-label="Go to previous page"
      >
        <UIcon name="i-heroicons-chevron-left" dynamic />
      </button>
      
      <div class="pagination-pages">
        <span v-if="showEllipsisStart" class="pagination-ellipsis">
          <UIcon name="i-heroicons-ellipsis-horizontal" dynamic />
        </span>
        
        <button 
          v-for="page in visiblePages" 
          :key="page" 
          class="pagination-page" 
          :class="{ 'active': currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        
        <span v-if="showEllipsisEnd" class="pagination-ellipsis">
          <UIcon name="i-heroicons-ellipsis-horizontal" dynamic />
        </span>
      </div>
      
      <button 
        class="pagination-btn" 
        :class="{ 'disabled': currentPage === totalPages }" 
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)" 
        aria-label="Go to next page"
      >
        <UIcon name="i-heroicons-chevron-right" dynamic />
      </button>
      
      <button 
        class="pagination-btn" 
        :class="{ 'disabled': currentPage === totalPages }" 
        :disabled="currentPage === totalPages"
        @click="goToPage(totalPages)" 
        aria-label="Go to last page"
      >
        <UIcon name="i-heroicons-chevron-double-right" dynamic />
      </button>
    </div>
    
    <div class="pagination-size-selector">
      <label for="page-size">Show:</label>
      <div class="select-wrapper">
        <select id="page-size" v-model="pageSize" @change="changePageSize">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
        <UIcon name="i-heroicons-chevron-down" dynamic class="select-icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Route and Router
const route = useRoute();
const router = useRouter();

// Props with defaults
interface PaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  maxVisiblePages?: number;
}

const props = withDefaults(defineProps<PaginationProps>(), {
  totalItems: 0,
  itemsPerPage: 12,
  maxVisiblePages: 5
});

// State
const currentPage = ref(1);
const pageSize = ref(props.itemsPerPage);
const pageSizeOptions = ref([12, 24, 36, 48]);

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / pageSize.value);
});

const startItem = computed(() => {
  return (currentPage.value - 1) * pageSize.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * pageSize.value;
  return end > props.totalItems ? props.totalItems : end;
});

const visiblePages = computed(() => {
  // If total pages is less than or equal to max visible pages, show all pages
  if (totalPages.value <= props.maxVisiblePages) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }
  
  // Otherwise, calculate visible range
  let startPage = Math.max(1, currentPage.value - Math.floor(props.maxVisiblePages / 2));
  let endPage = startPage + props.maxVisiblePages - 1;
  
  // Adjust if end page is greater than total pages
  if (endPage > totalPages.value) {
    endPage = totalPages.value;
    startPage = Math.max(1, endPage - props.maxVisiblePages + 1);
  }
  
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

const showEllipsisStart = computed(() => {
  return visiblePages.value[0] > 1;
});

const showEllipsisEnd = computed(() => {
  return visiblePages.value[visiblePages.value.length - 1] < totalPages.value;
});

// Methods
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) {
    return;
  }
  
  currentPage.value = page;
  
  // Update the URL without reloading
  updateQueryParams();
};

const changePageSize = () => {
  // When changing page size, try to maintain position in the list
  const firstItemOnCurrentPage = ((currentPage.value - 1) * pageSize.value) + 1;
  const newPage = Math.ceil(firstItemOnCurrentPage / pageSize.value);
  
  currentPage.value = Math.min(newPage, Math.ceil(props.totalItems / pageSize.value));
  
  // Update the URL without reloading
  updateQueryParams();
};

const updateQueryParams = () => {
  const query = {
    ...route.query,
    page: currentPage.value.toString(),
    size: pageSize.value.toString()
  };
  
  router.replace({ query });
};

const loadFromQueryParams = () => {
  if (route.query.page) {
    const page = parseInt(route.query.page as string);
    if (!isNaN(page) && page > 0 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }
  
  if (route.query.size) {
    const size = parseInt(route.query.size as string);
    if (!isNaN(size) && pageSizeOptions.value.includes(size)) {
      pageSize.value = size;
    }
  }
};

// Watch for route changes
watch(() => route.query, () => {
  loadFromQueryParams();
}, { deep: true });

// Lifecycle hooks
onMounted(() => {
  loadFromQueryParams();
});
</script>

<style scoped>
.marketplace-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) 0;
  margin-top: var(--spacing-lg);
  border-top: 0.5px solid var(--b1);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.pagination-info {
  color: var(--mm-slate);
  font-size: 0.95rem;
  font-weight: 500;
}

.info-highlight {
  color: var(--mm-gold);
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.pagination-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  cursor: pointer;
  color: var(--mm-slate);
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.disabled) {
  background: var(--mm-gold);
  color: #0A0700;
  border-color: var(--mm-gold);
}

.pagination-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--mm-s1);
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 0 var(--spacing-sm);
}

.pagination-page {
  min-width: 40px;
  height: 40px;
  padding: 0 var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  cursor: pointer;
  color: var(--mm-silver);
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination-page:hover:not(.active) {
  background: var(--mm-s3);
  color: var(--mm-gold);
  border-color: var(--mm-gold);
}

.pagination-page.active {
  background: var(--mm-gold);
  color: #0A0700;
  border-color: var(--mm-gold);
  font-weight: 600;
}

.pagination-ellipsis {
  width: 32px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mm-slate);
}

.pagination-size-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.pagination-size-selector label {
  font-size: 0.9rem;
  color: var(--mm-slate);
  font-weight: 500;
}

.select-wrapper {
  position: relative;
  display: inline-block;
}

.select-wrapper select {
  appearance: none;
  background: var(--mm-s2);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-sm);
  padding: var(--spacing-xs) calc(var(--spacing-lg) + var(--spacing-xs)) var(--spacing-xs) var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--mm-pearl);
  cursor: pointer;
  font-weight: 500;
  min-width: 60px;
}

.select-wrapper select:focus {
  outline: none;
  border-color: var(--mm-gold);
  box-shadow: 0 0 0 2px var(--mm-gold-soft);
}

.select-wrapper select:hover {
  border-color: var(--mm-gold);
}

.select-icon {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--mm-slate);
  width: 16px;
  height: 16px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .marketplace-pagination {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .pagination-info {
    order: 3;
    text-align: center;
  }
  
  .pagination-controls {
    order: 1;
  }
  
  .pagination-size-selector {
    order: 2;
  }
}

@media (max-width: 576px) {
  .pagination-pages .pagination-page:not(.active) {
    display: none;
  }
  
  .pagination-pages .pagination-page.active {
    margin: 0 var(--spacing-xs);
  }
  
  .pagination-btn {
    width: 36px;
    height: 36px;
  }
  
  .pagination-page {
    min-width: 36px;
    height: 36px;
  }
}
</style>
