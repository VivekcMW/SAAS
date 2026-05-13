/**
 * GET /BingSiteAuth.xml — Bing Webmaster Tools domain verification.
 *
 * Set the BING_SITE_AUTH environment variable to your Bing verification token.
 * Example: BING_SITE_AUTH=ABCDEF1234567890
 */
export default defineEventHandler((event) => {
  const token = process.env.BING_SITE_AUTH || ''

  const xml = `<?xml version="1.0"?>
<users>
  <user>${token}</user>
</users>`

  setResponseHeader(event, 'Content-Type', 'text/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  return xml
})
