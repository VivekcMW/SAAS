<template>
  <section class="vendor-cta-section">
    <div class="container">
      <div class="vendor-cta-band">
        <div class="vendor-cta-text">
          <h2>Built a SaaS? Get found by buyers ready to buy.</h2>
          <p>List your app in 2 minutes. Free forever for the core listing. Pay only when you want to stand out.</p>
        </div>
        <div class="vendor-cta-actions">
          <NuxtLink to="/list-app" class="btn-primary-cta">
            List your app
            <UIcon name="i-heroicons-arrow-right" dynamic />
          </NuxtLink>
          <NuxtLink to="/pricing" class="btn-secondary-cta">How it works</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.vendor-cta-section {
  padding: var(--spacing-xxl) 0;
  background: var(--bg-gray);
}

.vendor-cta-band {
  background: var(--sw-primary);
  border-radius: 20px;
  padding: var(--spacing-xxl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xl);
  color: #fff;
  box-shadow: 0 10px 30px rgba(255, 136, 56, 0.25);
}

.vendor-cta-text h2 {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
  color: #fff;
}

.vendor-cta-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  max-width: 640px;
}

.vendor-cta-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-primary-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: var(--sw-primary);
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s, box-shadow 0.2s;
}

.btn-primary-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.btn-secondary-cta {
  display: inline-flex;
  align-items: center;
  padding: 14px 24px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-secondary-cta:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #fff;
}

@media (max-width: 768px) {
  .vendor-cta-band {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--spacing-xl);
    border-radius: 16px;
  }
  .vendor-cta-text h2 { font-size: 1.375rem; }
  .vendor-cta-actions { width: 100%; flex-direction: column; }
  .btn-primary-cta, .btn-secondary-cta { justify-content: center; width: 100%; }
}
</style>
