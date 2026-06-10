import { useState } from 'react'
import type { LiveFeed } from '../parts/useLiveFeed'
import { useMediaQuery } from '../parts/useMediaQuery'
import { useBlink } from '../parts/useBlink'
import { ARC, ACCENT_VIOLET, fmt } from './tokens'
import { ArcadePlayerScene } from './ArcadePlayerScene'
import { useStats } from './useStats'

const px   = { fontFamily: 'var(--font-pixel)' }
const mono = { fontFamily: 'var(--font-mono)' }

function updatedLabel(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
  } catch {
    return ''
  }
}

// Collapsable live row (reference `ArcadeLiveStrip`, 2026-05-16 revision).
// Collapsed by default — one line under the HUD. Expanded: standup cabinet +
// caption + scoreboard. Built against the `useLiveFeed` stub contract; Task
// #26 swaps only the data source, not this UI.
export function ArcadeLiveStrip({
  feed,
  gameOpen,
  reduced,
}: {
  feed: LiveFeed
  gameOpen?: boolean
  reduced: boolean
}) {
  const blink = useBlink(420)
  const coinBlink = useBlink(900)
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const channel = `${(feed.index + 1).toString().padStart(2, '0')}/${feed.total
    .toString()
    .padStart(2, '0')}`

  // M.7 hide-during-Coin-Catch (mobile only)
  if (!isDesktop && gameOpen) return null

  return (
    <div
      data-arcade-livestrip
      style={{
        marginTop: 16,
        border: `1px solid ${ARC.neon2}`,
        background: `${ARC.bg}CC`,
        boxShadow: `0 0 16px ${ARC.neon2}33, inset 0 0 24px ${ARC.neon2}11`,
        // M.7 mobile: sticky just above the mode pill
        ...(isDesktop
          ? {}
          : {
              position: 'sticky' as const,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
              zIndex: 10,
            }),
      }}
    >
      {/* Desktop: full toggle button with grid layout */}
      <button
        type="button"
        data-arcade-livestrip-toggle
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          display: isDesktop ? 'grid' : 'none',
          gridTemplateColumns: 'auto 1fr auto auto',
          gap: 14,
          alignItems: 'center',
          padding: '10px 18px',
          width: '100%',
          textAlign: 'left',
          font: 'inherit',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderBottom: open ? `1px solid ${ARC.neon2}55` : 'none',
        }}
      >
        <span style={{ ...px, fontSize: 9, color: ARC.neon4, letterSpacing: '0.16em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: ARC.neon1,
              boxShadow: `0 0 6px ${ARC.neon1}`,
              opacity: blink ? 1 : 0.4,
            }}
          />
          NOW PLAYING
        </span>
        <span style={{ ...mono, fontSize: 16, color: ARC.ink, lineHeight: 1.2, textWrap: 'pretty' }}>
          {feed.activity}
          {feed.project && <span style={{ color: ARC.neon3 }}>{` · cart: ${feed.project.name.toLowerCase()}`}</span>}
        </span>
        <span style={{ ...px, fontSize: 8, color: ARC.dim, letterSpacing: '0.16em' }}>
          {feed.watchers} WATCHING · {feed.since.toUpperCase()} · {channel}
        </span>
        <span style={{ ...px, fontSize: 9, color: ARC.neon3, letterSpacing: '0.16em', textShadow: `0 0 6px ${ARC.neon3}` }}>
          {open ? '▲ CLOSE' : '▼ EXPAND'}
        </span>
      </button>

      {/* Mobile: single-line collapsed view, ellipsize on overflow */}
      {!isDesktop && (
        <div
          style={{
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              flexShrink: 0,
              background: ARC.neon1,
              boxShadow: `0 0 6px ${ARC.neon1}`,
              opacity: blink ? 1 : 0.4,
            }}
          />
          <span
            style={{
              ...mono,
              fontSize: 14,
              color: ARC.ink,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {feed.activity}
            {feed.project && ` · cart: ${feed.project.name.toLowerCase()}`}
          </span>
        </div>
      )}

      {/* Desktop only: expanded panel with cabinet + activity + scoreboard */}
      {isDesktop && open && (
        <div data-arcade-livestrip-panel style={{ padding: '22px 22px 26px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 220px', gap: 30, alignItems: 'stretch' }}>
            <ArcadePlayerScene blink={blink} reduced={reduced} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ ...px, fontSize: 9, color: ARC.neon4, letterSpacing: '0.18em', marginBottom: 10, textShadow: `0 0 6px ${ARC.neon4}66` }}>
                ▸ PLAYER IS ACTIVE
              </div>
              <p style={{ ...mono, fontSize: 24, lineHeight: 1.3, margin: 0, color: ARC.ink, textWrap: 'pretty' }}>
                {feed.activity}
                {feed.project && <span style={{ color: ARC.neon3 }}>{` · cart: ${feed.project.name.toLowerCase()}`}</span>}
                &nbsp;<span style={{ color: ARC.neon3, opacity: coinBlink ? 1 : 0.3 }}>★</span>
              </p>
              <div style={{ ...px, fontSize: 8, color: ARC.dim, letterSpacing: '0.18em', marginTop: 18 }}>
                LIVE FEED · {feed.total > 1 ? 'ROTATING SET' : 'SINGLE ENTRY'} · SAVE SLOT 87 · AUTOSAVED
              </div>
            </div>
            <ArcadeScoreboard />
          </div>
        </div>
      )}
    </div>
  )
}

// Scoreboard extracted as a named export so Arcade.tsx can mount it standalone
// on mobile (between INSERT COIN and the cart grid). Desktop strip renders it
// inline inside the expanded panel. The two mounts are mutually exclusive per
// breakpoint (Arcade.tsx: {!isDesktop && <ArcadeScoreboard />}).
export function ArcadeScoreboard() {
  const stats = useStats()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (isDesktop) {
    // Desktop: original layout — sits in the 3-col expanded panel grid
    return (
      <div data-arcade-scoreboard style={{ borderLeft: `2px solid ${ARC.neon2}55`, paddingLeft: 22 }}>
        <div style={{ ...px, fontSize: 9, color: ARC.dim, letterSpacing: '0.18em', marginBottom: 12 }}>
          SCOREBOARD
          {stats.generatedAt && (
            <span style={{ color: ARC.dim, opacity: 0.7 }}>
              {' '}· UPDATED {updatedLabel(stats.generatedAt)}
            </span>
          )}
        </div>
        <div style={{ ...mono, fontSize: 17, lineHeight: 1.6, color: ARC.ink }}>
          <div>SINCE &nbsp;<span style={{ color: ARC.neon2 }}>{stats.since}</span></div>
          <div>PROJECTS &nbsp;<span style={{ color: ARC.neon4 }}>{fmt(stats.projects)}</span></div>
          <div>PRS MERGED &nbsp;<span style={{ color: ACCENT_VIOLET }}>{fmt(stats.prsMerged)}</span></div>
          <div>COFFEE &nbsp;<span style={{ color: ARC.neon1 }}>∞</span></div>
        </div>
      </div>
    )
  }

  // Mobile: M.4 2×2 grid layout
  // Cell borders: 1px ARC.bgLight divider between cells (right on col 0, bottom on row 0)
  const cellBase: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 16px',
    height: 80,
  }
  const labelStyle: React.CSSProperties = {
    ...mono,
    fontSize: 10,
    color: ARC.dim,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  }

  return (
    <div
      data-arcade-scoreboard
      style={{ marginTop: 16, marginBottom: 4 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 80px)',
          gap: 0,
          border: `1px solid ${ARC.bgLight}`,
        }}
      >
        {/* Row 0, Col 0 — SINCE (cyan) */}
        <div style={{ ...cellBase, borderRight: `1px solid ${ARC.bgLight}`, borderBottom: `1px solid ${ARC.bgLight}` }}>
          <div style={labelStyle}>SINCE</div>
          <div style={{ ...px, fontSize: 24, color: ARC.neon2 }}>{stats.since}</div>
        </div>
        {/* Row 0, Col 1 — PROJECTS (yellow) */}
        <div style={{ ...cellBase, borderBottom: `1px solid ${ARC.bgLight}` }}>
          <div style={labelStyle}>PROJECTS</div>
          <div style={{ ...px, fontSize: 24, color: ARC.neon3 }}>{fmt(stats.projects)}</div>
        </div>
        {/* Row 1, Col 0 — PRS MERGED (yellow) */}
        <div style={{ ...cellBase, borderRight: `1px solid ${ARC.bgLight}` }}>
          <div style={labelStyle}>PRS MERGED</div>
          <div style={{ ...px, fontSize: 22, color: ARC.neon3 }}>{fmt(stats.prsMerged)}</div>
        </div>
        {/* Row 1, Col 1 — COFFEE (cyan) */}
        <div style={cellBase}>
          <div style={labelStyle}>COFFEE</div>
          <div style={{ ...px, fontSize: 28, color: ARC.neon2 }}>∞</div>
        </div>
      </div>
      {/* UPDATED stamp — right-aligned, below the grid */}
      {stats.generatedAt && (
        <div style={{ ...mono, fontSize: 10, color: ARC.dim, textAlign: 'right', marginTop: 6 }}>
          UPDATED {updatedLabel(stats.generatedAt)}
        </div>
      )}
    </div>
  )
}
