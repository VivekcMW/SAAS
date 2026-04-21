export default defineNuxtPlugin(() => {
  // Client-side icon setup
  if (process.client) {
    // Register icon collections for client-side hydration
    console.log('Icon plugin loaded on client')
  }
})
