/**
 * Enhanced Application Types - Missing Fields Implementation
 * This extends the existing app types with missing fields for comprehensive data collection
 */

import type { DatabaseApplication } from './database'

// User-Generated Content Types
export interface Review {
  id: string
  userId?: string
  userName: string
  userEmail?: string
  rating: number // 1-5
  title: string
  content: string
  verified: boolean
  helpfulVotes: number
  createdAt: Date
  updatedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  metadata?: {
    platform?: string
    version?: string
    helpfulUserIds?: string[]
  }
}

export interface RatingBreakdown {
  1: number
  2: number
  3: number
  4: number
  5: number
  total: number
}

export interface Testimonial {
  id: string
  author: string
  company: string
  role: string
  content: string
  rating: number
  featured: boolean
  verified: boolean
  createdAt: Date
}

// Analytics and Metrics Types
export interface UserMetrics {
  daily: number
  weekly: number
  monthly: number
  lastUpdated: Date
  trend: 'up' | 'down' | 'stable'
  growthRate: number // percentage
}

export interface PerformanceData {
  uptime: number // percentage
  responseTime: number // milliseconds
  errorRate: number // percentage
  lastChecked: Date
  status: 'healthy' | 'warning' | 'critical'
  endpoints: {
    url: string
    status: number
    responseTime: number
  }[]
}

export interface AnalyticsData {
  views: {
    total: number
    unique: number
    timeSeriesData: Array<{
      date: string
      views: number
      uniqueViews: number
    }>
  }
  downloads: {
    total: number
    byPlatform: Record<string, number>
    timeSeriesData: Array<{
      date: string
      downloads: number
      platform: string
    }>
  }
  engagement: {
    averageSessionTime: number
    bounceRate: number
    clickThroughRate: number
  }
  sources: {
    direct: number
    search: number
    social: number
    referral: number
    other: number
  }
}

// Marketing and Business Types
export interface Badge {
  id: string
  name: string
  type: 'editor_choice' | 'trending' | 'popular' | 'highly_rated' | 'new' | 'featured'
  description: string
  iconUrl: string
  color: string
  criteria: string
  assignedAt: Date
  assignedBy: string
  expiresAt?: Date
}

export interface CaseStudy {
  id: string
  title: string
  company: string
  industry: string
  challenge: string
  solution: string
  results: string[]
  metrics: {
    metric: string
    improvement: string
    timeframe: string
  }[]
  featured: boolean
  publishedAt: Date
}

export interface MarketData {
  ranking: {
    category: number
    overall: number
    trending: number
  }
  competitors: Array<{
    name: string
    comparison: 'better' | 'similar' | 'worse'
    differentiators: string[]
  }>
  marketShare: number
  industryPosition: string
}

// Technical Validation Types
export interface ApiHealthStatus {
  status: 'online' | 'offline' | 'degraded'
  endpoints: Array<{
    url: string
    method: string
    status: number
    responseTime: number
    lastChecked: Date
  }>
  uptime: number
  lastIncident?: {
    date: Date
    description: string
    resolved: boolean
  }
}

export interface CompatibilityData {
  platforms: Array<{
    name: string
    versions: string[]
    tested: boolean
    compatibility: 'full' | 'partial' | 'none'
    lastTested: Date
  }>
  browsers: Array<{
    name: string
    versions: string[]
    supported: boolean
  }>
  devices: Array<{
    type: 'desktop' | 'mobile' | 'tablet'
    specifications: string
    compatibility: 'excellent' | 'good' | 'limited'
  }>
}

export interface Certification {
  id: string
  name: string
  type: 'security' | 'compliance' | 'quality' | 'performance'
  issuer: string
  certificationDate: Date
  expiryDate?: Date
  certificateUrl?: string
  status: 'active' | 'expired' | 'pending'
  description: string
}

export interface BenchmarkData {
  performance: {
    responseTime: number
    throughput: number
    concurrentUsers: number
    uptime: number
  }
  security: {
    vulnerabilities: number
    securityScore: number
    lastAudit: Date
    certifications: string[]
  }
  reliability: {
    errorRate: number
    recoveryTime: number
    availability: number
  }
  lastUpdated: Date
}

// Enhanced Application Interface
export interface EnhancedAppData extends DatabaseApplication {
  // User-Generated Content
  reviews: Review[]
  overallRating: number
  ratingBreakdown: RatingBreakdown
  userTestimonials: Testimonial[]
  
  // Dynamic Metrics
  downloadCount: number
  activeUsers: UserMetrics
  performanceMetrics: PerformanceData
  usageAnalytics: AnalyticsData
  
  // Marketing Fields
  featuredBadges: Badge[]
  competitiveAdvantages: string[]
  successStories: CaseStudy[]
  marketPosition: MarketData
  
  // Technical Validation
  liveApiStatus: ApiHealthStatus
  compatibilityMatrix: CompatibilityData
  securityCertifications: Certification[]
  performanceBenchmarks: BenchmarkData
  
  // Computed Fields
  isHealthy: boolean
  trustScore: number
  popularityScore: number
  lastDataUpdate: Date
}

// Analytics Event Types
export interface AnalyticsEvent {
  id: string
  appId: string
  type: 'view' | 'click' | 'download' | 'trial_start' | 'signup' | 'purchase'
  userId?: string
  sessionId: string
  timestamp: Date
  metadata: Record<string, any>
  source: string
  platform: string
  location?: {
    country: string
    region: string
    city: string
  }
}

// Admin Management Types
export interface AdminAction {
  id: string
  adminId: string
  appId: string
  action: 'assign_badge' | 'remove_badge' | 'feature' | 'unfeature' | 'approve' | 'reject'
  details: Record<string, any>
  timestamp: Date
  reason?: string
}

// Form Data for Missing Fields Collection
export interface ReviewFormData {
  rating: number
  title: string
  content: string
  platform?: string
  version?: string
}

export interface TestimonialFormData {
  author: string
  company: string
  role: string
  content: string
  rating: number
  contactEmail?: string
}

export interface CaseStudyFormData {
  title: string
  company: string
  industry: string
  challenge: string
  solution: string
  results: string[]
  metrics: Array<{
    metric: string
    improvement: string
    timeframe: string
  }>
  contactEmail?: string
}

// API Response Types
export interface PaginatedReviews {
  reviews: Review[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  averageRating: number
  ratingBreakdown: RatingBreakdown
}

export interface AnalyticsSummary {
  totalViews: number
  totalDownloads: number
  activeUsers: UserMetrics
  performance: PerformanceData
  topSources: Array<{
    source: string
    count: number
    percentage: number
  }>
  recentActivity: AnalyticsEvent[]
}

// Database Schema Extensions
export interface EnhancedDatabaseTables {
  reviews: Review & { application_id: string }
  analytics_events: AnalyticsEvent & { application_id: string }
  badges: Badge & { application_id: string }
  testimonials: Testimonial & { application_id: string }
  case_studies: CaseStudy & { application_id: string }
  certifications: Certification & { application_id: string }
  performance_logs: PerformanceData & { application_id: string }
  admin_actions: AdminAction
}

// Utility Types
export type BadgeType = Badge['type']
export type ReviewStatus = Review['status']
export type PerformanceStatus = PerformanceData['status']
export type CertificationStatus = Certification['status']
export type AnalyticsEventType = AnalyticsEvent['type']
