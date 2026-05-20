import { JX_MANIFESTO } from '../../data/jxData'
import { Prompt } from '../parts/Prompt'
import { useEffect, useState } from 'react'

// Reconciled against canonical terminal.jsx: same box-drawing glyph set
// (╔═╗║╚═╝) and the same .padEnd(48) right-border alignment for the 5
// JX_MANIFESTO rules. MINOR DELIBERATE DEVIATION (reviewed, out of this
// reconciliation's boot-log/help content scope; flagged for PR open-items):
// canonical prints each rule bare; we prefix `1.`–`5.` numbering. Kept as-is.

/**
 * Block 9 — `cat manifesto.txt` boxed ASCII manifesto.
 *
 * Per design-spec-terminal.md "Manifesto box":
 *   - Box-drawing characters ╔═╗║╚═╝
 *   - Each of the 5 JX_MANIFESTO lines padded with .padEnd(48) so the right
 *     border aligns. Do NOT word-wrap (whiteSpace: pre).
 */
const INNER = 48 // padEnd target width
const MOBILE_INNER = 34

function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return defaultValue
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

function wrapRule(line: string, index: number, width: number) {
  const words = `${index + 1}. ${line}`.split(' ')
  const rows: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > width && current) {
      rows.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) rows.push(current)
  return rows
}

function makeBox(inner: number) {
  const top = `╔${'═'.repeat(inner + 2)}╗`
  const bottom = `╚${'═'.repeat(inner + 2)}╝`
  const blank = `║ ${''.padEnd(inner)} ║`

  const rows = JX_MANIFESTO.flatMap((line, i) =>
    wrapRule(line, i, inner).map((row) => `║ ${row.padEnd(inner)} ║`),
  )

  return [top, blank, ...rows, blank, bottom].join('\n')
}

export function ManifestoBox() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const hasMobileBoxRoom = useMediaQuery('(min-width: 360px)', true)
  const desktopBox = makeBox(INNER)
  const mobileBox = makeBox(MOBILE_INNER)

  return (
    <section aria-label="manifesto">
      <Prompt command="cat manifesto.txt" />
      {isDesktop ? (
        <pre
          className="lg:block"
          style={{
            margin: '14px 0 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--term-fg)',
            textShadow: 'var(--term-glow)',
            whiteSpace: 'pre',
            overflowX: 'auto',
          }}
        >
          {desktopBox}
        </pre>
      ) : hasMobileBoxRoom ? (
        <pre
          className="lg:hidden"
          style={{
            margin: '14px 0 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--term-fg-bright)',
            textShadow: 'var(--term-glow)',
            whiteSpace: 'pre',
            overflowX: 'hidden',
          }}
        >
          {mobileBox}
        </pre>
      ) : (
        <div
          className="grid gap-1 lg:hidden"
          style={{
            margin: '14px 0 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            lineHeight: 1.5,
            textShadow: 'var(--term-glow)',
          }}
        >
          {JX_MANIFESTO.map((line, i) => (
            <div key={line} className="flex gap-2">
              <span style={{ color: 'var(--term-fg-dim)' }}>
                rule_{String(i + 1).padStart(2, '0')} ·
              </span>
              <span style={{ color: 'var(--term-fg-bright)' }}>{line}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
