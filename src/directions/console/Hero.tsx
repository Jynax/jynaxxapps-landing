import { useState } from 'react'
import type { ReactNode } from 'react'
import { CornerFrame } from '../parts/CornerFrame'
import { CON } from './accents'
import { useMediaQuery } from '../parts/useMediaQuery'

// Section 2 — Hero / mission briefing, wrapped in CornerFrame.
// Left: ~96px display title + two console buttons (smooth-scroll to
//   #con-manifest / #con-directives). Right: monospace operator briefing.
// Hero copy ported from console.jsx.
//
// Mobile (< 1024px): single-column stack (briefing below title), title
// clamp reduced, CTAs stacked full-width 48px. CornerFrame brackets kept.

const mono = { fontFamily: 'var(--font-mono)' }
const display = { fontFamily: 'var(--font-display)', fontWeight: 700 }

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function ConsoleButton({
  primary,
  onClick,
  children,
  fullWidth,
}: {
  primary?: boolean
  onClick: () => void
  children: ReactNode
  fullWidth?: boolean
}) {
  const [pressed, setPressed] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        padding: fullWidth ? '0 28px' : '12px 28px',
        background: pressed
          ? primary
            ? CON.amber
            : `${CON.amber}22`
          : primary
          ? CON.amber
          : 'transparent',
        filter: pressed && primary ? 'brightness(0.82)' : 'none',
        color: primary ? CON.bg : CON.amber,
        border: `1px solid ${CON.amber}`,
        cursor: 'pointer',
        clipPath:
          'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)',
        transition: 'background 120ms, filter 120ms',
        ...(fullWidth
          ? {
              width: '100%',
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }
          : {}),
      }}
    >
      {children}
    </button>
  )
}

export function Hero() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div
      style={{
        padding: isDesktop ? '64px 48px 48px' : '40px 16px 32px',
        position: 'relative',
      }}
    >
      <CornerFrame>
        <div style={{ padding: isDesktop ? '36px 32px' : '24px 16px' }}>
          {isDesktop ? (
            /* Desktop: two-column grid (1.5fr 1fr) */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: 48,
                alignItems: 'end',
              }}
            >
              <TitleBlock isDesktop={true} />
              <BriefingBlock isDesktop={true} />
            </div>
          ) : (
            /* Mobile: single column, briefing stacks below title */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <TitleBlock isDesktop={false} />
              <BriefingBlock isDesktop={false} />
            </div>
          )}
        </div>
      </CornerFrame>
    </div>
  )
}

function TitleBlock({ isDesktop }: { isDesktop: boolean }) {
  return (
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
          fontSize: isDesktop ? 'clamp(48px, 8vw, 96px)' : 'clamp(32px, 9vw, 44px)',
          lineHeight: 0.95,
          margin: 0,
          letterSpacing: '-0.04em',
          color: CON.ink,
          ...(!isDesktop ? ({ textWrap: 'balance' } as React.CSSProperties) : {}),
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
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          gap: isDesktop ? 14 : 12,
          flexWrap: isDesktop ? 'wrap' : undefined,
        }}
      >
        <ConsoleButton
          primary
          onClick={() => scrollToId('con-manifest')}
          fullWidth={!isDesktop}
        >
          ▶ ENTER MANIFEST
        </ConsoleButton>
        <ConsoleButton onClick={() => scrollToId('con-directives')} fullWidth={!isDesktop}>
          read directives
        </ConsoleButton>
      </div>
    </div>
  )
}

function BriefingBlock({ isDesktop }: { isDesktop: boolean }) {
  return (
    <div
      style={{
        ...mono,
        fontSize: 13,
        color: CON.mid,
        lineHeight: 1.7,
        ...(isDesktop
          ? { borderLeft: `1px solid ${CON.line}`, paddingLeft: 28, paddingBottom: 12 }
          : {}),
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
  )
}
