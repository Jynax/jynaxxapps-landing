import { useEffect, useState } from 'react'
import { useLiveFeed } from '../parts/useLiveFeed'
import { useReducedMotion } from '../parts/useReducedMotion'
import { CON } from './accents'
import { useMediaQuery } from '../parts/useMediaQuery'

// Section 3 — Signal · Live Feed, a faithful port of the canonical
// `ConsoleLiveFeed` (May-16 reference `directions/console.jsx`). Task #27
// replaced the #26 "operator console rework" (single LED + static waveform +
// sweeping <animate> beam) which had silently diverged from the delivered
// design (audit MISS #2/#3/#4 + the owner's oscilloscope request).
//
// The wave is a soft sine with a localized spike-burst that FLOWS — a React
// interval re-derives the SVG path each tick (no SVG <animate>; the wave
// itself is the only motion). Per the owner's request the flow runs at 40% of
// the canonical speed (canonical 40ms tick → 100ms). Reduced motion does not
// start the interval, so the path is frozen (phase 0) — honoring the round's
// reduced-motion requirement without an <animate> node, and keeping
// [data-signal-scope] OUTSIDE [data-project-art] so the #24 art-animate
// contract (console.spec.ts) is untouched.
//
// Task #30 reverses Decision 8.3 #3 (single-entry): the feed is again a
// rotating set, so the canonical SIGNAL META 4th line `rotate 7s` is now
// truthful and is rendered as such when the set has >1 entry (and `single`
// when only one is live — staying honest per feedback_data_integrity_hard_line).
//
// Task #55: mobile branch (<1024px) stacks the three inner columns vertically
// and turns the STATE LED column into a horizontal row. Desktop rendering is
// unchanged.

const mono = { fontFamily: 'var(--font-mono)' }

// Canonical wave geometry (console.jsx ConsoleLiveFeed): soft primary sine +
// gentle high-frequency ripple + a stationary sharp spike-burst at ~55–62%.
const W = 360
const H = 60

function buildWavePath(phase: number): string {
  const points: string[] = []
  for (let x = 0; x <= W; x += 4) {
    const t0 = (x / W) * Math.PI * 4 + phase / 60
    const spike =
      x > W * 0.55 && x < W * 0.62
        ? Math.sin((x - W * 0.55) * 0.8) * 14
        : 0
    const y = H / 2 + Math.sin(t0) * 8 + Math.sin(t0 * 3.2) * 3 + spike
    points.push(`${x},${y.toFixed(2)}`)
  }
  return `M ${points.join(' L ')}`
}

function StatusLed({
  color,
  label,
  pulse,
  reduced,
}: {
  color: string
  label: string
  pulse?: boolean
  reduced: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          background: color,
          boxShadow: `0 0 8px ${color}AA`,
          animation: pulse && !reduced ? 'jxConLedPulse 1.4s ease-in-out infinite' : 'none',
        }}
      />
      <span
        style={{
          ...mono,
          fontSize: 10,
          color: CON.mid,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function ReadoutLine({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: `1px dashed ${CON.line}`,
        paddingBottom: 4,
      }}
    >
      <span
        style={{
          ...mono,
          fontSize: 10,
          color: CON.dim,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {k}
      </span>
      <span style={{ ...mono, fontSize: 11, color: CON.ink }}>{v}</span>
    </div>
  )
}

export function SignalPanel() {
  const reduced = useReducedMotion()
  const feed = useLiveFeed()
  const [phase, setPhase] = useState(0)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setPhase(p => (p + 1) % 360), 100)
    return () => clearInterval(id)
  }, [reduced])

  const pathD = buildWavePath(phase)
  const channel = `${(feed.index + 1).toString().padStart(2, '0')}/${feed.total
    .toString()
    .padStart(2, '0')}`
  const tag = `${feed.since.toUpperCase()}  ·  CH 01  ·  ${channel}  ·  ${feed.watchers} WATCHING`

  return (
    <div style={{ padding: '0 48px 64px' }}>
      <section
        aria-label="Signal · Live Feed"
        style={{
          background: `${CON.bgAlt}99`,
          border: `1px solid ${CON.line}`,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: isDesktop ? 'nowrap' : 'wrap',
            padding: isDesktop ? '10px 18px' : '10px 14px',
            borderBottom: `1px solid ${CON.line}`,
            ...mono,
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            background: `${CON.bgRaise}80`,
          }}
        >
          <span style={{ color: CON.amber }}>◆ SIGNAL · LIVE FEED</span>
          <span style={{ color: CON.dim }}>{tag}</span>
        </div>

        <div style={{ padding: isDesktop ? 28 : 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '90px 1fr 200px' : '1fr',
              gap: isDesktop ? 28 : 16,
              alignItems: 'stretch',
            }}
          >
            {/* STATE — status LED column */}
            <div
              data-signal-state
              style={{
                border: `1px solid ${CON.line}`,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'flex-start',
                background: `${CON.bgRaise}66`,
              }}
            >
              <div
                style={{
                  ...mono,
                  fontSize: 9,
                  color: CON.dim,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                state
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isDesktop ? 'column' : 'row',
                  flexWrap: 'wrap',
                  gap: isDesktop ? 10 : 16,
                  alignItems: 'flex-start',
                }}
              >
                <StatusLed color={CON.sage} label="LIVE" pulse reduced={reduced} />
                <StatusLed color={CON.amber} label="ACTIVE" reduced={reduced} />
                <StatusLed color={CON.dim} label="RX" reduced={reduced} />
                <StatusLed color={CON.cyan} label="SYNC" reduced={reduced} />
              </div>
            </div>

            {/* CRT readout + oscilloscope */}
            <div
              data-signal-live
              style={{
                border: `1px solid ${CON.line}`,
                background: '#06090C',
                padding: '14px 18px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                data-signal-rx
                style={{
                  ...mono,
                  fontSize: 11,
                  color: CON.cyan,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                ▸ rx · {feed.project ? feed.project.slug : 'no project tag'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: isDesktop ? 24 : 20,
                  lineHeight: 1.3,
                  color: CON.ink,
                  textWrap: 'pretty',
                  textShadow: `0 0 12px ${CON.amber}33`,
                }}
              >
                {feed.activity}
              </div>
              <svg
                data-signal-scope
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                width="100%"
                height="60"
                aria-hidden="true"
                style={{ display: 'block', marginTop: 12, opacity: 0.95 }}
              >
                {[1, 2, 3].map(i => (
                  <line
                    key={`hl${i}`}
                    x1="0"
                    y1={(H / 4) * i}
                    x2={W}
                    y2={(H / 4) * i}
                    stroke={CON.line}
                    strokeWidth="0.5"
                  />
                ))}
                {Array.from({ length: 12 }).map((_, i) => (
                  <line
                    key={`vl${i}`}
                    x1={(W / 12) * i}
                    y1="0"
                    x2={(W / 12) * i}
                    y2={H}
                    stroke={CON.line}
                    strokeWidth="0.5"
                  />
                ))}
                <line
                  x1="0"
                  y1={H / 2}
                  x2={W}
                  y2={H / 2}
                  stroke={`${CON.amber}44`}
                  strokeWidth="0.5"
                />
                <path
                  data-signal-wave
                  d={pathD}
                  stroke={CON.amber}
                  strokeWidth="1.3"
                  fill="none"
                  style={{ filter: `drop-shadow(0 0 4px ${CON.amber}99)` }}
                />
              </svg>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)',
                }}
              />
            </div>

            {/* SIGNAL META */}
            <div
              data-signal-meta
              style={{
                border: `1px solid ${CON.line}`,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background: `${CON.bgRaise}66`,
              }}
            >
              <div
                style={{
                  ...mono,
                  fontSize: 9,
                  color: CON.dim,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                signal meta
              </div>
              <ReadoutLine k="elapsed" v={feed.since} />
              <ReadoutLine k="channel" v={channel} />
              <ReadoutLine k="source" v="kv·live" />
              <ReadoutLine k="mode" v={feed.total > 1 ? 'rotate 7s' : 'single'} />
            </div>
          </div>
        </div>
      </section>
      <style>{`@keyframes jxConLedPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
    </div>
  )
}
