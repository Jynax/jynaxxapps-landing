import { useLiveFeed } from '../parts/useLiveFeed'
import { useReducedMotion } from '../parts/useReducedMotion'
import { CON } from './accents'

// Section 3 — Signal · Now Playing, reworked as an operator console for the
// live feed (Task #26). Status LED (LIVE pulse), CRT readout of the fetched
// activity with an amber oscilloscope sweep + scanlines, and a signal-meta
// column (project / recency / channel / focus).
//
// Data now comes from useLiveFeed() (real /api/live, static JX_NOW fallback)
// instead of reading JX_NOW directly. The oscilloscope sweep is the only SVG
// animation; it freezes under reduced motion via the `{!reduced && <animate/>}`
// gate — the same pattern as PulseDot and the #24 ProjectArt SMART pulse — and
// is deliberately OUTSIDE [data-project-art] so it does not affect the #24
// art-animate contract asserted in console.spec.ts.

const mono = { fontFamily: 'var(--font-mono)' }

// console.jsx splits "Now Playing" into a bold headline + a monospace sub-line;
// our feed ships a single activity string. Derive both tiers (no fabricated
// copy): headline = first sentence (up to & incl. the first '. '); sub = rest.
function splitNow(line: string): { headline: string; sub: string } {
  const i = line.indexOf('. ')
  if (i === -1) return { headline: line, sub: '' }
  return { headline: line.slice(0, i + 1), sub: line.slice(i + 2).trim() }
}

function StatusLed({ reduced }: { reduced: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 32, height: 32 }} aria-hidden="true">
        {!reduced && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 99,
              background: CON.amber,
              animation: 'jxConPulse 1.6s ease-out infinite',
              opacity: 0.4,
            }}
          />
        )}
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 16,
            height: 16,
            borderRadius: 99,
            background: CON.amber,
            boxShadow: `0 0 16px ${CON.amber}AA`,
          }}
        />
      </div>
      <span
        style={{
          ...mono,
          fontSize: 9,
          letterSpacing: '0.22em',
          color: CON.amber,
        }}
      >
        LIVE
      </span>
    </div>
  )
}

// Amber oscilloscope: a static waveform polyline + a sweeping beam. The beam's
// horizontal travel is an SVG <animate> that is omitted entirely under reduced
// motion (no <animate> node → frozen, matches the e2e contract).
function Oscilloscope({ reduced }: { reduced: boolean }) {
  const wave =
    '0,24 10,18 20,28 30,12 40,30 50,20 60,16 70,30 80,10 90,26 100,22 ' +
    '110,14 120,30 130,18 140,24 150,12 160,28 170,20 180,16 190,30 200,22 ' +
    '210,14 220,26 230,18 240,24'
  return (
    <div
      data-signal-scope
      style={{
        position: 'relative',
        marginTop: 14,
        height: 48,
        border: `1px solid ${CON.line}`,
        background: `${CON.bg}`,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 240 48"
        preserveAspectRatio="none"
        width="100%"
        height="48"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <polyline
          points={wave}
          fill="none"
          stroke={`${CON.amber}66`}
          strokeWidth="1"
        />
        <line x1="0" y1="0" x2="0" y2="48" stroke={CON.amber} strokeWidth="2">
          {!reduced && (
            <animate
              attributeName="x1"
              values="0;240;0"
              dur="2.4s"
              repeatCount="indefinite"
            />
          )}
          {!reduced && (
            <animate
              attributeName="x2"
              values="0;240;0"
              dur="2.4s"
              repeatCount="indefinite"
            />
          )}
        </line>
      </svg>
      {/* scanlines */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 3px)',
        }}
      />
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: CON.dim }}>{label}</span>
      <span style={{ color: CON.ink, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export function SignalPanel() {
  const reduced = useReducedMotion()
  const feed = useLiveFeed()
  const { headline, sub } = splitNow(feed.activity)
  const channel = `${(feed.index + 1).toString().padStart(2, '0')}/${feed.total
    .toString()
    .padStart(2, '0')}`

  return (
    <div style={{ padding: '0 48px 64px' }}>
      <section
        aria-label="Signal · Now Playing"
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
            padding: '10px 18px',
            borderBottom: `1px solid ${CON.line}`,
            ...mono,
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            background: `${CON.bgRaise}80`,
          }}
        >
          <span style={{ color: CON.amber }}>◆ SIGNAL · NOW PLAYING</span>
          <span style={{ color: CON.dim }}>CH {channel} · {feed.since.toUpperCase()}</span>
        </div>
        <div style={{ padding: 28 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 240px',
              gap: 24,
              alignItems: 'start',
            }}
          >
            <StatusLed reduced={reduced} />
            <div data-signal-live>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: CON.ink,
                  textWrap: 'pretty',
                }}
              >
                {headline}
              </div>
              {sub && (
                <div
                  style={{
                    ...mono,
                    fontSize: 13,
                    color: CON.mid,
                    marginTop: 6,
                    lineHeight: 1.6,
                  }}
                >
                  {sub}
                </div>
              )}
              <Oscilloscope reduced={reduced} />
            </div>
            <div
              style={{
                ...mono,
                fontSize: 11,
                lineHeight: 1.4,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: CON.dim,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}
              >
                signal meta
              </div>
              <MetaRow label="PROJECT" value={feed.project ? feed.project.name : '—'} />
              <MetaRow label="STATUS" value={feed.project ? feed.project.status : 'workshop'} />
              <MetaRow label="SINCE" value={feed.since} />
              <MetaRow label="CHANNEL" value={channel} />
              <MetaRow label="WATCHERS" value={String(feed.watchers)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
