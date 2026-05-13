/**
 * GET /[indexnow-key].txt
 * Serves the IndexNow key verification file.
 * The key must match INDEXNOW_KEY env var and be accessible at the root.
 */
export default defineEventHandler((event) => {
  const key = process.env.INDEXNOW_KEY || 'moonmart-indexnow-key-2026'
  setResponseHeader(event, 'Content-Type', 'text/plain')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  return key
})
