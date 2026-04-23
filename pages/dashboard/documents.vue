<template>
  <div class="documents-page">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Documents</h1>
          <p>Access invoices, reports, and important documents</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary">
            <UIcon dynamic name="i-heroicons-arrow-down-tray" />
            Export All
          </button>
          <button class="btn btn-primary">
            <UIcon dynamic name="i-heroicons-plus" />
            Upload Document
          </button>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="documents-grid">
        <!-- Document Categories -->
        <div class="categories-card">
          <div class="card-header">
            <h3>Document Categories</h3>
          </div>
          
          <div class="categories-list">
            <div class="category-item active">
              <UIcon dynamic name="i-heroicons-receipt-percent" />
              <span>Invoices</span>
              <span class="count">12</span>
            </div>
            <div class="category-item">
              <UIcon dynamic name="i-heroicons-chart-bar" />
              <span>Reports</span>
              <span class="count">8</span>
            </div>
            <div class="category-item">
              <UIcon dynamic name="i-heroicons-document-text" />
              <span>Contracts</span>
              <span class="count">3</span>
            </div>
            <div class="category-item">
              <UIcon dynamic name="i-heroicons-clipboard-document" />
              <span>Legal</span>
              <span class="count">5</span>
            </div>
            <div class="category-item">
              <UIcon dynamic name="i-heroicons-folder" />
              <span>Others</span>
              <span class="count">15</span>
            </div>
          </div>
        </div>

        <!-- Documents List -->
        <div class="documents-card">
          <div class="card-header">
            <h3>Recent Documents</h3>
            <div class="search-box">
              <UIcon dynamic name="i-heroicons-magnifying-glass" />
              <input type="text" placeholder="Search documents..." class="search-input">
            </div>
          </div>
          
          <div class="coming-soon">
            <UIcon dynamic name="i-heroicons-document-text" />
            <h3>Document Management Coming Soon</h3>
            <p>Comprehensive document management and organization features are currently under development.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'

// Guard: buyers don't currently have documents content
const { currentUser } = useAuth()
watchEffect(() => {
  if (import.meta.client && currentUser.value?.role === 'buyer') {
    navigateTo('/dashboard/overview', { replace: true })
  }
})

// SEO and meta tags
useSeoMeta({
  title: 'Documents - File & Document Management',
  description: 'Access and manage your invoices, reports, contracts, and important documents.',
  keywords: 'documents, invoices, reports, files, document management'
});

// Page layout (dashboard shell is provided by pages/dashboard.vue)
definePageMeta({
  layout: false
});
</script>

<style scoped>
.documents-page {
  min-height: 100vh;
  background: #ffffff;
  padding: 0;
  margin: 0;
  /* Account for sticky subnav - prevents content overlap */
  padding-top: var(--subnav-height);
}

.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.title-section p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
}

.documents-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.categories-card,
.documents-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.categories-list {
  padding: 1rem 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f8fafc;
}

.category-item.active {
  background: #eff6ff;
  border-right: 3px solid #3b82f6;
}

.category-item svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
}

.category-item.active svg {
  color: #3b82f6;
}

.category-item span:first-of-type {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.category-item.active span:first-of-type {
  color: #1e40af;
}

.count {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.category-item.active .count {
  background: #dbeafe;
  color: #1e40af;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  color: #64748b;
  width: 1rem;
  height: 1rem;
}

.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  width: 300px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.coming-soon {
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
}

.coming-soon svg {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.coming-soon h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #475569;
  margin: 0 0 0.5rem 0;
}

.coming-soon p {
  font-size: 1rem;
  margin: 0;
}

@media (max-width: 768px) {
  .documents-grid {
    grid-template-columns: 1fr;
  }
}
</style>
