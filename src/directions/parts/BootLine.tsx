// Reconciled against canonical directions/terminal.jsx (provided in handoff). Column width
// of 48 chars matches terminal.jsx's padEnd(48) exactly — confirmed, no divergence.

type BootStatus = 'OK' | 'WARN' | 'FAIL'

interface BootLineProps {
  status: BootStatus
  text: string
  /** Mobile rendering: 12.5px, pre-wrap, hanging-indent, no dot-padding. */
  mobile?: boolean
}

/** Maps a status to its token color and glow. */
const STATUS_STYLE: Record<BootStatus, { color: string; glow: string; label: string }> = {
  OK:   { color: 'var(--term-accent)', glow: '0 0 6px rgba(134,194,107,0.5)', label: '[ OK ]' },
  WARN: { color: 'var(--term-warn)',   glow: '0 0 6px rgba(244,185,66,0.5)',   label: '[WARN]' },
  FAIL: { color: 'var(--term-danger)', glow: '0 0 6px rgba(224,120,86,0.5)',   label: '[FAIL]' },
}

/** Fixed column width for the text + dot-leader area (chars). */
const TEXT_COLUMN = 48

/**
 * One boot-log row (per design-spec-terminal.md "Boot log entry").
 *
 * Desktop: `[ OK ]  <text>.<dot-leaders>  passed` — dot-padded to TEXT_COLUMN,
 * never wraps. Mobile (§M.4): no dot-padding, 12.5px, pre-wrap with 8-char
 * hanging indent so continuation lines align with the text content.
 * Root element carries `data-bootline` for e2e.
 */
export function BootLine({ status, text, mobile = false }: BootLineProps) {
  const { color, glow, label } = STATUS_STYLE[status]

  if (mobile) {
    // Mobile: no dot-leaders; wrap allowed; 8ch hanging indent aligns continuation
    // lines with the content start (after the 8-char `[ OK ] ` prefix).
    return (
      <div
        data-bootline
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          lineHeight: 1.6,
          paddingLeft: '8ch',
          textIndent: '-8ch',
        }}
      >
        <span style={{ color, textShadow: glow }}>{label}</span>
        {' '}
        <span style={{ color: 'var(--term-fg-dim)' }}>{text}</span>
      </div>
    )
  }

  // Desktop: dot-pad text to fixed column width (vintage POST look)
  const dotPadded = text.length >= TEXT_COLUMN
    ? text
    : text + ' ' + '.'.repeat(Math.max(0, TEXT_COLUMN - text.length - 1))

  return (
    <div
      data-bootline
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        lineHeight: 1.6,
        display: 'flex',
        gap: '0.75em',
      }}
    >
      {/* Status tag */}
      <span
        style={{
          color,
          textShadow: glow,
          flexShrink: 0,
        }}
      >
        {label}
      </span>

      {/* Dot-leader padded text */}
      <span style={{ color: 'var(--term-fg-dim)' }}>
        {dotPadded}
      </span>
    </div>
  )
}
