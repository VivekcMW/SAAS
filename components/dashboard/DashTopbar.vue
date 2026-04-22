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

    <div class="dash-topbar__search">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input
        v-model="q"
        type="text"
        placeholder="Search your workspace…"
        aria-label="Search dashboard"
      />
      <kbd class="dash-topbar__kbd">⌘K</kbd>
    </div>

    <div class="dash-topbar__right">
      <button type="button" class="dash-topbar__icon-btn" title="Notifications" aria-label="Notifications">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="dash-topbar__badge-dot" aria-hidden="true" />
      </button>

      <div class="dash-topbar__user">
        <div class="dash-topbar__avatar">{{ initials }}</div>
        <div class="dash-topbar__user-meta">
          <span class="dash-topbar__user-name">{{ user?.firstName || 'User' }}</span>
          <span class="dash-topbar__user-role">{{ roleLabel }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  user: { firstName?: string; lastName?: string; role?: string; avatar?: string | null } | null
}>()

defineEmits<{ (e: 'toggleSidebar'): void }>()

const q = ref('')

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
</script>

<style scoped>
.dash-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-bottom: 1px solid #f0efec;
  padding: 10px 24px;
  min-height: 64px;
}
.dash-topbar__menu {
  display: none;
  background: transparent;
  border: 0;
  padding: 8px;
  border-radius: 8px;
  color: #52525b;
  cursor: pointer;
}
.dash-topbar__menu:hover { background: #fbfaf8; }

.dash-topbar__search {
  flex: 1;
  max-width: 520px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fbfaf8;
  border: 1px solid #f0efec;
  border-radius: 10px;
  color: #71717a;
  transition: all 0.15s ease;
}
.dash-topbar__search:focus-within {
  background: #fff;
  border-color: var(--sw-primary, #ff8838);
  box-shadow: 0 0 0 3px rgba(255, 136, 56, 0.1);
}
.dash-topbar__search input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  color: #1e1e1e;
  min-width: 0;
}
.dash-topbar__search input::placeholder { color: #a1a1aa; }
.dash-topbar__kbd {
  font-family: var(--font-mono, ui-monospace, SF Mono, monospace);
  font-size: 0.7rem;
  color: #71717a;
  background: #fff;
  border: 1px solid #e4e0dc;
  border-radius: 4px;
  padding: 2px 6px;
}

.dash-topbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.dash-topbar__icon-btn {
  position: relative;
  background: transparent;
  border: 1px solid transparent;
  padding: 8px;
  border-radius: 8px;
  color: #52525b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.dash-topbar__icon-btn:hover { background: #fbfaf8; border-color: #f0efec; color: #1e1e1e; }
.dash-topbar__badge-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--sw-primary, #ff8838);
  border: 2px solid #fff;
}

.dash-topbar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  background: #fbfaf8;
  border: 1px solid #f0efec;
}
.dash-topbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--sw-primary-soft, #fff1e6);
  color: var(--sw-primary, #ff8838);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.82rem;
}
.dash-topbar__user-meta { display: flex; flex-direction: column; line-height: 1.15; }
.dash-topbar__user-name { font-size: 0.85rem; font-weight: 600; color: #1e1e1e; }
.dash-topbar__user-role { font-size: 0.72rem; color: #71717a; }

@media (max-width: 900px) {
  .dash-topbar { padding: 10px 16px; }
  .dash-topbar__menu { display: inline-flex; }
  .dash-topbar__kbd { display: none; }
  .dash-topbar__user-meta { display: none; }
}
</style>
