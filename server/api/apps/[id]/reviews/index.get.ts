/**
 * Reviews API - GET /api/apps/[id]/reviews
 * Retrieve paginated reviews for an application
 */

import type { PaginatedReviews, Review } from '~/types/enhanced-app'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const query = getQuery(event)
  
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const sort = (query.sort as string) || 'newest'
  const rating = query.rating ? Number(query.rating) : undefined
  
  try {
    // Mock data for now - replace with actual database query
    const mockReviews: Review[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        rating: 5,
        title: 'Excellent tool for our team!',
        content: 'This application has significantly improved our workflow. The interface is intuitive and the features are exactly what we needed.',
        verified: true,
        helpfulVotes: 12,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        status: 'approved',
        metadata: {
          platform: 'web',
          version: '2.1.0'
        }
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Sarah Smith',
        userEmail: 'sarah@company.com',
        rating: 4,
        title: 'Good but could use improvements',
        content: 'Overall satisfied with the application. Some features could be more polished, but it gets the job done.',
        verified: true,
        helpfulVotes: 8,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        status: 'approved',
        metadata: {
          platform: 'web',
          version: '2.0.5'
        }
      }
    ]

    // Filter by rating if specified
    const filteredReviews = rating 
      ? mockReviews.filter(review => review.rating === rating)
      : mockReviews

    // Sort reviews
    const sortedReviews = [...filteredReviews].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime()
        case 'rating_high':
          return b.rating - a.rating
        case 'rating_low':
          return a.rating - b.rating
        case 'helpful':
          return b.helpfulVotes - a.helpfulVotes
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

    // Paginate results
    const startIndex = (page - 1) * limit
    const paginatedReviews = sortedReviews.slice(startIndex, startIndex + limit)

    // Calculate rating breakdown
    const ratingBreakdown = {
      1: mockReviews.filter(r => r.rating === 1).length,
      2: mockReviews.filter(r => r.rating === 2).length,
      3: mockReviews.filter(r => r.rating === 3).length,
      4: mockReviews.filter(r => r.rating === 4).length,
      5: mockReviews.filter(r => r.rating === 5).length,
      total: mockReviews.length
    }

    // Calculate average rating
    const averageRating = mockReviews.length > 0 
      ? mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
      : 0

    const response: PaginatedReviews = {
      reviews: paginatedReviews,
      total: filteredReviews.length,
      page,
      limit,
      hasMore: startIndex + limit < filteredReviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingBreakdown
    }

    return response
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch reviews'
    })
  }
})
