/**
 * Open Graph Image Generator
 * Generates real 1200×630 PNG images using satori (SVG) + @resvg/resvg-js (PNG).
 * Usage: /api/og?title=My+Title&category=CRM&subtitle=Custom+subtitle&theme=dark
 */
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Font cache — loaded once per process lifetime
let fontCache: ArrayBuffer | null = null

async function getFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache
  const candidates = [
    join(process.cwd(), 'assets/fonts/Inter-Bold.ttf'),
    join(process.cwd(), 'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff'),
    join(process.cwd(), 'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
  ]
  for (const p of candidates) {
    try {
      const buf = await readFile(p)
      fontCache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
      return fontCache
    } catch { /* try next */ }
  }
  throw new Error('No font file found for OG image generation')
}

// Theme palette
const THEMES: Record<string, { bg: string; accent: string; text: string; sub: string }> = {
  default: { bg: '#0f172a', accent: '#3b82f6', text: '#f8fafc', sub: '#94a3b8' },
  dark:    { bg: '#0f172a', accent: '#3b82f6', text: '#f8fafc', sub: '#94a3b8' },
  light:   { bg: '#f8fafc', accent: '#1d4ed8', text: '#0f172a', sub: '#475569' },
  purple:  { bg: '#1e1b4b', accent: '#818cf8', text: '#f8fafc', sub: '#a5b4fc' },
  green:   { bg: '#052e16', accent: '#22c55e', text: '#f8fafc', sub: '#86efac' },
}

export default defineEventHandler(async (event) => {
  const q        = getQuery(event)
  const title    = ((q.title    as string | undefined) ?? 'Moonmart').slice(0, 80)
  const category = (q.category  as string | undefined)?.slice(0, 40)
  const subtitle = ((q.subtitle as string | undefined) ?? 'Discover and compare the best business software').slice(0, 120)
  const theme    = THEMES[(q.theme as string) ?? ''] ?? THEMES.default

  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=604800')
  setHeader(event, 'Content-Type', 'image/png')

  try {
    const font = await getFont()

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            background: theme.bg,
            padding: '60px 72px',
            fontFamily: 'Inter',
          },
          children: [
            // ── Logo row ───────────────────────────────────────────────────
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', marginBottom: '48px' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '28px', fontWeight: '700', color: theme.accent, letterSpacing: '-0.5px' },
                      children: 'Moonmart',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { flex: '1', height: '2px', background: theme.accent, marginLeft: '24px', opacity: '0.25' },
                    },
                  },
                ],
              },
            },

            // ── Category pill (optional) ───────────────────────────────────
            ...(category
              ? [{
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignSelf: 'flex-start',
                      background: theme.accent,
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '700',
                      padding: '8px 20px',
                      borderRadius: '9999px',
                      marginBottom: '28px',
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                    },
                    children: category,
                  },
                }]
              : []),

            // ── Main title ─────────────────────────────────────────────────
            {
              type: 'div',
              props: {
                style: {
                  flex: '1',
                  fontSize: title.length > 40 ? '52px' : '68px',
                  fontWeight: '700',
                  color: theme.text,
                  lineHeight: '1.15',
                  letterSpacing: '-1.5px',
                },
                children: title,
              },
            },

            // ── Bottom row: subtitle + domain ──────────────────────────────
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '32px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '22px', color: theme.sub, maxWidth: '820px', lineHeight: '1.4' },
                      children: subtitle,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '18px', color: theme.sub, opacity: '0.5', whiteSpace: 'nowrap' },
                      children: 'moonmart.ai',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }],
      }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    return resvg.render().asPng()

  } catch (err) {
    console.error('[og] PNG generation failed:', err)
    // 1×1 transparent PNG fallback so <meta og:image> never returns a 500
    const { Buffer } = await import('node:buffer')
    return Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
  }
})
