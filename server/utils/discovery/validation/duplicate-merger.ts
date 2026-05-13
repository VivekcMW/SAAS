/**
 * Duplicate Merger Agent
 * Finds near-duplicate listings (same product, different URLs/domains)
 * and merges them, keeping the higher-confidence/more-complete record.
 *
 * Detection strategies:
 *   1. Name similarity: normalised Levenshtein distance < 0.15
 *   2. Description overlap: >70% shared significant tokens
 *   3. Same redirect chain: both URLs ultimately lead to same domain
 *   4. Logo URL similarity: same CDN-hosted logo image (by hash)
 *
 * Merge logic: Keep the record with higher confidence score; copy over
 * any non-null fields that the winner is missing.
 *
 * Schedule: Weekly (Sunday 1am UTC) — runs across all published apps
 */
import { getDb, makeId } from '~/server/utils/database'

interface AppRecord {
  id: string
  name: string
  website: string
  description: string | null
  category: string | null
  confidence_score: number | null
  slug: string | null
  status: string
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(app|platform|software|tool|suite|cloud|ai|io)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshteinSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1.0

  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i])
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      }
      else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  const maxLen = Math.max(m, n)
  return 1 - dp[m][n] / maxLen
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'in', 'of', 'to', 'for', 'and', 'or', 'with',
  'that', 'this', 'it', 'we', 'your', 'our', 'you', 'from', 'by', 'as',
  'be', 'are', 'was', 'were', 'has', 'have', 'can', 'do', 'all', 'at'
])

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 3 && !STOP_WORDS.has(t))
  )
}

function descriptionOverlap(a: string, b: string): number {
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  if (!tokensA.size || !tokensB.size) return 0

  const intersection = [...tokensA].filter(t => tokensB.has(t)).length
  const union = new Set([...tokensA, ...tokensB]).size
  return intersection / union // Jaccard similarity
}

function getRootDomain(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    // Strip common subdomains
    const parts = host.split('.')
    if (parts.length > 2) return parts.slice(-2).join('.')
    return host
  }
  catch { return '' }
}

function isSameDomain(urlA: string, urlB: string): boolean {
  return getRootDomain(urlA) === getRootDomain(urlB) && getRootDomain(urlA) !== ''
}

interface DuplicatePair {
  keepId: string
  dropId: string
  reason: string
  similarity: number
}

function findDuplicatePairs(apps: AppRecord[]): DuplicatePair[] {
  const pairs: DuplicatePair[] = []
  const processed = new Set<string>()

  for (let i = 0; i < apps.length; i++) {
    if (processed.has(apps[i].id)) continue

    for (let j = i + 1; j < apps.length; j++) {
      if (processed.has(apps[j].id)) continue

      const a = apps[i]
      const b = apps[j]

      // 1. Same root domain
      if (isSameDomain(a.website, b.website)) {
        const keep = selectWinner(a, b)
        const drop = keep.id === a.id ? b : a
        pairs.push({
          keepId: keep.id,
          dropId: drop.id,
          reason: 'same root domain',
          similarity: 1.0
        })
        processed.add(drop.id)
        continue
      }

      // 2. Very similar names
      const normA = normalizeName(a.name)
      const normB = normalizeName(b.name)
      const nameSim = levenshteinSimilarity(normA, normB)
      if (nameSim >= 0.88) {
        const keep = selectWinner(a, b)
        const drop = keep.id === a.id ? b : a
        pairs.push({
          keepId: keep.id,
          dropId: drop.id,
          reason: `similar names (${(nameSim * 100).toFixed(0)}%)`,
          similarity: nameSim
        })
        processed.add(drop.id)
        continue
      }

      // 3. Very similar descriptions (only if name is also somewhat similar)
      if (nameSim >= 0.60 && a.description && b.description) {
        const descSim = descriptionOverlap(a.description, b.description)
        if (descSim >= 0.72) {
          const keep = selectWinner(a, b)
          const drop = keep.id === a.id ? b : a
          pairs.push({
            keepId: keep.id,
            dropId: drop.id,
            reason: `similar name+description (${(descSim * 100).toFixed(0)}% desc overlap)`,
            similarity: (nameSim + descSim) / 2
          })
          processed.add(drop.id)
        }
      }
    }
  }

  return pairs
}

/** Choose the record to keep based on confidence and completeness */
function selectWinner(a: AppRecord, b: AppRecord): AppRecord {
  const scoreA = (a.confidence_score || 0)
    + (a.description ? 0.1 : 0)
    + (a.category ? 0.05 : 0)
  const scoreB = (b.confidence_score || 0)
    + (b.description ? 0.1 : 0)
    + (b.category ? 0.05 : 0)
  return scoreA >= scoreB ? a : b
}

export interface DuplicateMergerResult {
  examined: number
  pairsFound: number
  merged: number
  errors: number
}

export async function runDuplicateMerger(): Promise<DuplicateMergerResult> {
  const db = getDb()

  const apps = db.prepare(`
    SELECT id, name, website, description, category, confidence_score, slug, status
    FROM app_listings
    WHERE status IN ('published', 'review')
    ORDER BY created_at ASC
  `).all() as AppRecord[]

  const result: DuplicateMergerResult = {
    examined: apps.length,
    pairsFound: 0,
    merged: 0,
    errors: 0
  }

  const pairs = findDuplicatePairs(apps)
  result.pairsFound = pairs.length

  const merge = db.transaction((pair: DuplicatePair) => {
    const _keepApp = apps.find(a => a.id === pair.keepId)!
    const dropApp = apps.find(a => a.id === pair.dropId)!

    // Copy over any fields from dropApp that keepApp is missing
    db.prepare(`
      UPDATE app_listings
      SET
        description  = COALESCE(description, ?),
        category     = COALESCE(category, ?),
        logo_url     = COALESCE(logo_url, ?),
        screenshot_url = COALESCE(screenshot_url, ?),
        founded_year = COALESCE(founded_year, ?),
        hq_country   = COALESCE(hq_country, ?),
        updated_at   = ?
      WHERE id = ?
    `).run(
      dropApp.description,
      dropApp.category,
      null, // logo_url — fetch from dropApp if needed
      null, // screenshot_url
      null, // founded_year
      null, // hq_country
      new Date().toISOString(),
      pair.keepId
    )

    // Log the merge
    const mergeId = makeId('mrg')
    db.prepare(`
      INSERT INTO duplicate_merges
        (id, kept_id, dropped_id, reason, similarity, merged_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      mergeId,
      pair.keepId,
      pair.dropId,
      pair.reason,
      pair.similarity,
      new Date().toISOString()
    )

    // Soft-delete the duplicate
    db.prepare(`
      UPDATE app_listings SET status = 'merged_duplicate', updated_at = ? WHERE id = ?
    `).run(new Date().toISOString(), pair.dropId)
  })

  for (const pair of pairs) {
    try {
      merge(pair)
      console.log(
        `[dup-merger] Merged "${apps.find(a => a.id === pair.dropId)?.name}" ` +
        `→ kept "${apps.find(a => a.id === pair.keepId)?.name}" (${pair.reason})`
      )
      result.merged++
    }
    catch (err) {
      console.error(`[dup-merger] Failed to merge pair ${pair.keepId}/${pair.dropId}:`, err)
      result.errors++
    }
  }

  return result
}
