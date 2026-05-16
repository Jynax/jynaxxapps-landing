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
  const [hovered, setHovered] = useState<DirectionId | null>(null)
  const [expanded, setExpanded] = useState(false)

  const currentDir = DIRECTIONS.find(d => d.id === direction)!

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
      {/* ── Content scroller (full-bleed; top chrome removed — switcher is the
            floating pill below). Outer 100vh flex-column + flex:1 plain-block
            scroller preserves the canonical scroll fix (PR #32). ── */}
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

      {/* ── Floating direction switcher — bottom-right pill ── */}
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { setExpanded(false); setHovered(null) }}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          background: 'rgba(8, 12, 16, 0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#A8B5BD',
          userSelect: 'none',
          transition: 'all .2s ease',
        }}
      >
        {/* Tooltip — current (or hovered) direction name, only when expanded */}
        {expanded && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: 8,
              padding: '4px 10px',
              background: 'rgba(8, 12, 16, 0.9)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 6,
              color: (hovered ? DIRECTIONS.find(d => d.id === hovered)! : currentDir).accent,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {(hovered ? DIRECTIONS.find(d => d.id === hovered)! : currentDir).full}
          </div>
        )}

        {featuredDirs.map((dir) => {
          const isActive = direction === dir.id
          const isHovered = hovered === dir.id
          const keyNum = DIRECTIONS.findIndex(d => d.id === dir.id) + 1
          return (
            <button
              key={dir.id}
              data-toggle-direction={dir.id}
              onClick={() => setDirection(dir.id)}
              onMouseEnter={() => setHovered(dir.id)}
              onMouseLeave={() => setHovered(null)}
              title={`${dir.full} (press ${keyNum})`}
              aria-label={`Switch to ${dir.full}`}
              style={{
                width: isActive ? 10 : isHovered ? 9 : 7,
                height: isActive ? 10 : isHovered ? 9 : 7,
                borderRadius: 99,
                background: isActive
                  ? dir.accent
                  : isHovered
                    ? `${dir.accent}55`
                    : 'transparent',
                border: `1px solid ${
                  isActive ? dir.accent : isHovered ? `${dir.accent}AA` : 'rgba(255,255,255,0.28)'
                }`,
                boxShadow: isActive ? `0 0 10px ${dir.accent}AA` : 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all .15s ease',
                flexShrink: 0,
              }}
            />
          )
        })}

        <span
          style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }}
        />

        <button
          data-copy-link
          onClick={handleCopyLink}
          title="Copy shareable link to this view"
          aria-label="Copy link"
          style={{
            background: 'transparent',
            border: 'none',
            color: copyLabel ? currentDir.accent : '#7B8A95',
            cursor: 'pointer',
            padding: 0,
            fontSize: 13,
            lineHeight: 1,
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color .15s ease',
          }}
        >
          {copyLabel ? '✓' : '⎘'}
        </button>
      </div>
    </div>
  )
}
