/**
 * Unified AI provider utility — multi-model router.
 *
 * Task-aware routing: different tasks get different models optimised for
 * cost, latency, and quality. All providers include:
 *   - 15s timeout with AbortController
 *   - Retry on 429 / 5xx (up to 2 retries with exponential backoff)
 *   - Per-provider circuit breaker (disabled after 5 consecutive failures)
 *   - Ordered fallback chain per task
 *
 * Usage:
 *   const { text, provider } = await aiChat({ task: 'copilot', messages: [...] })
 *   const { text } = await aiChat({ task: 'summarise', messages: [...] })
 */

export type AiMessage = { role: 'user' | 'assistant'; content: string }
export type AiQuality = 'fast' | 'smart'

/**
 * Task identifies the use-case so the router can pick the best model.
 *   'copilot'    — multi-turn buyer advisor (needs reasoning)
 *   'match'      — ranked recommendations (needs speed + reasoning)
 *   'briefing'   — comparative evaluation brief (needs deep analysis)
 *   'summarise'  — short summaries, review synthesis (needs cost efficiency)
 *   'write'      — review replies, negotiation tips, win-loss (needs tone)
 *   'extract'    — structured JSON extraction from raw text (needs precision)
 *   'insight'    — news / trend insights (speed over quality)
 */
export type AiTask =
  | 'copilot'
  | 'match'
  | 'briefing'
  | 'summarise'
  | 'write'
  | 'extract'
  | 'insight'

interface AiChatParams {
  messages: AiMessage[]
  system?: string
  maxTokens?: number
  temperature?: number
  /** Preferred quality hint — overridden by task routing */
  quality?: AiQuality
  /**
   * Task hint for model routing. If omitted, falls back to quality-based
   * routing (backward compatible).
   */
  task?: AiTask
}

interface AiChatResult {
  text: string | null
  provider: 'anthropic' | 'openai' | 'gemini' | null
  model: string | null
  latencyMs: number
}

// ── Model tables ──────────────────────────────────────────────────────────────

const CLAUDE_MODELS: Record<AiQuality, string> = {
  smart: 'claude-opus-4-5',
  fast:  'claude-haiku-3-5'
}
const OPENAI_MODELS: Record<AiQuality, string> = {
  smart: 'gpt-4o',
  fast:  'gpt-4o-mini'
}
const GEMINI_MODELS: Record<AiQuality, string> = {
  smart: 'gemini-1.5-pro',
  fast:  'gemini-1.5-flash'
}

/**
 * Task → ordered provider chain.
 * First entry = primary, remaining = fallbacks.
 * 'quality' determines which model within a provider is used.
 */
const TASK_ROUTING: Record<AiTask, { provider: 'anthropic' | 'openai' | 'gemini'; quality: AiQuality }[]> = {
  // Deep multi-turn reasoning — Claude Opus primary
  copilot:   [{ provider: 'anthropic', quality: 'smart' }, { provider: 'openai', quality: 'smart' }],
  // Ranked recs — Gemini Flash is fastest + cheapest for JSON ranking tasks
  match:     [{ provider: 'gemini', quality: 'fast' }, { provider: 'openai', quality: 'smart' }, { provider: 'anthropic', quality: 'smart' }],
  // Deep comparative analysis — Claude Opus primary
  briefing:  [{ provider: 'anthropic', quality: 'smart' }, { provider: 'openai', quality: 'smart' }],
  // High-volume summaries — cheapest fast model
  summarise: [{ provider: 'openai', quality: 'fast' }, { provider: 'anthropic', quality: 'fast' }, { provider: 'gemini', quality: 'fast' }],
  // Tone-matched writing — Claude Haiku excellent at tone
  write:     [{ provider: 'anthropic', quality: 'fast' }, { provider: 'openai', quality: 'fast' }],
  // Structured JSON extraction — GPT-4o-mini most reliable for JSON
  extract:   [{ provider: 'openai', quality: 'fast' }, { provider: 'gemini', quality: 'fast' }],
  // Quick trend insights — Gemini Flash fastest latency
  insight:   [{ provider: 'gemini', quality: 'fast' }, { provider: 'openai', quality: 'fast' }, { provider: 'anthropic', quality: 'fast' }]
}

// ── Circuit breaker ───────────────────────────────────────────────────────────

const CIRCUIT: Record<string, { failures: number; openUntil: number }> = {}
const CB_THRESHOLD = 5       // consecutive failures before opening
const CB_RESET_MS  = 60_000  // 1 minute cooldown

function circuitKey(provider: string, quality: string) { return `${provider}:${quality}` }

function isCircuitOpen(provider: string, quality: string): boolean {
  const state = CIRCUIT[circuitKey(provider, quality)]
  if (!state) return false
  if (state.openUntil > Date.now()) return true
  // Auto-reset after cooldown
  Reflect.deleteProperty(CIRCUIT, circuitKey(provider, quality))
  return false
}

function recordFailure(provider: string, quality: string): void {
  const key = circuitKey(provider, quality)
  const state = CIRCUIT[key] ?? { failures: 0, openUntil: 0 }
  state.failures++
  if (state.failures >= CB_THRESHOLD) {
    state.openUntil = Date.now() + CB_RESET_MS
    console.error(`[aiProvider] Circuit open for ${key} for ${CB_RESET_MS / 1000}s`)
  }
  CIRCUIT[key] = state
}

function recordSuccess(provider: string, quality: string): void {
  Reflect.deleteProperty(CIRCUIT, circuitKey(provider, quality))
}

// ── Retry helper ──────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  baseDelayMs = 500
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const isRetryable = err?.status === 429 || (err?.status >= 500 && err?.status < 600)
      if (attempt < retries && isRetryable) {
        await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, attempt)))
        continue
      }
      throw err
    }
  }
  throw new Error('Unreachable')
}

// ── Per-provider callers ──────────────────────────────────────────────────────

async function callAnthropic(params: AiChatParams, quality: AiQuality): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || isCircuitOpen('anthropic', quality)) return null

  const model = process.env.ANTHROPIC_MODEL || CLAUDE_MODELS[quality]
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  try {
    const body: Record<string, unknown> = {
      model,
      max_tokens: params.maxTokens ?? 800,
      messages: params.messages
    }
    if (params.system) body.system = params.system
    if (params.temperature !== undefined) body.temperature = params.temperature

    const result = await withRetry(async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      })
      if (!res.ok) {
        const err = await res.text()
        const error: any = new Error(`Anthropic ${res.status}: ${err}`)
        error.status = res.status
        throw error
      }
      return res.json() as Promise<{ content: Array<{ type: string; text: string }> }>
    })

    recordSuccess('anthropic', quality)
    return result.content?.find(c => c.type === 'text')?.text ?? null
  } catch (err: any) {
    if (err?.name !== 'AbortError') recordFailure('anthropic', quality)
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function callOpenAI(params: AiChatParams, quality: AiQuality): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key || isCircuitOpen('openai', quality)) return null

  const model = process.env.OPENAI_MODEL || OPENAI_MODELS[quality]
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  const systemMessage = params.system
    ? [{ role: 'system' as const, content: params.system }]
    : []

  try {
    const result = await withRetry(async () => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: [...systemMessage, ...params.messages],
          max_tokens: params.maxTokens ?? 800,
          ...(params.temperature !== undefined ? { temperature: params.temperature } : {})
        }),
        signal: controller.signal
      })
      if (!res.ok) {
        const err = await res.text()
        const error: any = new Error(`OpenAI ${res.status}: ${err}`)
        error.status = res.status
        throw error
      }
      return res.json() as Promise<{ choices: Array<{ message: { content: string } }> }>
    })

    recordSuccess('openai', quality)
    return result.choices?.[0]?.message?.content ?? null
  } catch (err: any) {
    if (err?.name !== 'AbortError') recordFailure('openai', quality)
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function callGemini(params: AiChatParams, quality: AiQuality): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key || isCircuitOpen('gemini', quality)) return null

  const model = process.env.GEMINI_MODEL || GEMINI_MODELS[quality]
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  // Build Gemini contents format (system prepended as first user turn)
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []
  if (params.system) {
    contents.push({ role: 'user', parts: [{ text: params.system }] })
    contents.push({ role: 'model', parts: [{ text: 'Understood.' }] })
  }
  for (const m of params.messages) {
    contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })
  }

  try {
    const result = await withRetry(async () => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: params.maxTokens ?? 800,
              ...(params.temperature !== undefined ? { temperature: params.temperature } : {})
            }
          }),
          signal: controller.signal
        }
      )
      if (!res.ok) {
        const err = await res.text()
        const error: any = new Error(`Gemini ${res.status}: ${err}`)
        error.status = res.status
        throw error
      }
      return res.json() as Promise<{ candidates: Array<{ content: { parts: Array<{ text: string }> } }> }>
    })

    recordSuccess('gemini', quality)
    return result.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch (err: any) {
    if (err?.name !== 'AbortError') recordFailure('gemini', quality)
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ── Provider dispatcher ───────────────────────────────────────────────────────

async function callProvider(
  provider: 'anthropic' | 'openai' | 'gemini',
  quality: AiQuality,
  params: AiChatParams
): Promise<{ text: string; model: string } | null> {
  let text: string | null = null

  if (provider === 'anthropic') text = await callAnthropic(params, quality)
  else if (provider === 'openai')    text = await callOpenAI(params, quality)
  else if (provider === 'gemini')    text = await callGemini(params, quality)

  if (!text) return null

  const modelMap = {
    anthropic: CLAUDE_MODELS,
    openai: OPENAI_MODELS,
    gemini: GEMINI_MODELS
  }
  const model = (provider === 'anthropic' && process.env.ANTHROPIC_MODEL)
    || (provider === 'openai' && process.env.OPENAI_MODEL)
    || (provider === 'gemini' && process.env.GEMINI_MODEL)
    || modelMap[provider][quality]

  return { text, model }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Route an AI request to the best available model for the task.
 * Falls through the provider chain until one succeeds.
 */
export async function aiChat(params: AiChatParams): Promise<AiChatResult> {
  const start = Date.now()

  // Build provider chain from task or quality fallback
  let chain: { provider: 'anthropic' | 'openai' | 'gemini'; quality: AiQuality }[]

  if (params.task) {
    chain = TASK_ROUTING[params.task]
  } else {
    // Backward-compatible: quality-only → try all available providers
    const q = params.quality ?? 'smart'
    chain = []
    if (process.env.ANTHROPIC_API_KEY) chain.push({ provider: 'anthropic', quality: q })
    if (process.env.OPENAI_API_KEY)    chain.push({ provider: 'openai',    quality: q })
    if (process.env.GEMINI_API_KEY)    chain.push({ provider: 'gemini',    quality: q })
    if (!chain.length) return { text: null, provider: null, model: null, latencyMs: 0 }
  }

  for (const { provider, quality } of chain) {
    const result = await callProvider(provider, quality, params)
    if (result) {
      return { text: result.text, provider, model: result.model, latencyMs: Date.now() - start }
    }
  }

  return { text: null, provider: null, model: null, latencyMs: Date.now() - start }
}

/**
 * Returns the name of the primary active AI provider for display.
 */
export function activeProviderName(): string {
  if (process.env.ANTHROPIC_API_KEY) return 'claude'
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return 'heuristic'
}

/**
 * Returns which providers are currently configured and their circuit state.
 */
export function providerStatus(): Record<string, { configured: boolean; circuitOpen: boolean }> {
  return {
    anthropic: {
      configured: !!process.env.ANTHROPIC_API_KEY,
      circuitOpen: isCircuitOpen('anthropic', 'smart') || isCircuitOpen('anthropic', 'fast')
    },
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      circuitOpen: isCircuitOpen('openai', 'smart') || isCircuitOpen('openai', 'fast')
    },
    gemini: {
      configured: !!process.env.GEMINI_API_KEY,
      circuitOpen: isCircuitOpen('gemini', 'smart') || isCircuitOpen('gemini', 'fast')
    }
  }
}

