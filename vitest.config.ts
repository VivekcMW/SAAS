import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'tests/bdd/**', 'tests/a11y/**'],
    alias: {
      '~': fileURLToPath(new URL('.', import.meta.url)),
      '#imports': fileURLToPath(new URL('./tests/unit/__mocks__/nuxt-imports.ts', import.meta.url))
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['server/utils/**', 'composables/**', 'utils/**'],
      exclude: ['**/*.test.ts', '**/*.mock.ts', 'tests/**']
    }
  }
})
