<!-- Moonmart Logo — orbital mark (matches design system v1.0) -->
<template>
  <!-- ── NAV / COMPACT variant (3 rings + 4 cardinal gold dots) ── -->
  <svg
    v-if="variant === 'nav'"
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Moonmart logo"
    role="img"
  >
    <circle cx="50" cy="50" r="36" fill="none" stroke="#2A9D8F" stroke-width="1.8" opacity=".5" />
    <circle cx="50" cy="50" r="24" fill="none" stroke="#4A80D4" stroke-width="2.2" opacity=".62" />
    <circle cx="50" cy="50" r="13" fill="none" stroke="#D4A843" stroke-width="3.5" opacity=".9" />
    <circle cx="50" cy="50" r="7"  fill="#D4A843" />
    <circle cx="50" cy="37" r="3.5" fill="#EEC563" />
    <circle cx="63" cy="50" r="3.5" fill="#EEC563" />
    <circle cx="50" cy="63" r="3.5" fill="#EEC563" />
    <circle cx="37" cy="50" r="3.5" fill="#EEC563" />
  </svg>

  <!-- ── FULL / HERO variant (3 rings + 16 dots, animated) ── -->
  <svg
    v-else
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="animated ? 'Moonmart animated logo' : 'Moonmart logo'"
    role="img"
  >
    <circle cx="50" cy="50" r="46" fill="none" stroke="#2A9D8F" stroke-width=".4"
      :class="animated ? 'mm-r3' : ''" style="opacity:.2" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="#2A9D8F" stroke-width=".9"
      :class="animated ? 'mm-r3' : ''" style="opacity:.45" />
    <circle cx="50" cy="50" r="28" fill="none" stroke="#4A80D4" stroke-width="1.2"
      :class="animated ? 'mm-r2' : ''" style="opacity:.65" />
    <circle cx="50" cy="50" r="18" fill="none" stroke="#D4A843" stroke-width="1.8"
      :class="animated ? 'mm-r1' : ''" style="opacity:.9" />
    <circle cx="50" cy="50" r="7"   fill="#D4A843" />
    <circle cx="50" cy="50" r="3.5" fill="#EEC563" />
    <circle cx="50" cy="32" r="3"   fill="#EEC563" :class="animated ? 'mm-d1' : ''" />
    <circle cx="68" cy="50" r="3"   fill="#EEC563" :class="animated ? 'mm-d2' : ''" />
    <circle cx="50" cy="68" r="3"   fill="#EEC563" :class="animated ? 'mm-d3' : ''" />
    <circle cx="32" cy="50" r="3"   fill="#EEC563" :class="animated ? 'mm-d4' : ''" />
    <circle cx="70" cy="30" r="2.5" fill="#6A9FE8" :class="animated ? 'mm-d2' : ''" />
    <circle cx="70" cy="70" r="2.5" fill="#6A9FE8" :class="animated ? 'mm-d3' : ''" />
    <circle cx="30" cy="70" r="2.5" fill="#6A9FE8" :class="animated ? 'mm-d4' : ''" />
    <circle cx="30" cy="30" r="2.5" fill="#6A9FE8" :class="animated ? 'mm-d1' : ''" />
    <circle cx="50" cy="12" r="2"   fill="#36B8A8" :class="animated ? 'mm-d3' : ''" />
    <circle cx="83" cy="31" r="2"   fill="#36B8A8" :class="animated ? 'mm-d1' : ''" />
    <circle cx="83" cy="69" r="2"   fill="#36B8A8" :class="animated ? 'mm-d4' : ''" />
    <circle cx="50" cy="88" r="2"   fill="#36B8A8" :class="animated ? 'mm-d2' : ''" />
    <circle cx="17" cy="69" r="2"   fill="#36B8A8" :class="animated ? 'mm-d1' : ''" />
    <circle cx="17" cy="31" r="2"   fill="#36B8A8" :class="animated ? 'mm-d3' : ''" />
  </svg>
</template>

<script setup lang="ts">
defineOptions({ name: 'MoonmartLogo' })

withDefaults(defineProps<{
  size?: string | number
  animated?: boolean
  /** 'nav' = compact 3-ring + 4 dots (navbar/footer use)
   *  'full' = complete orbital with 16 dots (hero/splash use) */
  variant?: 'nav' | 'full'
}>(), {
  size: '100%',
  animated: false,
  variant: 'nav'
})
</script>

<style>
/* Logo pulse animations — scoped to .mm-* classes, globally safe */
@keyframes mm-ring-breathe { 0%,100%{opacity:.5} 50%{opacity:.92} }
@keyframes mm-dot-pulse    { 0%,100%{opacity:.7} 50%{opacity:1}    }

.mm-r1 { animation: mm-ring-breathe 3s ease-in-out infinite 0s   }
.mm-r2 { animation: mm-ring-breathe 3s ease-in-out infinite .5s  }
.mm-r3 { animation: mm-ring-breathe 3s ease-in-out infinite 1s   }
.mm-d1 { animation: mm-dot-pulse    2.5s ease-in-out infinite 0s   }
.mm-d2 { animation: mm-dot-pulse    2.5s ease-in-out infinite .3s  }
.mm-d3 { animation: mm-dot-pulse    2.5s ease-in-out infinite .6s  }
.mm-d4 { animation: mm-dot-pulse    2.5s ease-in-out infinite .9s  }
</style>
