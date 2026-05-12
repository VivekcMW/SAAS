/**
 * Badge Auto-Assignment System
 * Automatically assigns and removes badges based on app performance and metrics
 */

import type { Badge, AnalyticsSummary } from '~/types/enhanced-app'
import { getDb, makeId } from '~/server/utils/database'

export class BadgeAssigner {
  private static instance: BadgeAssigner

  static getInstance(): BadgeAssigner {
    if (!BadgeAssigner.instance) {
      BadgeAssigner.instance = new BadgeAssigner()
    }
    return BadgeAssigner.instance
  }

  /**
   * Evaluate an app for all possible badges
   */
  async evaluateForBadges(appId: string): Promise<string[]> {
    try {
      const appData = await this.getAppWithMetrics(appId)
      if (!appData) {
        console.warn(`App ${appId} not found for badge evaluation`)
        return []
      }

      const newBadges: string[] = []

      // Trending badge - based on download growth
      if (await this.qualifiesForTrendingBadge(appData)) {
        newBadges.push('trending')
      }

      // Popular badge - based on total downloads
      if (await this.qualifiesForPopularBadge(appData)) {
        newBadges.push('popular')
      }

      // Highly rated badge - based on reviews
      if (await this.qualifiesForHighlyRatedBadge(appData)) {
        newBadges.push('highly_rated')
      }

      // New badge - recently published
      if (await this.qualifiesForNewBadge(appData)) {
        newBadges.push('new')
      }

      // Editor's choice - manual approval required but auto-suggested
      if (await this.qualifiesForEditorChoiceSuggestion(appData)) {
        await this.requestEditorReview(appId, 'editor_choice')
      }

      // Assign new badges
      if (newBadges.length > 0) {
        await this.assignBadges(appId, newBadges, 'auto-assignment')
      }

      // Remove expired badges
      await this.removeExpiredBadges(appId)

      return newBadges
    } catch (error) {
      console.error(`Error evaluating badges for app ${appId}:`, error)
      return []
    }
  }

  /**
   * Check if app qualifies for trending badge
   */
  private async qualifiesForTrendingBadge(appData: any): Promise<boolean> {
    // Trending: 50%+ growth in downloads over 30 days
    const downloadGrowth = appData.analytics?.downloadGrowth30d || 0
    return downloadGrowth >= 50
  }

  /**
   * Check if app qualifies for popular badge
   */
  private async qualifiesForPopularBadge(appData: any): Promise<boolean> {
    // Popular: 10,000+ total downloads
    const totalDownloads = appData.analytics?.totalDownloads || 0
    return totalDownloads >= 10000
  }

  /**
   * Check if app qualifies for highly rated badge
   */
  private async qualifiesForHighlyRatedBadge(appData: any): Promise<boolean> {
    // Highly rated: 4.5+ rating with 50+ reviews
    const rating = appData.rating || 0
    const reviewCount = appData.reviewCount || 0
    return rating >= 4.5 && reviewCount >= 50
  }

  /**
   * Check if app qualifies for new badge
   */
  private async qualifiesForNewBadge(appData: any): Promise<boolean> {
    // New: Published within last 30 days
    const publishedDate = new Date(appData.publishedAt || appData.createdAt)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return publishedDate >= thirtyDaysAgo
  }

  /**
   * Check if app should be suggested for editor's choice
   */
  private async qualifiesForEditorChoiceSuggestion(appData: any): Promise<boolean> {
    // Editor's choice suggestion: 4.8+ rating, 5000+ downloads, good performance
    const rating = appData.rating || 0
    const downloads = appData.analytics?.totalDownloads || 0
    const uptime = appData.performance?.uptime || 0
    
    return rating >= 4.8 && downloads >= 5000 && uptime >= 99.5
  }

  /**
   * Assign badges to an app
   */
  async assignBadges(appId: string, badgeTypes: string[], assignedBy: string = 'system'): Promise<Badge[]> {
    const assignedBadges: Badge[] = []

    for (const badgeType of badgeTypes) {
      // Check if badge is already assigned
      const existingBadge = await this.getExistingBadge(appId, badgeType)
      if (existingBadge) {
        continue // Skip if already assigned
      }

      const badge: Badge = {
        id: `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: this.getBadgeName(badgeType),
        type: badgeType as any,
        description: this.getBadgeDescription(badgeType),
        iconUrl: `/icons/badges/${badgeType}.svg`,
        color: this.getBadgeColor(badgeType),
        criteria: this.getBadgeCriteria(badgeType),
        assignedAt: new Date(),
        assignedBy,
        expiresAt: this.getBadgeExpiry(badgeType)
      }

      // Save badge to database
      await this.saveBadge(appId, badge)
      assignedBadges.push(badge)

      console.log(`Assigned ${badgeType} badge to app ${appId}`)
    }

    return assignedBadges
  }

  /**
   * Remove expired badges
   */
  async removeExpiredBadges(appId: string): Promise<string[]> {
    const expiredBadges = await this.getExpiredBadges(appId)
    const removedBadgeTypes: string[] = []

    for (const badge of expiredBadges) {
      await this.removeBadge(appId, badge.id)
      removedBadgeTypes.push(badge.type)
      console.log(`Removed expired ${badge.type} badge from app ${appId}`)
    }

    return removedBadgeTypes
  }

  /**
   * Evaluate all apps for badges (batch operation)
   */
  async evaluateAllApps(): Promise<void> {
    try {
      const activeApps = await this.getActiveApps()
      
      for (const app of activeApps) {
        await this.evaluateForBadges(app.id)
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      console.log(`Badge evaluation completed for ${activeApps.length} apps`)
    } catch (error) {
      console.error('Error during batch badge evaluation:', error)
    }
  }

  /**
   * Schedule automatic badge evaluation
   */
  startAutomaticEvaluation(): void {
    // Run badge evaluation every 6 hours
    setInterval(() => {
      this.evaluateAllApps()
    }, 6 * 60 * 60 * 1000)

    console.log('Automatic badge evaluation started (every 6 hours)')
  }

  // Helper methods
  private getBadgeName(type: string): string {
    const names: Record<string, string> = {
      'editor_choice': "Editor's Choice",
      'trending': 'Trending',
      'popular': 'Popular',
      'highly_rated': 'Highly Rated',
      'new': 'New',
      'featured': 'Featured'
    }
    return names[type] || type
  }

  private getBadgeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'editor_choice': 'Handpicked by our editorial team for exceptional quality',
      'trending': 'Currently experiencing rapid growth in downloads',
      'popular': 'Loved by thousands of users worldwide',
      'highly_rated': 'Consistently receives excellent user reviews',
      'new': 'Recently launched on our platform',
      'featured': 'Highlighted for special recognition'
    }
    return descriptions[type] || 'Special recognition badge'
  }

  private getBadgeColor(type: string): string {
    const colors: Record<string, string> = {
      'editor_choice': '#FFD700',
      'trending': '#FF6B6B',
      'popular': '#4ECDC4',
      'highly_rated': '#45B7D1',
      'new': '#96CEB4',
      'featured': '#FFEAA7'
    }
    return colors[type] || '#999999'
  }

  private getBadgeCriteria(type: string): string {
    const criteria: Record<string, string> = {
      'editor_choice': 'Manual selection by editorial team',
      'trending': '50%+ growth in downloads over 30 days',
      'popular': '10,000+ total downloads',
      'highly_rated': '4.5+ rating with 50+ reviews',
      'new': 'Published within last 30 days',
      'featured': 'Special promotional status'
    }
    return criteria[type] || 'Meets platform criteria'
  }

  private getBadgeExpiry(type: string): Date | undefined {
    const expirationDays: Record<string, number> = {
      'trending': 90, // Trending badges expire after 90 days
      'new': 30, // New badges expire after 30 days
      'featured': 60 // Featured badges expire after 60 days
    }
    
    const days = expirationDays[type]
    if (days) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + days)
      return expiry
    }
    
    return undefined // Permanent badges
  }

  // Mock database operations - replace with actual database calls
  private async getAppWithMetrics(appId: string): Promise<any> {
    // In real implementation, fetch app with analytics and performance data
    return {
      id: appId,
      name: `App ${appId}`,
      rating: 4.6,
      reviewCount: 75,
      createdAt: '2024-01-15',
      publishedAt: '2024-01-20',
      analytics: {
        totalDownloads: 12500,
        downloadGrowth30d: 65
      },
      performance: {
        uptime: 99.8
      }
    }
  }

  private async getExistingBadge(appId: string, badgeType: string): Promise<Badge | null> {
    try {
      const db = getDb()
      const row = db.prepare(`SELECT * FROM app_badges WHERE app_id = ? AND type = ? AND (expires_at IS NULL OR expires_at > datetime('now')) LIMIT 1`).get(appId, badgeType) as Badge | undefined
      return row ?? null
    } catch { return null }
  }

  private async saveBadge(appId: string, badge: Badge): Promise<void> {
    try {
      const db = getDb()
      const id = badge.id || makeId('badge')
      const now = new Date().toISOString()
      db.prepare(`INSERT OR REPLACE INTO app_badges (id, app_id, type, label, description, awarded_at, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, appId, badge.type, badge.label ?? badge.type, badge.description ?? null, badge.awardedAt ?? now, badge.expiresAt ?? null, now, now)
    } catch (e) { console.error('[badgeAssigner] saveBadge failed:', e) }
  }

  private async getExpiredBadges(appId: string): Promise<Badge[]> {
    try {
      const db = getDb()
      return db.prepare(`SELECT * FROM app_badges WHERE app_id = ? AND expires_at IS NOT NULL AND expires_at <= datetime('now')`).all(appId) as Badge[]
    } catch { return [] }
  }

  private async removeBadge(appId: string, badgeId: string): Promise<void> {
    try {
      const db = getDb()
      db.prepare('DELETE FROM app_badges WHERE id = ? AND app_id = ?').run(badgeId, appId)
    } catch (e) { console.error('[badgeAssigner] removeBadge failed:', e) }
  }

  private async getActiveApps(): Promise<Array<{ id: string }>> {
    try {
      const db = getDb()
      return db.prepare(`SELECT id FROM app_listings WHERE status = 'published' ORDER BY updated_at DESC LIMIT 500`).all() as Array<{ id: string }>
    } catch { return [] }
  }

  private async requestEditorReview(appId: string, badgeType: string): Promise<void> {
    // Create editor review request
    console.log(`Requesting editor review for ${badgeType} badge on app ${appId}`)
  }
}

// Export singleton instance
export const badgeAssigner = BadgeAssigner.getInstance()

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  badgeAssigner.startAutomaticEvaluation()
}
