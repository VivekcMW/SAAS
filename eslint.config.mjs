// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Ignore generated BDD test files
  {
    ignores: [
      '.features-gen/**',
      'bdd-gen/**',
    ],
  },
  // Override no-unused-vars to allow _-prefixed catch errors and variables
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Downgrade to warn: many intentional any usages exist for Nuxt $fetch errors,
      // DB query results, and external API responses. Proper typing is a separate task.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Apply plain no-unused-vars for .js script files
  {
    files: ['scripts/**/*.js', 'seed_demo_apps.js', 'check-mkt3.cjs'],
    rules: {
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
      }],
    },
  },
)
