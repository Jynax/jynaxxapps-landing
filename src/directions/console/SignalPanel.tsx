import { JX_NOW } from '../../data/jxData'
import { useReducedMotion } from '../parts/useReducedMotion'
import { CON } from './accents'

// Section 3 — Signal · Now Playing.
// Panel with: pulsing dot (CSS, STATIC under reduced motion), JX_NOW.line +
// sub-text, focus-level bars on the right.
// Focus value (4) and the framing tag/sub-text are ported from console.jsx.

const mono = { fontFamily: 'var(--font-mono)' }

// RECONCILE: console.jsx splits "Now Playing" into a bold headline + a
// monospace sub-line; our jxData ships a single JX_NOW.line. We derive both
// tiers from JX_NOW.line (no hardcoded/fabricated copy, no duplication):
// headline = first sentence (up to & incl. the first '. '); sub = remainder.
function splitNow(line: string): { headline: string; sub: string } {
  const i = line.indexOf('. ')
  if (i === -1) return { headline: line, sub: '' }
  return { headline: line.slice(0, i + 1), sub: line.slice(i + 2).trim() }
}

function PulseDot({ reduced }: { reduced: boolean }) {
  return (
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
  )
}

function FocusBars({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }} aria-hidden="true">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          style={{
            width: 14,
            height: 22 + i * 2,
            background: i <= value ? CON.amber : CON.line,
            boxShadow: i <= value ? `0 0 8px ${CON.amber}66` : 'none',
          }}
        />
      ))}
    </div>
  )
}

export function SignalPanel() {
  const reduced = useReducedMotion()
  const { headline, sub } = splitNow(JX_NOW.line)
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
          <span style={{ color: CON.dim }}>MAY 15 / 26 · T+19MO 4D</span>
        </div>
        <div style={{ padding: 28 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 220px',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <PulseDot reduced={reduced} />
            <div>
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
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  ...mono,
                  fontSize: 10,
                  color: CON.dim,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                focus level
              </div>
              <FocusBars value={4} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
