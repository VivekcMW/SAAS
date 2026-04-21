import { defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  // Configuration for Nuxt Content module
  markdown: {
    toc: {
      depth: 5,
      searchDepth: 5
    },
    highlight: {
      theme: 'github-dark'
    }
  }
})
