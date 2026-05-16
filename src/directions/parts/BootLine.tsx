// Reconciled against canonical directions/terminal.jsx (provided in handoff). Column width
// of 48 chars matches terminal.jsx's padEnd(48) exactly — confirmed, no divergence.

type BootStatus = 'OK' | 'WARN' | 'FAIL'

interface BootLineProps {
  status: BootStatus
  text: string
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
 * Layout: `[ OK ]  <text>.<dot-leaders>  passed`
 * The text is padded with ASCII dots to a fixed column so right edges align —
 * the "vintage POST" look. Root element carries `data-bootline` for Task 5 e2e.
 * Never word-wraps.
 */
export function BootLine({ status, text }: BootLineProps) {
  const { color, glow, label } = STATUS_STYLE[status]

  // Pad text with dot-leaders to fixed column width
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
