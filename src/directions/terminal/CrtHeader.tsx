// Reconciled against canonical terminal.jsx: the chrome strings below match
// canonical's CRT top exactly (`JYNAXX-OS v2.6.0 / phosphor terminal` left,
// `tty1 · 80×40 · ▮ amber` right). No outstanding deviation.

/**
 * Block 1 — CRT chrome header.
 *
 * Per design-spec-terminal.md "Page structure" #1 / canonical terminal.jsx:
 *   left  → `JYNAXX-OS v2.6.0 / phosphor terminal`
 *   right → `tty1 · 80×40 · ▮ amber`
 *
 * Dim chrome color, monospace, uppercase tracking. Not a heading (chrome only).
 */
export function CrtHeader() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 16,
        flexWrap: 'wrap',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--term-fg-dim)',
        borderBottom: '1px solid rgba(244,185,66,0.14)',
        paddingBottom: 14,
      }}
    >
      <span style={{ textShadow: 'var(--term-glow)' }}>
        JYNAXX-OS v2.6.0 / phosphor terminal
      </span>
      <span style={{ whiteSpace: 'nowrap' }}>
        tty1 · 80×40 · ▮ amber
      </span>
    </div>
  )
}
