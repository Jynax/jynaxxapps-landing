import { useTicker } from '../parts/useTicker'
import { useMediaQuery } from '../parts/useMediaQuery'
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
//
// Mobile (< 1024px): slim 44px bar — signal-bars + `JX·OPS`, `● ONLINE` only.
//   `console v2.6` dropped. Tickers move to a strip below the hero; only one
//   HudCounters instance mounts per breakpoint (Playwright strict mode requires
//   exactly one [data-ticker] per key — console.spec.ts).

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

// HudCounters — the 3 live ticker counters.
// Exported so Console.tsx can mount the mobile strip below <Hero /> while the
// desktop HudBar renders it inline. EXACTLY ONE instance must exist in the DOM
// at any given viewport — the e2e test uses Playwright strict locators on
// [data-ticker="sessions|lines|commits"] and will fail on duplicate nodes.
// Console.tsx and HudBar each guard their render with the same isDesktop flag.
export function HudCounters({ strip = false }: { strip?: boolean }) {
  const sessions = useTicker(1247, RATE_SESSIONS)
  const lines = useTicker(284103, RATE_LINES)
  const commits = useTicker(612, RATE_COMMITS)

  if (strip) {
    // Mobile strip below hero: `sessions {n} ↑ · lines {n} ↑ · commits {n} ↑`
    // mono 11px, dim color, full fmt() numbers (not abbreviated — e2e contract).
    return (
      <div
        style={{
          padding: '8px 16px 14px',
          ...mono,
          fontSize: 11,
          color: CON.dim,
          letterSpacing: '0.14em',
          lineHeight: 1,
        }}
      >
        <span>sessions </span>
        <span data-ticker="sessions">{fmt(sessions)}</span>
        <span style={{ color: CON.amber, margin: '0 2px' }}> ↑</span>
        <span style={{ color: CON.line }}> · </span>
        <span>lines </span>
        <span data-ticker="lines">{fmt(lines)}</span>
        <span style={{ color: CON.amber, margin: '0 2px' }}> ↑</span>
        <span style={{ color: CON.line }}> · </span>
        <span>commits </span>
        <span data-ticker="commits">{fmt(commits)}</span>
        <span style={{ color: CON.amber, margin: '0 2px' }}> ↑</span>
      </div>
    )
  }

  // Desktop: inline inside HudBar's right-side flex container
  return (
    <>
      <HudStat tickerKey="sessions" label="sess." value={sessions} />
      <HudStat tickerKey="lines" label="lines" value={lines} />
      <HudStat tickerKey="commits" label="comm." value={commits} />
    </>
  )
}

export function HudBar() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div
      style={{
        padding: isDesktop ? '14px 48px' : '0 16px',
        height: isDesktop ? undefined : 44,
        borderBottom: `1px solid ${CON.line}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 24,
        flexWrap: isDesktop ? 'wrap' : 'nowrap',
        background: `${CON.bg}EE`,
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxSizing: 'border-box',
      }}
    >
      {/* Left: signal-bars + JX·OPS (+ console v2.6 desktop only) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
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
          <span style={{ color: CON.amber }}>JX</span>
          {isDesktop ? '·OPS · console v2.6' : '·OPS'}
        </span>
      </div>

      {/* Right: tickers (desktop only) + ONLINE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: isDesktop ? 'wrap' : 'nowrap', flexShrink: 0 }}>
        {isDesktop && <HudCounters />}
        <span style={{ ...mono, fontSize: 11, color: CON.sage, letterSpacing: '0.16em' }}>
          ● ONLINE
        </span>
      </div>
    </div>
  )
}
