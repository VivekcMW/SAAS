<template>
  <nav class="mob-nav" aria-label="Mobile navigation">
    <NuxtLink to="/" class="mob-nav__item" exact-active-class="mob-nav__item--active">
      <svg class="mob-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>Home</span>
    </NuxtLink>

    <NuxtLink to="/marketplace" class="mob-nav__item" active-class="mob-nav__item--active">
      <svg class="mob-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      <span>Browse</span>
    </NuxtLink>

    <NuxtLink to="/compare" class="mob-nav__item mob-nav__item--badge" active-class="mob-nav__item--active">
      <span v-if="compareCount > 0" class="mob-nav__badge">{{ compareCount }}</span>
      <svg class="mob-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 3H3v18h7M14 3h7v18h-7M14 3v18M10 3v18"/>
      </svg>
      <span>Compare</span>
    </NuxtLink>

    <NuxtLink to="/dashboard/stack" class="mob-nav__item" active-class="mob-nav__item--active">
      <svg class="mob-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <span>My Stack</span>
    </NuxtLink>

    <button class="mob-nav__item" @click="openAuth">
      <svg class="mob-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>{{ user ? 'Profile' : 'Sign in' }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
const { compareCount } = useCompare()
const { user } = useAuth()
const { openModal } = useGlobalAuth()

function openAuth() {
  if (user.value) {
    navigateTo('/dashboard')
  } else {
    openModal('login')
  }
}
</script>

<style scoped>
.mob-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 800;
  background: var(--mm-s1, #141921);
  border-top: 1px solid rgba(168, 181, 204, 0.1);
  padding: 0 0 env(safe-area-inset-bottom, 0);
  flex-direction: row;
  justify-content: stretch;
}

@media (max-width: 768px) {
  .mob-nav { display: flex; }
}

.mob-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 4px 8px;
  font-size: 0.62rem;
  font-weight: 500;
  color: var(--mm-slate, #68788F);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  position: relative;
  transition: color 0.15s;
  letter-spacing: 0.01em;
}

.mob-nav__item:hover,
.mob-nav__item--active {
  color: var(--mm-gold, #D4A843);
}

.mob-nav__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.mob-nav__badge {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(4px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--mm-gold, #D4A843);
  color: #07090F;
  font-size: 0.6rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
