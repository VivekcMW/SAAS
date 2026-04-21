/**
 * Admin Badge Management API - POST /api/admin/badges/assign
 * Assign or remove badges from applications (Admin only)
 */

import type { Badge, AdminAction } from '~/types/enhanced-app'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    // Verify admin authentication (simplified for demo)
    const adminId = await verifyAdminAuth(event)
    if (!adminId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Admin authentication required'
      })
    }

    const { appId, badges, action, reason } = body
    
    if (!appId || !badges || !action) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: appId, badges, action'
      })
    }

    // Validate action type
    if (!['assign', 'remove'].includes(action)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Action must be either "assign" or "remove"'
      })
    }

    const results = []
    
    for (const badgeType of badges) {
      if (action === 'assign') {
        const badge: Badge = {
          id: `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: getBadgeName(badgeType),
          type: badgeType,
          description: getBadgeDescription(badgeType),
          iconUrl: `/icons/badges/${badgeType}.svg`,
          color: getBadgeColor(badgeType),
          criteria: getBadgeCriteria(badgeType),
          assignedAt: new Date(),
          assignedBy: adminId,
          expiresAt: getBadgeExpiry(badgeType)
        }
        
        // In real implementation: Save badge to database
        console.log(`Assigning badge ${badgeType} to app ${appId}`)
        results.push({ badge, action: 'assigned' })
        
      } else if (action === 'remove') {
        // In real implementation: Remove badge from database
        console.log(`Removing badge ${badgeType} from app ${appId}`)
        results.push({ badgeType, action: 'removed' })
      }
    }

    // Log admin action
    const adminAction: AdminAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      adminId,
      appId,
      action: action === 'assign' ? 'assign_badge' : 'remove_badge',
      details: { badges, reason },
      timestamp: new Date(),
      reason
    }
    
    // In real implementation: Save admin action to audit log
    console.log('Admin action logged:', adminAction)

    return {
      success: true,
      results,
      message: `Successfully ${action}ed ${badges.length} badge(s)`
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to manage badges'
    })
  }
})

// Helper functions
async function verifyAdminAuth(event: any): Promise<string | null> {
  // In a real implementation, this would verify JWT token or session
  // For demo purposes, check for admin header
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.includes('admin')) {
    return 'admin_user_123'
  }
  return null
}

function getBadgeName(type: string): string {
  const names = {
    'editor_choice': "Editor's Choice",
    'trending': 'Trending',
    'popular': 'Popular',
    'highly_rated': 'Highly Rated',
    'new': 'New',
    'featured': 'Featured'
  }
  return names[type as keyof typeof names] || type
}

function getBadgeDescription(type: string): string {
  const descriptions = {
    'editor_choice': 'Handpicked by our editorial team for exceptional quality',
    'trending': 'Currently experiencing rapid growth in downloads',
    'popular': 'Loved by thousands of users worldwide',
    'highly_rated': 'Consistently receives excellent user reviews',
    'new': 'Recently launched on our platform',
    'featured': 'Highlighted for special recognition'
  }
  return descriptions[type as keyof typeof descriptions] || 'Special recognition badge'
}

function getBadgeColor(type: string): string {
  const colors = {
    'editor_choice': '#FFD700',
    'trending': '#FF6B6B',
    'popular': '#4ECDC4',
    'highly_rated': '#45B7D1',
    'new': '#96CEB4',
    'featured': '#FFEAA7'
  }
  return colors[type as keyof typeof colors] || '#999999'
}

function getBadgeCriteria(type: string): string {
  const criteria = {
    'editor_choice': 'Manual selection by editorial team',
    'trending': '50%+ growth in downloads over 30 days',
    'popular': '10,000+ total downloads',
    'highly_rated': '4.5+ rating with 50+ reviews',
    'new': 'Published within last 30 days',
    'featured': 'Special promotional status'
  }
  return criteria[type as keyof typeof criteria] || 'Meets platform criteria'
}

function getBadgeExpiry(type: string): Date | undefined {
  // Some badges expire, others are permanent
  const expirationDays = {
    'trending': 90, // Trending badges expire after 90 days
    'new': 30, // New badges expire after 30 days
    'featured': 60 // Featured badges expire after 60 days
  }
  
  const days = expirationDays[type as keyof typeof expirationDays]
  if (days) {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + days)
    return expiry
  }
  
  return undefined // Permanent badges
}
