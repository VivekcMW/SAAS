<template>
  <header class="dash-topbar">
    <button
      type="button"
      class="dash-topbar__menu"
      aria-label="Toggle sidebar"
      @click="$emit('toggleSidebar')"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>

    <div class="dash-topbar__right">
      <!-- Notifications -->
      <button type="button" class="dash-topbar__icon-btn" title="Notifications" aria-label="Notifications">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="dash-topbar__badge-dot" aria-hidden="true" />
      </button>

      <!-- User profile CTA with dropdown -->
      <div ref="profileRef" class="dash-topbar__profile-wrap">
        <button
          type="button"
          class="dash-topbar__user"
          :class="{ 'is-open': open }"
          :aria-expanded="open"
          aria-haspopup="true"
          @click="open = !open"
        >
          <div class="dash-topbar__avatar">{{ initials }}</div>
          <div class="dash-topbar__user-meta">
            <span class="dash-topbar__user-name">{{ user?.firstName || 'User' }}</span>
            <span class="dash-topbar__user-role">{{ roleLabel }}</span>
          </div>
          <span class="dash-topbar__chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'" />
            </svg>
          </span>
        </button>

        <!-- Dropdown -->
        <transition name="topbar-drop">
          <div v-if="open" class="dash-topbar__dropdown" role="menu">
            <!-- User info header -->
            <div class="dash-topbar__drop-head">
              <div class="dash-topbar__drop-avatar">{{ initials }}</div>
              <div class="dash-topbar__drop-meta">
                <span class="dash-topbar__drop-name">{{ user?.fullName || user?.firstName || 'User' }}</span>
                <span class="dash-topbar__drop-email">{{ user?.email }}</span>
              </div>
            </div>

            <div class="dash-topbar__drop-divider" />

            <!-- Profile -->
            <NuxtLink to="/dashboard/profile" class="dash-topbar__drop-item" role="menuitem" @click="open = false">
              <span class="dash-topbar__drop-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              Profile
            </NuxtLink>

            <!-- System section (admin only) -->
            <template v-if="user?.role === 'admin'">
              <div class="dash-topbar__drop-divider" />
              <div class="dash-topbar__drop-section">System</div>
              <NuxtLink to="/dashboard/activity" class="dash-topbar__drop-item" role="menuitem" @click="open = false">
                <span class="dash-topbar__drop-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </span>
                Activity log
              </NuxtLink>
              <NuxtLink to="/dashboard/settings" class="dash-topbar__drop-item" role="menuitem" @click="open = false">
                <span class="dash-topbar__drop-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </span>
                Settings
              </NuxtLink>
            </template>

            <div class="dash-topbar__drop-divider" />

            <!-- Sign out -->
            <button type="button" class="dash-topbar__drop-item dash-topbar__drop-signout" role="menuitem" @click="onSignOut">
              <span class="dash-topbar__drop-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
              </span>
              Sign out
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  user: { firstName?: string; lastName?: string; fullName?: string; email?: string; role?: string; avatar?: string | null } | null
}>()

const emit = defineEmits<{
  (e: 'toggleSidebar' | 'logout'): void
}>()

const open = ref(false)
const profileRef = ref<HTMLElement | null>(null)

const initials = computed(() => {
  const f = props.user?.firstName?.[0] || ''
  const l = props.user?.lastName?.[0] || ''
  return (f + l).toUpperCase() || 'U'
})

const roleLabel = computed(() => {
  const r = props.user?.role
  if (r === 'vendor') return 'Vendor'
  if (r === 'admin') return 'Admin'
  if (r === 'buyer') return 'Buyer'
  return ''
})

function onSignOut() {
  open.value = false
  emit('logout')
}

function onClickOutside(e: MouseEvent) {
  if (profileRef.value && !profileRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.dash-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--mm-s1);
  border-bottom: 0.5px solid var(--b1);
  padding: 0 20px;
  min-height: 52px;
}

.dash-topbar__menu {
  display: none;
  background: transparent;
  border: 0;
  padding: 8px;
  border-radius: var(--r-sm);
  color: var(--mm-slate);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.dash-topbar__menu:hover { background: var(--mm-s3); color: var(--mm-pearl); }

.dash-topbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.dash-topbar__icon-btn {
  position: relative;
  background: transparent;
  border: 0.5px solid transparent;
  padding: 8px;
  border-radius: var(--r-sm);
  color: var(--mm-slate);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.dash-topbar__icon-btn:hover {
  background: var(--mm-s3);
  border-color: var(--b1);
  color: var(--mm-pearl);
}

.dash-topbar__badge-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mm-gold);
  border: 2px solid var(--mm-s1);
}

/* Profile CTA wrap */
.dash-topbar__profile-wrap { position: relative; }

.dash-topbar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: var(--r-full);
  background: var(--mm-s3);
  border: 0.5px solid var(--b1);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  font-family: inherit;
}
.dash-topbar__user:hover,
.dash-topbar__user.is-open {
  background: var(--mm-s2);
  border-color: var(--b2);
}

.dash-topbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.82rem;
  flex-shrink: 0;
}

.dash-topbar__user-meta { display: flex; flex-direction: column; line-height: 1.15; }
.dash-topbar__user-name { font-size: 0.85rem; font-weight: 600; color: var(--mm-pearl); }
.dash-topbar__user-role { font-size: 0.72rem; color: var(--mm-slate); }
.dash-topbar__chevron { color: var(--mm-slate); display: flex; align-items: center; }

/* Dropdown */
.dash-topbar__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: var(--mm-s1);
  border: 0.5px solid var(--b2);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
}

.dash-topbar__drop-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.dash-topbar__drop-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--mm-gold-soft);
  color: var(--mm-gold);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.88rem;
  flex-shrink: 0;
}

.dash-topbar__drop-meta { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
.dash-topbar__drop-name { font-size: 0.88rem; font-weight: 600; color: var(--mm-pearl); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dash-topbar__drop-email { font-size: 0.75rem; color: var(--mm-slate); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.dash-topbar__drop-divider { height: 0.5px; background: var(--b1); margin: 4px 0; }

.dash-topbar__drop-section {
  padding: 6px 14px 2px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mm-slate);
}

.dash-topbar__drop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--mm-silver);
  background: transparent;
  border: 0;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.dash-topbar__drop-item:hover { background: var(--mm-s3); color: var(--mm-pearl); }

.dash-topbar__drop-icon {
  width: 18px;
  height: 18px;
  color: var(--mm-slate);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dash-topbar__drop-item:hover .dash-topbar__drop-icon { color: var(--mm-silver); }

.dash-topbar__drop-signout { color: var(--mm-slate); }
.dash-topbar__drop-signout:hover { background: rgba(248,113,113,0.08); color: #f87171; }
.dash-topbar__drop-signout:hover .dash-topbar__drop-icon { color: #f87171; }

/* Transition */
.topbar-drop-enter-active,
.topbar-drop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.topbar-drop-enter-from,
.topbar-drop-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 900px) {
  .dash-topbar { padding: 10px 16px; }
  .dash-topbar__menu { display: inline-flex; }
  .dash-topbar__user-meta { display: none; }
  .dash-topbar__chevron { display: none; }
}
</style>
