export default defineNuxtPlugin(() => {
  // Client-side icon setup
  if (import.meta.client) {
    // Register icon collections for client-side hydration
    console.log('Icon plugin loaded on client')
  }
})
