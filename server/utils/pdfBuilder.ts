/**
 * Minimal raw-PDF builder — no external dependencies.
 * Generates A4 PDFs using built-in Type1 fonts (Helvetica family).
 *
 * Coordinate system: origin = bottom-left, y increases upward.
 * A4 = 595 × 842 points.
 */

const A4_W = 595
const A4_H = 842
const MARGIN = 56

/** Escape PDF string: backslash and parens must be escaped */
function esc(s: string): string {
  // Char-by-char to avoid complex escape sequences
  const map: Record<string, string> = { '\\': '\\\\', '(': '[(]'.slice(1, -1).replace(/\[|\]/g, ''), ')': '[)]'.slice(1, -1).replace(/\[|\]/g, '') }
  return [...s].map(ch => map[ch] ?? ch).join('')
}

export interface PdfLine {
  font?: 'regular' | 'bold'
  size?: number
  x?: number
  y: number
  text: string
  color?: [number, number, number]  // rgb 0–1
}

export interface PdfHRule {
  y: number
  x1?: number
  x2?: number
  width?: number
  color?: [number, number, number]
}

export interface PdfRect {
  x: number
  y: number
  w: number
  h: number
  fill?: [number, number, number]
  stroke?: [number, number, number]
  lineWidth?: number
}

export interface PdfDoc {
  lines: PdfLine[]
  hrules: PdfHRule[]
  rects: PdfRect[]
}

/** Build a minimal valid PDF binary from a PdfDoc description */
/** Render rectangle ops */
function rectOps(r: PdfRect): string[] {
  const out: string[] = []
  if (r.fill) {
    out.push(`${r.fill[0]} ${r.fill[1]} ${r.fill[2]} rg`)
    out.push(`${r.x} ${r.y} ${r.w} ${r.h} re f`)
  }
  if (r.stroke) {
    out.push(`${r.stroke[0]} ${r.stroke[1]} ${r.stroke[2]} RG`)
    out.push(`${r.lineWidth ?? 0.5} w`)
    out.push(`${r.x} ${r.y} ${r.w} ${r.h} re S`)
  }
  return out
}

/** Render horizontal rule ops */
function hruleOps(hr: PdfHRule): string[] {
  const x1 = hr.x1 ?? MARGIN
  const x2 = hr.x2 ?? (A4_W - MARGIN)
  const c = hr.color ?? [0.85, 0.85, 0.85]
  return [`${c[0]} ${c[1]} ${c[2]} RG`, `${hr.width ?? 0.5} w`, `${x1} ${hr.y} m ${x2} ${hr.y} l S`]
}

/** Render a group of text lines sharing the same font/size/color */
function textGroupOps(group: PdfLine[]): string[] {
  const first = group[0]
  const font = first.font === 'bold' ? 'F2' : 'F1'
  const size = first.size ?? 10
  const c = first.color ?? [0.12, 0.12, 0.12]
  const out: string[] = ['BT', `/${font} ${size} Tf`, `${c[0]} ${c[1]} ${c[2]} rg`]
  for (const l of group) {
    const x = l.x ?? MARGIN
    out.push(`${x} ${l.y} Td`)
    out.push(`(${esc(l.text)}) Tj`)
    out.push(`${-x} ${-l.y} Td`)
  }
  out.push('ET')
  return out
}

/** Group consecutive lines that share the same font, size, and have no per-line color override */
function groupLines(lines: PdfLine[]): PdfLine[][] {
  const grouped: PdfLine[][] = []
  let cur: PdfLine[] = []
  let lastFont = ''
  let lastSize = 0
  for (const l of lines) {
    const font = l.font === 'bold' ? 'F2' : 'F1'
    const size = l.size ?? 10
    if (font !== lastFont || size !== lastSize || l.color) {
      if (cur.length) grouped.push(cur)
      cur = [l]
      lastFont = font
      lastSize = size
    } else {
      cur.push(l)
    }
  }
  if (cur.length) grouped.push(cur)
  return grouped
}

export function buildPdf(doc: PdfDoc): Buffer {
  const ops: string[] = []

  for (const r of doc.rects) ops.push(...rectOps(r))
  for (const hr of doc.hrules) ops.push(...hruleOps(hr))
  for (const group of groupLines(doc.lines)) ops.push(...textGroupOps(group))

  const stream = ops.join('\n')
  const streamBytes = Buffer.from(stream, 'latin1')
  const streamLen = streamBytes.length

  // Build PDF objects
  // Object 1: Catalog
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  // Object 2: Pages
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
  // Object 3: Page
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_W} ${A4_H}]\n   /Contents 4 0 R\n   /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`
  // Object 4: Content stream
  const obj4 = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n`
  const obj4End = '\nendstream\nendobj\n'
  // Object 5: Helvetica (regular)
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'
  // Object 6: Helvetica-Bold
  const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'

  const header = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'

  // Compute byte offsets for xref table
  const headerBuf = Buffer.from(header, 'binary')
  const obj1Buf = Buffer.from(obj1, 'binary')
  const obj2Buf = Buffer.from(obj2, 'binary')
  const obj3Buf = Buffer.from(obj3, 'binary')
  const obj4StartBuf = Buffer.from(obj4, 'binary')
  const streamBuf = streamBytes
  const obj4EndBuf = Buffer.from(obj4End, 'binary')
  const obj5Buf = Buffer.from(obj5, 'binary')
  const obj6Buf = Buffer.from(obj6, 'binary')

  const off1 = headerBuf.length
  const off2 = off1 + obj1Buf.length
  const off3 = off2 + obj2Buf.length
  const off4 = off3 + obj3Buf.length
  const off5 = off4 + obj4StartBuf.length + streamBuf.length + obj4EndBuf.length
  const off6 = off5 + obj5Buf.length
  const xrefOff = off6 + obj6Buf.length

  const xref = [
    'xref\n',
    '0 7\n',
    '0000000000 65535 f \n',
    `${String(off1).padStart(10, '0')} 00000 n \n`,
    `${String(off2).padStart(10, '0')} 00000 n \n`,
    `${String(off3).padStart(10, '0')} 00000 n \n`,
    `${String(off4).padStart(10, '0')} 00000 n \n`,
    `${String(off5).padStart(10, '0')} 00000 n \n`,
    `${String(off6).padStart(10, '0')} 00000 n \n`,
  ].join('')

  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOff}\n%%EOF\n`

  return Buffer.concat([
    headerBuf,
    obj1Buf,
    obj2Buf,
    obj3Buf,
    obj4StartBuf,
    streamBuf,
    obj4EndBuf,
    obj5Buf,
    obj6Buf,
    Buffer.from(xref + trailer, 'binary'),
  ])
}

/**
 * Helper: measure approximate text width at size pts using Helvetica metrics.
 * Uses simple per-character width table (good enough for layout).
 */
const _HV_WIDTHS: Record<string, number> = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556,
  '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556,
  '@': 1015, 'A': 667, 'B': 667, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778,
  'H': 722, 'I': 278, 'J': 500, 'K': 667, 'L': 556, 'M': 833, 'N': 722, 'O': 778,
  'P': 667, 'Q': 778, 'R': 722, 'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944,
  'X': 667, 'Y': 667, 'Z': 611, '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556,
  '`': 333, 'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556, 'f': 278, 'g': 556,
  'h': 556, 'i': 222, 'j': 222, 'k': 500, 'l': 222, 'm': 833, 'n': 556, 'o': 556,
  'p': 556, 'q': 556, 'r': 333, 's': 500, 't': 278, 'u': 556, 'v': 500, 'w': 722,
  'x': 500, 'y': 500, 'z': 500, '{': 334, '|': 260, '}': 334, '~': 584,
}
const _AVG_WIDTH = 500

export function textWidth(text: string, size: number): number {
  let w = 0
  for (const ch of text) {
    w += (_HV_WIDTHS[ch] ?? _AVG_WIDTH)
  }
  return (w / 1000) * size
}

/** Right-align text: compute x so the text ends at `endX` */
export function rightAlignX(text: string, size: number, endX: number): number {
  return endX - textWidth(text, size)
}
