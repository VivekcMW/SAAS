/**
 * Global CSS Plugin
 * Ensures styles and icon components are available consistently
 */

export default defineNuxtPlugin((nuxtApp) => {
  // Ensure CSS variables are available in SSR and client
  const injectGlobalCSS = () => {
    if (process.client) {
      // Client-side specific CSS
      document.documentElement.classList.add('css-loaded');
    }
  };

  // Execute on both client and server
  nuxtApp.hook('app:rendered', injectGlobalCSS);
  
  // Also execute immediately for client-side
  if (process.client) {
    injectGlobalCSS();
  }
});
