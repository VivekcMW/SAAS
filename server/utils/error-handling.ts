/**
 * Error Handling Utilities
 * Standardized error handling, custom error classes, and error recovery
 */

import { logger } from './logging'
import { ErrorCodes, HttpStatus } from './api-response'

/**
 * Custom error class hierarchy
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * Validation error - 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(
      ErrorCodes.VALIDATION_ERROR,
      message,
      HttpStatus.BAD_REQUEST,
      details
    )
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Authentication error - 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(
      ErrorCodes.UNAUTHORIZED,
      message,
      HttpStatus.UNAUTHORIZED
    )
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * Authorization error - 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(
      ErrorCodes.FORBIDDEN,
      message,
      HttpStatus.FORBIDDEN
    )
    this.name = 'AuthorizationError'
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

/**
 * Not found error - 404
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`

    super(
      ErrorCodes.NOT_FOUND,
      message,
      HttpStatus.NOT_FOUND
    )
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Conflict error - 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(resource: string, message?: string) {
    super(
      ErrorCodes.RESOURCE_CONFLICT,
      message || `${resource} already exists`,
      HttpStatus.CONFLICT
    )
    this.name = 'ConflictError'
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Rate limit error - 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      message,
      HttpStatus.TOO_MANY_REQUESTS,
      retryAfter ? { retryAfter } : undefined
    )
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * Database error - 500 (generic, doesn't expose details)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    super(
      ErrorCodes.INTERNAL_ERROR,
      message,
      HttpStatus.INTERNAL_ERROR,
      process.env.NODE_ENV === 'development' ? { originalError: originalError?.message } : undefined
    )
    this.name = 'DatabaseError'
    Object.setPrototypeOf(this, DatabaseError.prototype)

    // Log original error
    if (originalError) {
      logger.error('Database error', { originalError: originalError.message })
    }
  }
}

/**
 * Service error - 503 Service Unavailable
 */
export class ServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      ErrorCodes.SERVICE_UNAVAILABLE,
      message || `${service} is unavailable`,
      HttpStatus.SERVICE_UNAVAILABLE
    )
    this.name = 'ServiceError'
    Object.setPrototypeOf(this, ServiceError.prototype)
  }
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Error handler for Nitro endpoints
 */
export function createErrorHandler() {
  return defineEventHandler(async (event) => {
    // This file is loaded as global server middleware. Middleware should
    // fall through after annotating/logging the request instead of trying
    // to "return event", which serializes the H3 event and breaks routing.
    //
    // Centralized error translation should live in API handlers or Nitro
    // error hooks, not in a pass-through middleware like this.
    const requestId = getHeader(event, 'x-request-id') as string | undefined
    event.context.errorHandler = { requestId }
  })
}

/**
 * Retry logic for async operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number
    delayMs?: number
    backoffMultiplier?: number
    onRetry?: (attempt: number, error: Error) => void
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts || 3
  const delayMs = options?.delayMs || 100
  const backoffMultiplier = options?.backoffMultiplier || 2

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxAttempts) {
        options?.onRetry?.(attempt, lastError)

        // Calculate backoff delay
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Operation failed after retries')
}

/**
 * Circuit breaker pattern for external service calls
 */
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime: number | null = null

  constructor(
    private fn: () => Promise<any>,
    private options?: {
      failureThreshold?: number
      resetTimeout?: number
      successThreshold?: number
    }
  ) {}

  async execute<T>(): Promise<T> {
    const failureThreshold = this.options?.failureThreshold || 5
    const resetTimeout = this.options?.resetTimeout || 60000 // 1 minute
    const successThreshold = this.options?.successThreshold || 2

    // Check if should reset
    if (
      this.state === 'open' &&
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime > resetTimeout
    ) {
      this.state = 'half-open'
      this.successCount = 0
    }

    if (this.state === 'open') {
      throw new ServiceError(
        'Circuit breaker',
        'Service is temporarily unavailable'
      )
    }

    try {
      const result = await this.fn()

      if (this.state === 'half-open') {
        this.successCount++
        if (this.successCount >= successThreshold) {
          this.state = 'closed'
          this.failureCount = 0
          this.successCount = 0
        }
      } else if (this.state === 'closed') {
        this.failureCount = 0
      }

      return result
    } catch (error) {
      this.failureCount++
      this.lastFailureTime = Date.now()

      if (this.failureCount >= failureThreshold) {
        this.state = 'open'
      }

      throw error
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state
  }

  reset(): void {
    this.state = 'closed'
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = null
  }
}

/**
 * Graceful error recovery
 */
export class ErrorRecovery {
  /**
   * Try operation with fallback
   */
  static async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    try {
      return await primary()
    } catch (error) {
      logger.warn('Primary operation failed, using fallback', {
        error: error instanceof Error ? error.message : String(error)
      })
      return fallback()
    }
  }

  /**
   * Try operation with default value
   */
  static async withDefault<T>(
    fn: () => Promise<T>,
    defaultValue: T
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      logger.warn('Operation failed, using default', {
        error: error instanceof Error ? error.message : String(error)
      })
      return defaultValue
    }
  }

  /**
   * Timeout wrapper
   */
  static async withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new ServiceError('Operation timed out')),
          timeoutMs
        )
      )
    ])
  }
}

/**
 * Error context for detailed logging
 */
export class ErrorContext {
  private contextMap = new Map<string, any>()

  set(key: string, value: any): this {
    this.contextMap.set(key, value)
    return this
  }

  get(key: string): any {
    return this.contextMap.get(key)
  }

  toObject(): Record<string, any> {
    return Object.fromEntries(this.contextMap)
  }

  clear(): void {
    this.contextMap.clear()
  }
}
