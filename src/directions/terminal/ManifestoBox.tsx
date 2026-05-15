import { JX_MANIFESTO } from '../../data/jxData'
import { Prompt } from '../parts/Prompt'

// RECONCILE: confirm exact box width / glyph set vs directions/terminal.jsx if it
// becomes available. Spec mandates ╔═╗║╚═╝ and .padEnd(48); both honored here.

/**
 * Block 9 — `cat manifesto.txt` boxed ASCII manifesto.
 *
 * Per design-spec-terminal.md "Manifesto box":
 *   - Box-drawing characters ╔═╗║╚═╝
 *   - Each of the 5 JX_MANIFESTO lines padded with .padEnd(48) so the right
 *     border aligns. Do NOT word-wrap (whiteSpace: pre).
 */
const INNER = 48 // padEnd target width

export function ManifestoBox() {
  const top = `╔${'═'.repeat(INNER + 2)}╗`
  const bottom = `╚${'═'.repeat(INNER + 2)}╝`
  const blank = `║ ${''.padEnd(INNER)} ║`

  const rows = JX_MANIFESTO.map((line, i) => `║ ${`${i + 1}. ${line}`.padEnd(INNER)} ║`)

  return (
    <section aria-label="manifesto">
      <Prompt command="cat manifesto.txt" />
      <pre
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
        {[top, blank, ...rows, blank, bottom].join('\n')}
      </pre>
    </section>
  )
}
