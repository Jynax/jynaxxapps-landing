// Phosphor QWERTY keyboard for the Terminal `tail -f` live widget. The key
// matching the character currently being typed lights up.
//
// SPACEBAR FIX (Task #26 — owns it per the May-16 CHANGELOG; production had no
// keyboard so the fix lands here by construction): the root is
// `display: inline-block` so the component shrink-wraps to its widest key row.
// The spacebar row is `justifyContent: center`, so SPACE centers under the
// keys — not under the full page width, which is what an auto-width block root
// would have caused.

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'] as const

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
        transition: 'none',
        userSelect: 'none',
      }}
    >
      {wide ? '' : label}
    </span>
  )
}

export function PhosphorKeyboard({ activeChar }: { activeChar: string }) {
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
      }}
    >
      {ROWS.map((row, r) => (
        <div
          key={r}
          style={{
            display: 'flex',
            gap: 4,
            marginTop: r === 0 ? 0 : 4,
            // each row indents slightly like a real QWERTY stagger
            paddingLeft: r * 10,
          }}
        >
          {row.split('').map(ch => (
            <Key key={ch} label={ch} lit={active === ch} />
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Key label="SPACE" lit={active === 'SPACE'} wide />
      </div>
    </div>
  )
}
