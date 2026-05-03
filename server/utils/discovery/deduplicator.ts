/**
 * Deduplicator — normalises a raw URL to a root domain and checks whether
 * it already exists in discovery_queue OR app_listings.
 *
 * Returns 'new' | 'duplicate'
 */
import { getDb } from '~/server/utils/database'

/** Strip protocol, www, trailing slashes, and paths → root domain. */
export function normaliseDomain(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    return url.hostname.replace(/^www\./, '').toLowerCase()
  }
  catch {
    return rawUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase()
  }
}

export function isDuplicate(rawUrl: string): boolean {
  const domain = normaliseDomain(rawUrl)
  if (!domain) return false

  const db = getDb()

  const inQueue = db.prepare(
    `SELECT id FROM discovery_queue WHERE website_url LIKE ? LIMIT 1`
  ).get(`%${domain}%`)

  if (inQueue) return true

  const inListings = db.prepare(
    `SELECT id FROM app_listings WHERE website_url LIKE ? LIMIT 1`
  ).get(`%${domain}%`)

  return Boolean(inListings)
}

/**
 * Filter an array of URLs, returning only those not already known.
 * Also deduplicates within the batch itself (same domain → keep first).
 */
export function filterNew(urls: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const url of urls) {
    const domain = normaliseDomain(url)
    if (!domain || seen.has(domain)) continue
    seen.add(domain)
    if (!isDuplicate(url)) {
      result.push(url)
    }
  }

  return result
}
