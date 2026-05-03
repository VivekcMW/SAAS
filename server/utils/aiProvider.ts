/**
 * Unified AI provider utility
 * Priority: Anthropic (Claude) if ANTHROPIC_API_KEY is set, else OpenAI.
 *
 * Usage:
 *   const { text, provider } = await aiChat({ system: '...', messages: [...], maxTokens: 600 })
 *   if (!text) { /* use heuristic fallback *\/ }
 */

export type AiMessage = { role: 'user' | 'assistant'; content: string }
export type AiQuality = 'fast' | 'smart'

interface AiChatParams {
  messages: AiMessage[]
  system?: string
  maxTokens?: number
  temperature?: number
  /** 'smart' → most capable model; 'fast' → cheaper/faster model */
  quality?: AiQuality
}

interface AiChatResult {
  text: string | null
  provider: 'anthropic' | 'openai' | null
}

/** Claude model mapping */
const CLAUDE_MODELS: Record<AiQuality, string> = {
  smart: 'claude-opus-4-5',
  fast: 'claude-haiku-3-5'
}

/** OpenAI model mapping */
const OPENAI_MODELS: Record<AiQuality, string> = {
  smart: 'gpt-4o',
  fast: 'gpt-4o-mini'
}

/**
 * Call Anthropic Messages API.
 * https://docs.anthropic.com/en/api/messages
 */
async function callAnthropic(params: AiChatParams): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const quality = params.quality ?? 'smart'
  const model = process.env.ANTHROPIC_MODEL || CLAUDE_MODELS[quality]

  try {
    const body: Record<string, unknown> = {
      model,
      max_tokens: params.maxTokens ?? 800,
      messages: params.messages
    }
    if (params.system) body.system = params.system
    if (params.temperature !== undefined) body.temperature = params.temperature

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`[aiProvider] Anthropic error ${res.status}:`, err)
      return null
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> }
    return data.content?.find(c => c.type === 'text')?.text ?? null
  }
  catch (err) {
    console.error('[aiProvider] Anthropic call failed:', err)
    return null
  }
}

/**
 * Call OpenAI Chat Completions API.
 */
async function callOpenAI(params: AiChatParams): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null

  const quality = params.quality ?? 'smart'
  const model = process.env.OPENAI_MODEL || OPENAI_MODELS[quality]

  const systemMessage = params.system
    ? [{ role: 'system' as const, content: params.system }]
    : []

  try {
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
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`[aiProvider] OpenAI error ${res.status}:`, err)
      return null
    }

    const data = await res.json() as { choices: Array<{ message: { content: string } }> }
    return data.choices?.[0]?.message?.content ?? null
  }
  catch (err) {
    console.error('[aiProvider] OpenAI call failed:', err)
    return null
  }
}

/**
 * Unified AI chat call.
 * Tries Anthropic first; falls back to OpenAI.
 * Returns { text: null, provider: null } if neither key is configured.
 */
export async function aiChat(params: AiChatParams): Promise<AiChatResult> {
  // Anthropic-first
  if (process.env.ANTHROPIC_API_KEY) {
    const text = await callAnthropic(params)
    if (text) return { text, provider: 'anthropic' }
  }

  // OpenAI fallback
  if (process.env.OPENAI_API_KEY) {
    const text = await callOpenAI(params)
    if (text) return { text, provider: 'openai' }
  }

  return { text: null, provider: null }
}

/**
 * Returns the name of the active AI provider for display in responses.
 */
export function activeProviderName(): string {
  if (process.env.ANTHROPIC_API_KEY) return 'claude'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return 'heuristic'
}
