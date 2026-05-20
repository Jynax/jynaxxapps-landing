// DELIBERATE DEVIATION FROM CANONICAL — reviewed, kept on purpose.
// Canonical terminal.jsx renders the JYNAXX wordmark as a literal multi-line
// box-drawing glyph block (██╗██╗ … art) inside a <pre>. We instead render a
// large VT323 web-font wordmark as the single <h1>. Why: our build is a
// semantic/web-font React app — a baked ASCII-art <pre> is not a heading, hurts
// a11y/SEO, breaks across narrow viewports, and depends on glyph metrics. The
// VT323 wordmark preserves the drawn-letter terminal feel while staying a real
// <h1>. The subtitle `// a workshop for digital machines · MMXXVI` matches canonical.
//
// Mobile (§M.2): 22px — single line at ≥360px. Desktop: clamp(72px, 13vw, 132px).

interface AsciiTitleProps {
  isMobile?: boolean
}

/**
 * Block 2 — ASCII title.
 *
 * Per design-spec-terminal.md #2 + Typography table:
 *   - Big drawn-letter `JYNAXX` wordmark in VT323 (`--font-vt`)
 *   - Subtitle `// a workshop for digital machines · MMXXVI`
 *
 * Semantic: the wordmark is the page's single <h1> (visually ASCII-styled).
 * The two `xx` are treated as a graphic device per brand.md "Wordmark"
 * (rendered in --term-fg-bright, tight-tracked).
 */
export function AsciiTitle({ isMobile = false }: AsciiTitleProps) {
  return (
    <div>
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-vt)',
          fontWeight: 400,
          fontSize: isMobile ? 22 : 'clamp(72px, 13vw, 132px)',
          lineHeight: 0.92,
          letterSpacing: '0.02em',
          color: 'var(--term-fg)',
          textShadow: 'var(--term-glow-strong)',
          textTransform: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        JYNA
        <span
          style={{
            color: 'var(--term-fg-bright)',
            letterSpacing: '-0.04em',
          }}
        >
          XX
        </span>
      </h1>
      <p
        style={{
          margin: '10px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          letterSpacing: '0.06em',
          color: 'var(--term-fg-dim)',
          textShadow: 'var(--term-glow)',
        }}
      >
        // a workshop for digital machines · MMXXVI
      </p>
    </div>
  )
}
