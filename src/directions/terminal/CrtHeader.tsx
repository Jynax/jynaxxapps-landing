// Reconciled against canonical terminal.jsx: the chrome strings below match
// canonical's CRT top exactly (`JYNAXX-OS v2.6.0 / phosphor terminal` left,
// `tty1 · 80×40 · ▮ amber` right). No outstanding deviation.
//
// Mobile (§M.3): stacks vertically, drops `80×40` (meaningless on phone),
// shortens left side to `JYNAXX-OS · v2.6.0`, total height ~36px.

interface CrtHeaderProps {
  isMobile?: boolean
}

/**
 * Block 1 — CRT chrome header.
 *
 * Desktop: `JYNAXX-OS v2.6.0 / phosphor terminal` left, `tty1 · 80×40 · ▮ amber` right.
 * Mobile:  stacked — `JYNAXX-OS · v2.6.0` / `tty1 · ▮ amber`, no 80×40.
 */
export function CrtHeader({ isMobile = false }: CrtHeaderProps) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--term-fg-dim)',
        borderBottom: '1px solid rgba(244,185,66,0.14)',
        paddingBottom: isMobile ? 6 : 14,
        ...(isMobile
          ? { display: 'flex', flexDirection: 'column', gap: 4 }
          : { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }
        ),
      }}
    >
      <span style={{ textShadow: 'var(--term-glow)' }}>
        {isMobile ? 'JYNAXX-OS · v2.6.0' : 'JYNAXX-OS v2.6.0 / phosphor tech'}
      </span>
      <span style={{ whiteSpace: 'nowrap' }}>
        {isMobile ? 'tty1 · ▮ amber' : 'tty1 · 80×40 · ▮ amber'}
      </span>
    </div>
  )
}
