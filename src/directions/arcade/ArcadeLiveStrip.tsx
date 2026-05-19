import { useState } from 'react'
import type { LiveFeed } from '../parts/useLiveFeed'
import { ARC, ACCENT_VIOLET, fmt } from './tokens'
import { ArcadePlayerScene } from './ArcadePlayerScene'
import { useStats } from './useStats'

const px = { fontFamily: 'var(--font-pixel)' }
const mono = { fontFamily: 'var(--font-vt)' }

// Collapsable live row (reference `ArcadeLiveStrip`, 2026-05-16 revision).
// Collapsed by default — one line under the HUD. Expanded: standup cabinet +
// caption + scoreboard. Built against the `useLiveFeed` stub contract; Task
// #26 swaps only the data source, not this UI.
export function ArcadeLiveStrip({
  feed,
  blink,
  coin,
  reduced,
}: {
  feed: LiveFeed
  blink: boolean
  coin: boolean
  reduced: boolean
}) {
  const [open, setOpen] = useState(false)
  const stats = useStats()
  const channel = `${(feed.index + 1).toString().padStart(2, '0')}/${feed.total
    .toString()
    .padStart(2, '0')}`

  // Format generatedAt as 'MON YYYY' for the UPDATED honesty tag
  function updatedLabel(iso: string): string {
    try {
      const d = new Date(iso)
      return d.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
    } catch {
      return ''
    }
  }

  return (
    <div
      data-arcade-livestrip
      style={{
        marginTop: 16,
        border: `1px solid ${ARC.neon2}`,
        background: `${ARC.bg}CC`,
        boxShadow: `0 0 16px ${ARC.neon2}33, inset 0 0 24px ${ARC.neon2}11`,
      }}
    >
      <button
        type="button"
        data-arcade-livestrip-toggle
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          display: 'grid',
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

      {open && (
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
                &nbsp;<span style={{ color: ARC.neon3, opacity: coin ? 1 : 0.3 }}>★</span>
              </p>
              <div style={{ ...px, fontSize: 8, color: ARC.dim, letterSpacing: '0.18em', marginTop: 18 }}>
                LIVE FEED · {feed.total > 1 ? 'ROTATING SET' : 'SINGLE ENTRY'} · SAVE SLOT 87 · AUTOSAVED
              </div>
            </div>
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
          </div>
        </div>
      )}
    </div>
  )
}
