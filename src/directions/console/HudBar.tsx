import { useTicker } from '../parts/useTicker'
import { CON } from './accents'

// Sticky HUD top bar — section 1 of design-spec-console.md "Page structure".
// Left: signal-bars decorative icon + `JX·OPS · console v2.6`.
// Center-right: 3 tickers (sessions/lines/commits) via useTicker.
//   Seeds are canonical (console.jsx: 1247 / 284103 / 612).
//   RECONCILE: console.jsx rates (sessions 0.07, lines 1.8, commits 0.02) are
//   per-second; with useTicker's formula `seed + floor(elapsedMs*rate/1000)`
//   the sessions ticker would take ~14s to advance by 1, but the binding e2e
//   contract (e2e/console.spec.ts) requires `data-ticker="sessions"` to
//   increment within 1400ms. The Step-1 test contract is immutable and these
//   values are explicitly decorative placeholders (open-decisions 3(a)), so
//   the visible rates are scaled up so each ticker advances within the test
//   window while keeping the canonical seeds and "alive on reload" semantics.
// Right: `● ONLINE`.

// Visible rates: each must clear ≥1 unit within the 600ms interval + 1400ms
// test wait. floor(2000ms * rate / 1000) ≥ 1  →  rate ≥ 0.5. Reference rate
// ordering preserved (lines fastest, commits slowest).
const RATE_SESSIONS = 3
const RATE_LINES = 90
const RATE_COMMITS = 1

const mono = { fontFamily: 'var(--font-mono)' }

function SignalBars() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
      <rect x="0" y="10" width="3" height="4" fill={CON.amber} />
      <rect x="5" y="6" width="3" height="8" fill={CON.amber} />
      <rect x="10" y="3" width="3" height="11" fill={CON.amber} />
      <rect x="15" y="0" width="3" height="14" fill={CON.amber} />
    </svg>
  )
}

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

function HudStat({
  tickerKey,
  label,
  value,
}: {
  tickerKey: string
  label: string
  value: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span
        style={{
          ...mono,
          fontSize: 10,
          color: CON.dim,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        data-ticker={tickerKey}
        style={{ ...mono, fontSize: 13, color: CON.ink, fontWeight: 500 }}
      >
        {fmt(value)}
      </span>
    </div>
  )
}

export function HudBar() {
  const sessions = useTicker(1247, RATE_SESSIONS)
  const lines = useTicker(284103, RATE_LINES)
  const commits = useTicker(612, RATE_COMMITS)

  return (
    <div
      style={{
        padding: '14px 48px',
        borderBottom: `1px solid ${CON.line}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
        background: `${CON.bg}EE`,
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <SignalBars />
        <span
          style={{
            ...mono,
            fontSize: 11,
            color: CON.mid,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: CON.amber }}>JX</span>·OPS · console v2.6
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <HudStat tickerKey="sessions" label="sess." value={sessions} />
        <HudStat tickerKey="lines" label="lines" value={lines} />
        <HudStat tickerKey="commits" label="comm." value={commits} />
        <span style={{ ...mono, fontSize: 11, color: CON.sage, letterSpacing: '0.16em' }}>
          ● ONLINE
        </span>
      </div>
    </div>
  )
}
