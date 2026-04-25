<template>
  <div class="reviews-page">
    <div class="reviews-content">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <h1>Customer Reviews & Sentiment Analysis</h1>
          <p class="page-subtitle">Monitor customer feedback and analyze global sentiment trends</p>
        </div>

        <!-- Reviews Component -->
        <DashboardReviews />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO and meta tags
useSeoMeta({
  title: 'Reviews - Customer Feedback & Sentiment Analysis',
  description: 'Monitor customer reviews, feedback, and global sentiment analysis for your products and services.',
  keywords: 'reviews, customer feedback, sentiment analysis, product reviews, user experience'
});

// Page layout
definePageMeta({
  layout: 'default'
});
</script>

<style scoped>
.reviews-page {
  min-height: 100vh;
  background-color: var(--bg-light);
}

.reviews-content {
  padding: var(--spacing-xl) 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--mm-pearl);
  margin: 0 0 var(--spacing-sm) 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .reviews-content {
    padding: var(--spacing-lg) 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
}
</style>
