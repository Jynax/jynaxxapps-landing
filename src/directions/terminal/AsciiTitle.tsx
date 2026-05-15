// RECONCILE: confirm exact drawn-letter glyph block vs directions/terminal.jsx if it
// becomes available. The spec says "drawn-letter JYNAXX block"; this is text-only by
// design, so a large VT323 stylized wordmark is the sanctioned stand-in.

/**
 * Block 2 — ASCII title.
 *
 * Per design-spec-terminal.md #2 + Typography table:
 *   - Big drawn-letter `JYNAXX` wordmark in VT323 (`--font-vt`)
 *   - Subtitle `// a workshop on the internet · MMXXVI`
 *
 * Semantic: the wordmark is the page's single <h1> (visually ASCII-styled).
 * The two `xx` are treated as a graphic device per brand.md "Wordmark"
 * (rendered in --term-fg-bright, tight-tracked).
 */
export function AsciiTitle() {
  return (
    <div>
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-vt)',
          fontWeight: 400,
          // VT323 reads small per its metrics; scale the banner up so it
          // reads as the big drawn-letter wordmark the spec calls for.
          fontSize: 'clamp(72px, 13vw, 132px)',
          lineHeight: 0.92,
          letterSpacing: '0.02em',
          color: 'var(--term-fg)',
          textShadow: 'var(--term-glow-strong)',
          textTransform: 'none',
          userSelect: 'none',
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
        // a workshop on the internet · MMXXVI
      </p>
    </div>
  )
}
