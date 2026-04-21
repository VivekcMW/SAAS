/**
 * Phase 2 Global Middleware Setup
 * Applies Phase 2 utilities to all endpoints
 */

import { defineEventHandler } from 'h3'
import { requestContextMiddleware } from '~/server/utils/request-context'
import {
  createSecurityHeadersMiddleware, 
  createCorsMiddleware,
  createTimingMiddleware
} from '~/server/utils/request-context'
import { setApiHeaders } from '~/server/utils/api-response'

const phase2Middlewares = [
  // 1. Request context MUST be first
  // Generates unique request ID, captures IP, timestamp
  requestContextMiddleware(),

  // 2. Security headers
  // Prevents clickjacking, XSS, controls permissions
  createSecurityHeadersMiddleware(),

  // 3. CORS handling
  // Allows cross-origin requests from approved origins
  createCorsMiddleware({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-ID', 'X-Correlation-ID', 'X-Cache']
  }),

  // 4. API headers middleware
  // Sets content-type, cache-control, etc on all responses
  defineEventHandler((event) => {
    setApiHeaders(event)
  }),

  // 5. Timing middleware
  // Measures response time and adds Server-Timing header
  createTimingMiddleware()
]

export default defineEventHandler(async (event) => {
  for (const middleware of phase2Middlewares) {
    await middleware(event)
  }
})
