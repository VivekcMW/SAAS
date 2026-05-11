<template>
  <Teleport to="body">
    <Transition name="cbar">
      <div v-if="compareCount >= 1" class="cbar" role="region" aria-label="Compare tray">
        <div class="cbar__inner">
          <!-- Slots for selected apps -->
          <div class="cbar__slots">
            <div
              v-for="id in compareIds"
              :key="id"
              class="cbar__slot cbar__slot--filled"
            >
              <div class="cbar__slot-app">
                <div class="cbar__slot-avatar">
                  <img
                    v-if="appNames[id]?.logo"
                    :src="appNames[id].logo"
                    :alt="appNames[id].name"
                    @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                  />
                  <span v-else>{{ (appNames[id]?.name || id).charAt(0) }}</span>
                </div>
                <span class="cbar__slot-name">{{ appNames[id]?.name || '…' }}</span>
              </div>
              <button class="cbar__slot-remove" @click="removeFromCompare(id)" :aria-label="`Remove ${appNames[id]?.name || id}`">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Empty placeholders up to 4 -->
            <NuxtLink
              v-for="i in emptySlots"
              :key="`empty-${i}`"
              to="/marketplace"
              class="cbar__slot cbar__slot--empty"
              title="Browse marketplace to add an app"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              <span>Add app</span>
            </NuxtLink>
          </div>

          <div class="cbar__actions">
            <span class="cbar__count">{{ compareCount }}/4 selected</span>
            <button class="cbar__clear" @click="clearCompare">Clear</button>
            <NuxtLink to="/compare" class="cbar__compare" :class="{ disabled: !canCompare }">
              Compare now
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useCompare } from '~/composables/useCompare'

const { compareIds, compareCount, canCompare, removeFromCompare, clearCompare } = useCompare()

const emptySlots = computed(() => Math.max(0, 4 - compareCount.value))

// Resolve app names/logos lazily for display
const appNames = reactive<Record<string, { name: string; logo?: string }>>({})

watch(compareIds, async (ids) => {
  for (const id of ids) {
    if (appNames[id]) continue
    try {
      const data = await $fetch<{ name: string; logo: string }>(`/api/apps/${id}`)
      appNames[id] = { name: data.name, logo: data.logo }
    } catch {
      appNames[id] = { name: id }
    }
  }
}, { immediate: true })
</script>

<style scoped>
.cbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 900;
  background: rgba(20, 25, 33, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(212, 168, 67, 0.25);
  box-shadow: 0 -8px 32px rgba(0,0,0,.6);
}

.cbar__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px clamp(1rem, 3vw, 2rem);
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* Slots */
.cbar__slots {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}
.cbar__slot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  position: relative;
}
.cbar__slot--filled {
  background: rgba(212, 168, 67, 0.1);
  border: 1px solid rgba(212, 168, 67, 0.25);
  color: var(--mm-pearl, #E2E8F0);
}
.cbar__slot--empty {
  background: rgba(168, 180, 204, 0.05);
  border: 1px dashed rgba(168, 180, 204, 0.15);
  color: var(--mm-slate, #68788F);
  gap: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.cbar__slot--empty:hover {
  background: rgba(212, 168, 67, 0.08);
  border-color: rgba(212, 168, 67, 0.3);
  color: var(--mm-gold, #D4A843);
}
.cbar__slot-app {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cbar__slot-avatar {
  width: 26px; height: 26px; border-radius: 6px;
  overflow: hidden;
  background: var(--mm-s2, #1F2742);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: var(--mm-gold, #D4A843);
  flex-shrink: 0;
}
.cbar__slot-avatar img { width: 100%; height: 100%; object-fit: contain; }
.cbar__slot-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cbar__slot-remove {
  background: none; border: none; cursor: pointer;
  color: var(--mm-silver, #A8B5CC);
  padding: 2px; border-radius: 4px;
  transition: color .15s, background .15s;
  flex-shrink: 0;
}
.cbar__slot-remove:hover { color: #f87171; background: rgba(239,68,68,.1); }

/* Actions */
.cbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.cbar__count {
  font-size: 0.78rem;
  color: var(--mm-silver, #A8B5CC);
  white-space: nowrap;
}
.cbar__clear {
  background: none; border: none; cursor: pointer;
  font-size: 0.82rem;
  color: var(--mm-slate, #68788F);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color .15s;
}
.cbar__clear:hover { color: #f87171; }
.cbar__compare {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  background: var(--mm-gold, #D4A843);
  color: var(--mm-bg, #07090F);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition: background .15s, opacity .15s;
  white-space: nowrap;
}
.cbar__compare:hover { background: #c49a30; }
.cbar__compare.disabled {
  opacity: .45;
  pointer-events: none;
}

/* Transition */
.cbar-enter-active, .cbar-leave-active { transition: transform .25s ease, opacity .25s ease; }
.cbar-enter-from, .cbar-leave-to { transform: translateY(100%); opacity: 0; }

@media (max-width: 600px) {
  .cbar__inner { gap: 12px; }
  .cbar__slots { gap: 6px; }
  .cbar__slot--empty { display: none; }
  .cbar__slot-name { max-width: 70px; }
}
</style>
