<template>
  <div class="profile-page">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Profile Management</h1>
          <p>Manage your personal information and account preferences</p>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="profile-grid">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" alt="Profile" />
            </div>
            <div class="profile-info">
              <h3>John Doe</h3>
              <p>john.doe@example.com</p>
              <span class="plan-badge">Pro Plan</span>
            </div>
          </div>
          
          <div class="coming-soon">
            <UIcon dynamic name="i-heroicons-user-circle" />
            <h3>Profile Management Coming Soon</h3>
            <p>Enhanced profile management features are currently under development.</p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <UIcon dynamic name="i-heroicons-calendar" />
            </div>
            <div class="stat-info">
              <span class="stat-value">245</span>
              <span class="stat-label">Days Active</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <UIcon dynamic name="i-heroicons-squares-2x2" />
            </div>
            <div class="stat-info">
              <span class="stat-value">12</span>
              <span class="stat-label">Products</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <UIcon dynamic name="i-heroicons-star" />
            </div>
            <div class="stat-info">
              <span class="stat-value">4.8</span>
              <span class="stat-label">Avg Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO and meta tags
useSeoMeta({
  title: 'Profile Management - Personal Account Settings',
  description: 'Manage your personal information, preferences, and account settings.',
  keywords: 'profile, account settings, personal information, user preferences'
});

// Page layout
definePageMeta({
  layout: 'default'
});
</script>

<style scoped>
.profile-page {
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

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.profile-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.profile-header {
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.profile-info p {
  color: #64748b;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.plan-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
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
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
