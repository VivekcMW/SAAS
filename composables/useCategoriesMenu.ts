import { ref, readonly } from 'vue'

/**
 * Global state for categories menu
 * Shared across all components
 */
const isCategoriesDrawerOpen = ref(false)

/**
 * Global composable for categories menu state management
 * Allows cross-component communication between hero section and navbar
 */
export const useCategoriesMenu = () => {
  // Function to open the categories drawer
  const openCategoriesDrawer = () => {
    console.log('openCategoriesDrawer called - setting to true');
    isCategoriesDrawerOpen.value = true
    console.log('isCategoriesDrawerOpen.value:', isCategoriesDrawerOpen.value);
  }

  // Function to close the categories drawer
  const closeCategoriesDrawer = () => {
    isCategoriesDrawerOpen.value = false
  }

  // Function to toggle the categories drawer
  const toggleCategoriesDrawer = () => {
    isCategoriesDrawerOpen.value = !isCategoriesDrawerOpen.value
  }

  return {
    isCategoriesDrawerOpen: readonly(isCategoriesDrawerOpen),
    openCategoriesDrawer,
    closeCategoriesDrawer,
    toggleCategoriesDrawer
  }
}
