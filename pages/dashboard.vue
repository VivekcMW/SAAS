<template>
  <div class="dash-shell" :class="{ 'is-sidebar-collapsed': sidebarCollapsed }">
    <DashSidebar
      :role="currentUser?.role ?? null"
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="dash-shell__main">
      <DashTopbar :user="currentUser" @toggleSidebar="sidebarCollapsed = !sidebarCollapsed" @logout="onLogout" />
      <main class="dash-shell__content">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

definePageMeta({ layout: false })

useHead({
  title: 'Dashboard — SaaSWorld',
  meta: [{ name: 'description', content: 'Manage your apps, enquiries, and analytics on SaaSWorld.' }]
})

const { isAuthenticated, currentUser, isLoading, initialized, handleLogout } = useAuth()
const route = useRoute()

// Guard: redirect unauthenticated users to /login with redirect back here
watchEffect(() => {
  if (!import.meta.client) return
  if (!initialized.value) return
  if (isLoading.value) return
  if (!isAuthenticated.value) {
    navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  // Redirect bare /dashboard → /dashboard/overview
  if (route.path === '/dashboard' || route.path === '/dashboard/') {
    navigateTo('/dashboard/overview', { replace: true })
  }
})

const sidebarCollapsed = ref(false)

const onLogout = async () => {
  await handleLogout()
  await navigateTo('/login')
}
</script>

<style scoped>
.dash-shell {
  min-height: 100vh;
  background: var(--bw-bg, #FAFAF7);
}

.dash-shell__main {
  min-height: 100vh;
  margin-left: 248px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.2s ease;
}
.dash-shell.is-sidebar-collapsed .dash-shell__main { margin-left: 68px; }

.dash-shell__content {
  flex: 1;
  padding: 24px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .dash-shell__main { margin-left: 0 !important; }
  .dash-shell__content { padding: 16px; }
}
</style>
