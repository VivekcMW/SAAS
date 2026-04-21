<template>
  <div class="user-management-page">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>User Management</h1>
          <p>Manage users, roles, and permissions across your organization</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary">
            <UIcon dynamic name="i-heroicons-plus" />
            Add User
          </button>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="users-table">
        <div class="table-header">
          <h3>Team Members</h3>
          <div class="search-box">
            <UIcon dynamic name="i-heroicons-magnifying-glass" />
            <input type="text" placeholder="Search users..." class="search-input">
          </div>
        </div>
        
        <div class="coming-soon">
          <UIcon dynamic name="i-heroicons-users" />
          <h3>User Management Coming Soon</h3>
          <p>This feature is currently under development and will be available in the next update.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO and meta tags
useSeoMeta({
  title: 'User Management - Team & Role Administration',
  description: 'Manage team members, user roles, and permissions for your organization.',
  keywords: 'user management, team administration, roles, permissions'
});

// Page layout
definePageMeta({
  layout: 'default'
});
</script>

<style scoped>
.user-management-page {
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

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
}

.users-table {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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
</style>
