import { Suspense, lazy, useEffect, useRef, useState, useCallback } from 'react'
import type { ReactElement } from 'react'
import { useDirectionRoute, STORAGE_KEY } from './useDirectionRoute'
import type { DirectionId } from './useDirectionRoute'

interface Direction {
  id: DirectionId
  short: string
  full: string
  accent: string
  featured: boolean
}

const DIRECTIONS: Direction[] = [
  { id: 'terminal', short: 'Terminal',  full: 'Phosphor Terminal', accent: '#F4B942', featured: true  },
  { id: 'console',  short: 'Console',   full: 'Console',           accent: '#6CE0D4', featured: true  },
  { id: 'journal',  short: 'Journal',   full: 'Journal',           accent: '#F4B942', featured: false },
  { id: 'arcade',   short: 'Arcade',    full: 'Arcade',            accent: '#FF3D7F', featured: false },
]

const LazyTerminal = lazy(() => import('../directions/Terminal'))
const LazyConsole  = lazy(() => import('../directions/Console'))
const LazyJournal  = lazy(() => import('../directions/Journal'))
const LazyArcade   = lazy(() => import('../directions/Arcade'))

function DirectionContent({ direction }: { direction: DirectionId }): ReactElement {
  switch (direction) {
    case 'terminal': return <LazyTerminal />
    case 'console':  return <LazyConsole />
    case 'journal':  return <LazyJournal />
    case 'arcade':   return <LazyArcade />
  }
}

export function LiveShell() {
  const { direction, setDirection, cameFromHash } = useDirectionRoute()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [copyLabel, setCopyLabel] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentDir = DIRECTIONS.find(d => d.id === direction)!
  // Fix C: derive from the source of truth (DIRECTIONS[].featured) rather than
  // duplicating the journal/arcade list in the hook.
  const isHidden = !currentDir.featured

  // On first mount: if arrived via hash, persist that direction to localStorage
  // without changing the hash (the hook's setDirection would clobber nothing here,
  // but we need to write storage without calling history.replaceState again).
  useEffect(() => {
    if (cameFromHash) {
      localStorage.setItem(STORAGE_KEY, direction)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally only on mount

  // Fix A: clear copy-link timer on unmount to avoid setState-after-unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  // Scroll to top on direction change
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  }, [direction])

  // Keyboard handler: 1→terminal 2→console 3→journal 4→arcade
  useEffect(() => {
    const MAP: Record<string, DirectionId> = {
      '1': 'terminal',
      '2': 'console',
      '3': 'journal',
      '4': 'arcade',
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return
      const dest = MAP[e.key]
      if (dest) setDirection(dest)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setDirection])

  const handleCopyLink = useCallback(() => {
    const url = `${location.origin}${location.pathname}#${direction}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyLabel('✓ LINK COPIED')
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => {
        setCopyLabel(null)
      }, 1600)
    }).catch(() => {
      // silently fail
    })
  }, [direction])

  const featuredDirs = DIRECTIONS.filter(d => d.featured)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Toggle bar ── */}
      <header
        style={{
          flexShrink: 0,
          height: 'var(--shell-bar-height)',
          background: 'var(--shell-bar-bg)',
          borderBottom: '1px solid var(--shell-bar-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 16,
          gap: 8,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Left region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* accent dot */}
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: currentDir.accent,
              flexShrink: 0,
            }}
          />
          {/* "JX ·" always visible, "LIVE PREVIEW" hides <820px */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--shell-ink)',
            }}
          >
            JX
            {' · '}
            <span className="max-[820px]:hidden">LIVE PREVIEW</span>
          </span>
          {/* "showing <full name>" hides <1180px */}
          <span
            className="max-[1180px]:hidden"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--shell-dim)',
              letterSpacing: '0.06em',
            }}
          >
            showing {currentDir.full}
          </span>
        </div>

        {/* Center region — direction pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'var(--shell-pill-bg)',
              border: '1px solid var(--shell-pill-border)',
              borderRadius: 999,
              padding: '2px 4px',
            }}
          >
            {featuredDirs.map((dir, idx) => {
              const isActive = direction === dir.id
              return (
                <button
                  key={dir.id}
                  data-toggle-direction={dir.id}
                  onClick={() => setDirection(dir.id)}
                  style={{
                    background: isActive ? dir.accent : 'transparent',
                    color: isActive ? '#0E1419' : '#A8B5BD',
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    borderRadius: 999,
                    padding: '6px 14px',
                    border: 'none',
                    cursor: 'pointer',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {/* digit always visible */}
                  <span>{idx + 1}</span>
                  {/* name hides <700px */}
                  <span className="max-[700px]:hidden">{dir.short}</span>
                </button>
              )
            })}
          </div>

          {/* Hidden badge — shown when current direction is not featured */}
          {isHidden && (
            <span
              data-hidden-badge
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.08em',
                color: 'var(--shell-mid)',
                border: '1px dashed var(--shell-faint)',
                borderRadius: 4,
                padding: '3px 8px',
                whiteSpace: 'nowrap',
              }}
            >
              · {currentDir.full} (hidden)
            </span>
          )}
        </div>

        {/* Right region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* KEYS 1–4 hint — hides <980px */}
          <span
            className="max-[980px]:hidden"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--shell-dim)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            KEYS 1–4
          </span>

          {/* Copy-link button */}
          <button
            onClick={handleCopyLink}
            style={{
              background: 'transparent',
              border: '1px solid var(--shell-pill-border)',
              borderRadius: 6,
              padding: '5px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              color: copyLabel ? currentDir.accent : 'var(--shell-mid)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'color 0.15s',
            }}
            title="Copy shareable link"
          >
            {copyLabel ? (
              copyLabel
            ) : (
              <>
                <span>⎘</span>
                <span className="max-[700px]:hidden">COPY LINK</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Content scroller ── */}
      <div
        ref={scrollerRef}
        data-shell-scroller
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Suspense
          fallback={
            <div style={{ background: 'var(--term-bg)', minHeight: '100%' }} />
          }
        >
          <DirectionContent direction={direction} />
        </Suspense>
      </div>
    </div>
  )
}
