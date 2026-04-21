/**
 * Icon Plugin
 * Ensures proper icon component registration and resolves conflicts
 */
import { Icon as IconifyIcon } from '@iconify/vue';

export default defineNuxtPlugin({
  name: 'icon-fix',
  setup(nuxtApp) {
    // Register the Iconify Icon component as IconifyIcon to avoid conflicts
    nuxtApp.vueApp.component('IconifyIcon', IconifyIcon);
    
    // @nuxt/icon already registers Icon and NuxtIcon components
    // This plugin just ensures Iconify is available as a fallback
  }
});
