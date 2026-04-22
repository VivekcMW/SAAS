<template>
  <div class="list-product-page">
    <div class="page-hero">
      <div class="container">
        <h1>List your product on SaaSWorld</h1>
        <p>Answer a few quick questions and you're live in under 2 minutes.</p>
        <div class="hero-pills">
          <span class="hero-pill"><Icon name="heroicons:bolt" /> No account required</span>
          <span class="hero-pill"><Icon name="heroicons:lock-closed" /> Edit anytime</span>
          <span class="hero-pill"><Icon name="heroicons:eye" /> Free listing</span>
        </div>
      </div>
    </div>

    <div class="container">
      <ChatOnboarding />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatOnboarding from '~/components/onboarding/ChatOnboarding.vue';

useHead({
  title: 'List Your Product - SaaSWorld Marketplace',
  meta: [
    {
      name: 'description',
      content: 'List your SaaS product on SaaSWorld in under 2 minutes with our chat-based onboarding. Paste a URL or answer a few questions and your listing goes live instantly.'
    },
    { name: 'keywords', content: 'list product, saas marketplace, submit application, product listing, saas directory' },
    { property: 'og:title', content: 'List Your Product - SaaSWorld Marketplace' },
    { property: 'og:description', content: 'Get your SaaS product in front of thousands of customers in under 2 minutes.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://saasworld.club/list-product' }
  ]
});
</script>

<style scoped>
.list-product-page {
  width: 100%;
  background: #fafafa;
  min-height: 100vh;
}

.page-hero {
  background: #ffffff;
  border-bottom: 0.5px solid #e5e7eb;
  padding: 40px 0 32px;
  text-align: center;
}

.page-hero h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.page-hero p {
  margin: 0 0 16px;
  font-size: 1rem;
  color: #6b7280;
}

.hero-pills {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f9fafb;
  border: 0.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.hero-pill :deep(svg) {
  width: 12px;
  height: 12px;
  color: #ff8838;
}

.container {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 600px) {
  .page-hero { padding: 28px 0 22px; }
  .page-hero h1 { font-size: 1.5rem; }
  .page-hero p { font-size: 0.95rem; }
}
</style>
