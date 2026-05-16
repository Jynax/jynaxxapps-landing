import type { ReactNode } from 'react'
import { CornerFrame } from '../parts/CornerFrame'
import { CON } from './accents'

// Section 2 — Hero / mission briefing, wrapped in CornerFrame.
// Left: ~96px display title + two console buttons (smooth-scroll to
//   #con-manifest / #con-directives). Right: monospace operator briefing.
// Hero copy ported from console.jsx.

const mono = { fontFamily: 'var(--font-mono)' }
const display = { fontFamily: 'var(--font-display)', fontWeight: 700 }

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function ConsoleButton({
  primary,
  onClick,
  children,
}: {
  primary?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        padding: '12px 28px',
        background: primary ? CON.amber : 'transparent',
        color: primary ? CON.bg : CON.amber,
        border: `1px solid ${CON.amber}`,
        cursor: 'pointer',
        clipPath:
          'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)',
      }}
    >
      {children}
    </button>
  )
}

export function Hero() {
  return (
    <div style={{ padding: '64px 48px 48px', position: 'relative' }}>
      <CornerFrame>
        <div style={{ padding: '36px 32px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: 48,
              alignItems: 'end',
            }}
          >
            <div>
              <div
                style={{
                  ...mono,
                  fontSize: 11,
                  color: CON.cyan,
                  letterSpacing: '0.22em',
                  marginBottom: 18,
                }}
              >
                ⌬ MISSION BRIEFING · ENTRY № 087
              </div>
              <h1
                style={{
                  ...display,
                  fontSize: 'clamp(48px, 8vw, 96px)',
                  lineHeight: 0.95,
                  margin: 0,
                  letterSpacing: '-0.04em',
                  color: CON.ink,
                }}
              >
                <span style={{ display: 'block' }}>a workshop</span>
                <span style={{ display: 'block', color: CON.mid }}>
                  for digital
                  <span style={{ color: CON.amber, position: 'relative', marginLeft: 18 }}>
                    machines,
                  </span>
                </span>
                <span style={{ display: 'block', fontStyle: 'italic', fontWeight: 500, color: CON.ink }}>
                  run by one curious operator.
                </span>
              </h1>
              <div style={{ marginTop: 22, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <ConsoleButton primary onClick={() => scrollToId('con-manifest')}>
                  ▶ ENTER MANIFEST
                </ConsoleButton>
                <ConsoleButton onClick={() => scrollToId('con-directives')}>
                  read directives
                </ConsoleButton>
              </div>
            </div>
            <div
              style={{
                ...mono,
                fontSize: 13,
                color: CON.mid,
                lineHeight: 1.7,
                borderLeft: `1px solid ${CON.line}`,
                paddingLeft: 28,
                paddingBottom: 12,
              }}
            >
              <div style={{ color: CON.amber, marginBottom: 12, letterSpacing: '0.12em' }}>
                // OPERATOR
              </div>
              <div style={{ color: CON.ink, fontSize: 15, marginBottom: 14, lineHeight: 1.55 }}>
                <span style={{ color: CON.cyan }}>Jynaxx</span> is the curious, mischievous half of{' '}
                <span style={{ color: CON.ink }}>Michael Chartrand</span> — an AI experience lead
                with years of process, systems, and people management behind him.
              </div>
              <div style={{ color: CON.mid, fontSize: 14, lineHeight: 1.55 }}>
                By day he ships AI workflows for work. By night, here, he ships small curious things
                for himself — and logs every move.
              </div>
            </div>
          </div>
        </div>
      </CornerFrame>
    </div>
  )
}
