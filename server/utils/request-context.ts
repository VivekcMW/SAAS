/**
 * Request Context and Middleware Utilities
 * Handles request tracking, header management, and middleware composition
 */

import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { logger } from './logging'

/**
 * Request context information
 */
export interface RequestContext {
  requestId: string
  userId?: string
  userRole?: string
  email?: string
  startTime: number
  method: string
  path: string
  ip: string
  userAgent?: string
  correlationId?: string
}

/**
 * Context storage using AsyncLocalStorage (if available)
 */
let contextStorage: any = null

try {
  const { AsyncLocalStorage } = require('async_hooks')
  contextStorage = new AsyncLocalStorage()
} catch {
  // AsyncLocalStorage not available, use Map fallback
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return randomUUID()
}

/**
 * Get client IP from request
 */
export function getClientIp(event: H3Event): string {
  // Check X-Forwarded-For header (proxy)
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Check X-Client-IP header
  const clientIp = getHeader(event, 'x-client-ip')
  if (clientIp) {
    return clientIp
  }

  // Check X-Real-IP header
  const realIp = getHeader(event, 'x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to peer address
  return event.node.req.socket?.remoteAddress || '0.0.0.0'
}

/**
 * Create request context
 */
export function createRequestContext(
  event: H3Event,
  options?: {
    userId?: string
    userRole?: string
    email?: string
    correlationId?: string
  }
): RequestContext {
  return {
    requestId: generateRequestId(),
    userId: options?.userId,
    userRole: options?.userRole,
    email: options?.email,
    startTime: Date.now(),
    method: event.node.req.method || 'UNKNOWN',
    path: event.node.req.url || '/',
    ip: getClientIp(event),
    userAgent: getHeader(event, 'user-agent') as string | undefined,
    correlationId: options?.correlationId || generateRequestId()
  }
}

/**
 * Set request context (for async context)
 */
export function setRequestContext(context: RequestContext): void {
  if (contextStorage) {
    contextStorage.getStore()?.set('requestContext', context)
  }
}

/**
 * Get request context
 */
export function getRequestContext(): RequestContext | undefined {
  if (contextStorage) {
    return contextStorage.getStore()?.get('requestContext')
  }
  return undefined
}

/**
 * Middleware to attach request context to event
 */
export function requestContextMiddleware() {
  return defineEventHandler(async (event) => {
    const context = createRequestContext(event)
    
    // Store context
    event.context.requestContext = context
    
    // Set request headers
    setHeader(event, 'X-Request-ID', context.requestId)
    setHeader(event, 'X-Correlation-ID', context.correlationId)

    // Log request
    logger.info('Incoming request', {
      method: context.method,
      path: context.path,
      ip: context.ip,
      requestId: context.requestId
    })

    event.node.res.once('finish', () => {
      // Log response
      const duration = Date.now() - context.startTime
      logger.info('Request completed', {
        method: context.method,
        path: context.path,
        statusCode: event.node.res.statusCode,
        duration: `${duration}ms`,
        requestId: context.requestId
      })
    })
  })
}

/**
 * Get request context from event
 */
export function getEventContext(event: H3Event): RequestContext {
  return event.context.requestContext || createRequestContext(event)
}

/**
 * Middleware composition helper
 */
export class MiddlewareChain {
  private middlewares: Array<(event: H3Event) => Promise<void>> = []

  add(middleware: (event: H3Event) => Promise<void>): this {
    this.middlewares.push(middleware)
    return this
  }

  execute(): ReturnType<typeof defineEventHandler> {
    return defineEventHandler(async (event) => {
      for (const middleware of this.middlewares) {
        await middleware(event)
      }
    })
  }
}

/**
 * Guard middleware - runs condition before handler
 */
export function createGuardMiddleware(
  condition: (event: H3Event) => boolean | Promise<boolean>,
  errorMessage?: string
) {
  return defineEventHandler(async (event) => {
    const result = await condition(event)
    if (!result) {
      throw createError({
        statusCode: 403,
        statusMessage: errorMessage || 'Access denied'
      })
    }
  })
}

/**
 * Conditional middleware - only runs if condition is true
 */
export function createConditionalMiddleware(
  condition: (event: H3Event) => boolean | Promise<boolean>,
  handler: (event: H3Event) => Promise<void>
) {
  return defineEventHandler(async (event) => {
    const result = await condition(event)
    if (result) {
      await handler(event)
    }
  })
}

/**
 * Header validation middleware
 */
export interface HeaderValidationConfig {
  required?: string[]
  optional?: string[]
  validate?: Record<string, (value: string) => boolean>
}

export function createHeaderValidationMiddleware(config: HeaderValidationConfig) {
  return defineEventHandler(async (event) => {
    // Check required headers
    if (config.required) {
      for (const headerName of config.required) {
        const value = getHeader(event, headerName)
        if (!value) {
          throw createError({
            statusCode: 400,
            statusMessage: `Missing required header: ${headerName}`
          })
        }

        // Validate header if validator exists
        if (config.validate?.[headerName]) {
          if (!config.validate[headerName](value)) {
            throw createError({
              statusCode: 400,
              statusMessage: `Invalid value for header: ${headerName}`
            })
          }
        }
      }
    }

    // Validate optional headers if present
    if (config.optional && config.validate) {
      for (const headerName of config.optional) {
        const value = getHeader(event, headerName)
        if (value && config.validate[headerName]) {
          if (!config.validate[headerName](value)) {
            throw createError({
              statusCode: 400,
              statusMessage: `Invalid value for header: ${headerName}`
            })
          }
        }
      }
    }
  })
}

/**
 * CORS middleware configuration
 */
export interface CorsConfig {
  origin?: string | string[] | '*'
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

export function createCorsMiddleware(config: CorsConfig = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    exposedHeaders = ['X-Request-ID', 'X-Correlation-ID'],
    credentials = true,
    maxAge = 86400
  } = config

  return defineEventHandler(async (event) => {
    const requestOrigin = getHeader(event, 'origin') as string
    
    // Check if origin is allowed
    const isOriginAllowed =
      origin === '*' ||
      (Array.isArray(origin)
        ? origin.includes(requestOrigin)
        : origin === requestOrigin)

    if (isOriginAllowed) {
      setHeader(event, 'Access-Control-Allow-Origin', requestOrigin || origin)
      setHeader(event, 'Access-Control-Allow-Methods', methods.join(', '))
      setHeader(event, 'Access-Control-Allow-Headers', allowedHeaders.join(', '))
      setHeader(event, 'Access-Control-Expose-Headers', exposedHeaders.join(', '))
      if (credentials) {
        setHeader(event, 'Access-Control-Allow-Credentials', 'true')
      }
      setHeader(event, 'Access-Control-Max-Age', String(maxAge))
    }

    // Handle preflight
    if (event.node.req.method === 'OPTIONS') {
      event.node.res.statusCode = 204
      return
    }
  })
}

/**
 * Security headers middleware
 */
export function createSecurityHeadersMiddleware() {
  return defineEventHandler(async (event) => {
    setHeader(event, 'X-Content-Type-Options', 'nosniff')
    setHeader(event, 'X-Frame-Options', 'DENY')
    setHeader(event, 'X-XSS-Protection', '1; mode=block')
    setHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
    setHeader(event, 'Permissions-Policy', 'geolocation=()')
  })
}

/**
 * Request compression middleware
 */
export function createCompressionMiddleware() {
  return defineEventHandler(async (event) => {
    const acceptEncoding = getHeader(event, 'accept-encoding') as string | undefined
    
    if (acceptEncoding?.includes('gzip')) {
      setHeader(event, 'Content-Encoding', 'gzip')
    } else if (acceptEncoding?.includes('deflate')) {
      setHeader(event, 'Content-Encoding', 'deflate')
    } else if (acceptEncoding?.includes('br')) {
      setHeader(event, 'Content-Encoding', 'br')
    }
  })
}

/**
 * Request size limit middleware
 */
export function createRequestSizeLimitMiddleware(maxSizeBytes: number = 10 * 1024 * 1024) {
  return defineEventHandler(async (event) => {
    const contentLength = getHeader(event, 'content-length')
    
    if (contentLength) {
      const size = parseInt(contentLength, 10)
      if (size > maxSizeBytes) {
        throw createError({
          statusCode: 413,
          statusMessage: 'Payload too large'
        })
      }
    }
  })
}

/**
 * Timing middleware - measures and logs request duration
 */
export function createTimingMiddleware() {
  return defineEventHandler(async (event) => {
    const startTime = Date.now()

    return () => {
      const duration = Date.now() - startTime
      setHeader(event, 'Server-Timing', `total;dur=${duration}`)
      
      logger.debug('Request timing', {
        duration,
        path: event.node.req.url,
        method: event.node.req.method,
        statusCode: event.node.res.statusCode
      })
    }
  })
}

/**
 * User context enrichment
 */
export async function enrichRequestContextWithUser(
  event: H3Event,
  userId: string,
  userEmail: string,
  userRole: string
): Promise<void> {
  const context = getEventContext(event)
  context.userId = userId
  context.email = userEmail
  context.userRole = userRole
  
  event.context.requestContext = context
  
  logger.debug('Request context enriched', {
    userId,
    userRole,
    requestId: context.requestId
  })
}
