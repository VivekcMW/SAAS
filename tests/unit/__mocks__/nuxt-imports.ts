// Stub for Nuxt auto-imports used in composables
// vitest resolves #imports to this file via alias

export const ref = (await import('vue')).ref
export const computed = (await import('vue')).computed
export const reactive = (await import('vue')).reactive
export const readonly = (await import('vue')).readonly
export const watch = (await import('vue')).watch
export const useRoute = () => ({ params: {}, query: {} })
export const useRouter = () => ({ push: () => {}, replace: () => {} })
export const useFetch = () => ({ data: ref(null), pending: ref(false), error: ref(null) })
export const useHead = () => {}
export const navigateTo = () => {}
export const defineEventHandler = (fn: unknown) => fn
export const getQuery = () => ({})
export const readBody = async () => ({})
export const createError = (opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage)
  ;(err as NodeJS.ErrnoException).code = String(opts.statusCode)
  return err
}
