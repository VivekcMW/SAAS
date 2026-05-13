<template>
  <!-- Loading screen while auth initializes (prevents empty-page flash on hard refresh) -->
  <div v-if="!initialized" class="dash-init-loading">
    <div class="dash-init-loading__spinner" />
  </div>

  <div v-else class="dash-shell" :class="{ 'is-sidebar-collapsed': sidebarCollapsed }">
    <DashSidebar
      :role="currentUser?.role ?? null"
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="dash-shell__main">
      <DashTopbar :user="currentUser" @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" @logout="onLogout" />
      <main class="dash-shell__content">
        <NuxtPage :key="$route.path" />
      </main>
    </div>

    <!-- Global admin toast -->
    <Transition name="aw-toast-slide">
      <div v-if="adminToast" class="aw-toast" :class="`aw-toast--${adminToast.type}`" role="status" aria-live="polite">
        {{ adminToast.msg }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

definePageMeta({ layout: false })

useHead({
  title: 'Dashboard — Moonmart',
  meta: [{ name: 'description', content: 'Manage your apps, enquiries, and analytics on Moonmart.' }]
})

const { isAuthenticated, currentUser, isLoading, initialized, handleLogout } = useAuth()
const { adminToast } = useAdminData()
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

.dash-init-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bw-bg, #FAFAF7);
}
.dash-init-loading__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bw-border, #E5E3DC);
  border-top-color: var(--mm-gold, #D4A843);
  border-radius: 50%;
  animation: dash-spin 0.7s linear infinite;
}
@keyframes dash-spin {
  to { transform: rotate(360deg); }
}

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

/* Admin toast */
.aw-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9000;
  padding: 12px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15); pointer-events: none;
}
.aw-toast--success { background: var(--bw-surface, #fff); border: 1.5px solid #bbf7d0; color: #047857; }
.aw-toast--error   { background: var(--bw-surface, #fff); border: 1.5px solid #fecaca; color: #b91c1c; }
.aw-toast-slide-enter-active, .aw-toast-slide-leave-active { transition: all 0.2s ease; }
.aw-toast-slide-enter-from, .aw-toast-slide-leave-to { opacity: 0; transform: translateY(8px); }
</style>
