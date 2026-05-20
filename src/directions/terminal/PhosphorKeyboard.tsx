// Phosphor QWERTY keyboard for the Terminal `tail -f` live widget. The key
// matching the character currently being typed lights up.
//
// SPACEBAR FIX (Task #26 — owns it per the May-16 CHANGELOG; production had no
// keyboard so the fix lands here by construction): the root is
// `display: inline-block` so the component shrink-wraps to its widest key row.
// The spacebar row is `justifyContent: center`, so SPACE centers under the
// keys — not under the full page width, which is what an auto-width block root
// would have caused.

// Canonical 4-row layout (May-16 reference terminal.jsx:361-366): number row +
// punctuation, with the real QWERTY per-row stagger. Letters are kept
// upper-cased to match the shipped phosphor display; `normalize()` upper-cases
// the active char so digits/punctuation match too. Audit MISS #1: the shipped
// keyboard had only 3 letter rows, so digits/punctuation in the live activity
// (e.g. "2.1", "7s") lit no key.
const ROWS = [
  { keys: '1234567890-=', offset: 0 },
  { keys: 'QWERTYUIOP', offset: 10 },
  { keys: 'ASDFGHJKL;', offset: 18 },
  { keys: 'ZXCVBNM,./', offset: 28 },
] as const

function normalize(ch: string): string {
  if (ch === ' ') return 'SPACE'
  return ch.toUpperCase()
}

function Key({ label, lit, wide }: { label: string; lit: boolean; wide?: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-key={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: wide ? 132 : 22,
        height: 22,
        padding: wide ? '0 10px' : 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        lineHeight: 1,
        color: lit ? 'var(--term-bg)' : 'var(--term-fg-dim)',
        background: lit ? 'var(--term-fg-bright)' : 'transparent',
        border: `1px solid ${lit ? 'var(--term-fg-bright)' : 'rgba(244,185,66,0.22)'}`,
        boxShadow: lit ? 'var(--term-glow-strong)' : 'none',
        // CRT phosphor afterglow: a struck key snaps bright instantly
        // (transition none while lit), then DECAYS back down over ~450ms when
        // the type-out moves on. The text and the lit key share one counter
        // (LiveNow `shown`) so they advance at the same rate — the decay just
        // makes the keyboard READ at the text's cadence instead of snapping
        // ~2x faster to the eye. Reduced motion: the global tokens.css
        // `prefers-reduced-motion` rule forces transition-duration:0s → frozen.
        transition: lit
          ? 'none'
          : 'color 450ms ease-out, background-color 450ms ease-out, border-color 450ms ease-out, box-shadow 450ms ease-out',
        userSelect: 'none',
      }}
    >
      {wide ? '' : label}
    </span>
  )
}

export function PhosphorKeyboard({
  activeChar,
  onOpenPuzzle,
}: {
  activeChar:     string
  onOpenPuzzle?: () => void
}) {
  const active = activeChar ? normalize(activeChar) : ''

  return (
    <div
      data-phosphor-keyboard
      aria-hidden="true"
      style={{
        display: 'inline-block', // shrink-wrap — spacebar fix anchor
        marginTop: 14,
        padding: 10,
        border: '1px solid rgba(244,185,66,0.16)',
        background: 'rgba(244,185,66,0.03)',
        position: 'relative',
      }}
    >
      {ROWS.map((row, r) => (
        <div
          key={r}
          style={{
            display: 'flex',
            gap: 4,
            marginTop: r === 0 ? 0 : 4,
            // canonical per-row QWERTY stagger
            paddingLeft: row.offset,
          }}
        >
          {row.keys.split('').map(ch => (
            <Key key={ch} label={ch} lit={active === ch} />
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Key label="SPACE" lit={active === 'SPACE'} wide />
      </div>

      {/* Hidden daily puzzle trigger — dim ? at bottom-right of the keyboard */}
      {onOpenPuzzle && (
        <button
          type="button"
          aria-hidden="false"
          aria-label="Open daily word puzzle"
          data-trace-open
          onClick={onOpenPuzzle}
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            width: 18,
            height: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            lineHeight: 1,
            color: 'var(--term-fg-dim)',
            background: 'transparent',
            border: '1px solid rgba(244,185,66,0.22)',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'color 200ms, border-color 200ms, box-shadow 200ms',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget
            b.style.color = 'var(--term-fg-bright)'
            b.style.borderColor = 'var(--term-fg-bright)'
            b.style.boxShadow = 'var(--term-glow)'
          }}
          onMouseLeave={e => {
            const b = e.currentTarget
            b.style.color = 'var(--term-fg-dim)'
            b.style.borderColor = 'rgba(244,185,66,0.22)'
            b.style.boxShadow = 'none'
          }}
        >
          ?
        </button>
      )}
    </div>
  )
}
