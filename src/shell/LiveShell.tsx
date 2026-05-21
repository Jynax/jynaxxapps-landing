import { Suspense, lazy, useEffect, useRef, useState, useCallback } from 'react'
import type { ReactElement } from 'react'
import { useDirectionRoute, STORAGE_KEY } from './useDirectionRoute'
import type { DirectionId } from './useDirectionRoute'
import { BottomSheet } from './BottomSheet'

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
  { id: 'arcade',   short: 'Arcade',    full: 'Arcade',            accent: '#FFD93D', featured: true  },
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

  // Mobile breakpoint (<640px) — no JS useIsMobile hook; detected once + updated on resize
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 639px)').matches)
  // Auto-collapse state: pill collapses to single dot when scrolled past 240px on mobile
  const [pillCollapsed, setPillCollapsed] = useState(false)
  const lastScrollTopRef = useRef(0)
  const collapseIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Direction-change debounce: accumulated pixels scrolled in the current direction
  // since the last pill state change (or last direction reversal). A state change only
  // fires once the user has scrolled ≥ PILL_DIRECTION_THRESHOLD px in the new direction,
  // preventing jitter from small direction reversals near the bottom of a long page.
  const PILL_DIRECTION_THRESHOLD = 30
  const scrollDirectionAccumRef = useRef(0)

  // Test seam: renders a BottomSheet trigger when window.__BOTTOM_SHEET_TEST__ is set
  const showTestSheet = (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ === true
  const [testSheetOpen, setTestSheetOpen] = useState(false)

  const currentDir = DIRECTIONS.find(d => d.id === direction)!

  // On first mount: if arrived via hash, persist that direction to localStorage
  useEffect(() => {
    if (cameFromHash) {
      localStorage.setItem(STORAGE_KEY, direction)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally only on mount

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      if (collapseIdleTimerRef.current) clearTimeout(collapseIdleTimerRef.current)
    }
  }, [])

  // Scroll to top on direction change; reset scroll-tracking refs so the debounce
  // accumulator doesn't carry over stale state from the previous direction's scroll position.
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
    lastScrollTopRef.current = 0
    scrollDirectionAccumRef.current = 0
  }, [direction])

  // Mobile breakpoint listener
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) setPillCollapsed(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Auto-collapse pill on scroll past 240px (mobile only)
  useEffect(() => {
    if (!isMobile) {
      setPillCollapsed(false)
      return
    }
    const scroller = scrollerRef.current
    if (!scroller) return

    const resetIdle = () => {
      if (collapseIdleTimerRef.current) clearTimeout(collapseIdleTimerRef.current)
      collapseIdleTimerRef.current = setTimeout(() => setPillCollapsed(false), 600)
    }

    const onScroll = () => {
      const currentTop = scroller.scrollTop
      const delta = currentTop - lastScrollTopRef.current
      lastScrollTopRef.current = currentTop

      if (delta > 0) {
        // Scrolling down — accumulate; reset if previously scrolling up
        if (scrollDirectionAccumRef.current < 0) scrollDirectionAccumRef.current = 0
        scrollDirectionAccumRef.current += delta
        if (currentTop > 240 && scrollDirectionAccumRef.current >= PILL_DIRECTION_THRESHOLD) {
          setPillCollapsed(true)
          scrollDirectionAccumRef.current = 0
        }
      } else if (delta < 0) {
        // Scrolling up — accumulate; reset if previously scrolling down
        if (scrollDirectionAccumRef.current > 0) scrollDirectionAccumRef.current = 0
        scrollDirectionAccumRef.current += delta // delta is negative
        if (scrollDirectionAccumRef.current <= -PILL_DIRECTION_THRESHOLD) {
          setPillCollapsed(false)
          scrollDirectionAccumRef.current = 0
        }
      }

      resetIdle()
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (collapseIdleTimerRef.current) clearTimeout(collapseIdleTimerRef.current)
    }
  }, [isMobile])

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
      {/* ── Content scroller (full-bleed) ── */}
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
      {isMobile && pillCollapsed ? (
        // Collapsed state: single active-direction dot; tap to re-expand
        <button
          data-pill-collapsed
          onClick={() => setPillCollapsed(false)}
          aria-label="Expand direction switcher"
          style={{
            position: 'fixed',
            bottom: 'max(12px, env(safe-area-inset-bottom) + 8px)',
            right: 12,
            zIndex: 10000,
            width: 36,
            height: 36,
            borderRadius: 99,
            background: 'rgba(8, 12, 16, 0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${currentDir.accent}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            padding: 0,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 99,
              background: currentDir.accent,
              boxShadow: `0 0 10px ${currentDir.accent}AA`,
              display: 'block',
              flexShrink: 0,
            }}
          />
        </button>
      ) : (
        // Expanded pill (desktop default; mobile when not collapsed)
        <div
          data-pill
          onMouseEnter={() => { if (!isMobile) setExpanded(true) }}
          onMouseLeave={() => { if (!isMobile) { setExpanded(false); setHovered(null) } }}
          style={{
            position: 'fixed',
            bottom: isMobile ? 'max(12px, env(safe-area-inset-bottom) + 8px)' : 16,
            right: isMobile ? 12 : 16,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 10 : 6,
            padding: isMobile ? '12px 16px' : '8px 12px',
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
          {/* Desktop: hover tooltip above pill */}
          {!isMobile && expanded && (
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

          {/* Mobile: always-visible active-direction label inside pill */}
          {isMobile && (
            <span
              data-pill-label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: currentDir.accent,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {currentDir.short}
            </span>
          )}

          {isMobile ? (
            // Mobile: compact dot group — visible dots are 10/12px; 44×44 hit area is
            // achieved via padding (17px each side) so bounding box = 44×44 per WCAG 2.5.5.
            // Adjacent buttons overlap their padding zones via negative left margin
            // (−17px on 2nd and 3rd dots), keeping dot centers ≥ 8px apart while the
            // group itself contributes ~54px of layout width instead of 3×44px = 132px.
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {featuredDirs.map((dir, idx) => {
                const isActive = direction === dir.id
                const keyNum = DIRECTIONS.findIndex(d => d.id === dir.id) + 1
                return (
                  <button
                    key={dir.id}
                    data-toggle-direction={dir.id}
                    onClick={() => setDirection(dir.id)}
                    title={`${dir.full} (press ${keyNum})`}
                    aria-label={`Switch to ${dir.full}`}
                    style={{
                      // Padding extends the tap target to 44×44 around the small visual dot.
                      // No explicit width/height — element size = dot + padding = 44×44.
                      padding: 17,
                      // Overlap padding zones with neighbours so pill stays compact.
                      // From the 2nd dot onward, collapse the gap between this button's
                      // left padding zone and the previous button's right padding zone.
                      // First dot: no negative margin — it sits flush with the wrapper start.
                      marginLeft: idx === 0 ? 0 : -17,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: isActive ? 1 : 0,
                    }}
                  >
                    <span
                      style={{
                        width: isActive ? 12 : 10,
                        height: isActive ? 12 : 10,
                        borderRadius: 99,
                        background: isActive ? dir.accent : 'transparent',
                        border: `1px solid ${isActive ? dir.accent : 'rgba(255,255,255,0.28)'}`,
                        boxShadow: isActive ? `0 0 10px ${dir.accent}AA` : 'none',
                        display: 'block',
                        flexShrink: 0,
                        transition: 'all .15s ease',
                      }}
                    />
                  </button>
                )
              })}

              {/* Separator */}
              <span
                style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)', margin: '0 4px', flexShrink: 0 }}
              />

              {/* Copy-link: same treatment — 16×16 visible icon, 44×44 hit area via padding */}
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
                  padding: 14,
                  marginRight: -14,
                  minWidth: 44,
                  minHeight: 44,
                  fontSize: 13,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color .15s ease',
                  flexShrink: 0,
                }}
              >
                {copyLabel ? '✓' : '⎘'}
              </button>
            </div>
          ) : (
            <>
              {featuredDirs.map((dir) => {
                const isActive = direction === dir.id
                const isHovered = hovered === dir.id
                const keyNum = DIRECTIONS.findIndex(d => d.id === dir.id) + 1

                // Desktop dot button
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
            </>
          )}
        </div>
      )}

      {/* Test seam: open a BottomSheet for e2e verification (only when __BOTTOM_SHEET_TEST__ flag is set) */}
      {showTestSheet && (
        <>
          <button
            data-test-sheet-open
            onClick={() => setTestSheetOpen(true)}
            style={{
              position: 'fixed',
              top: 8,
              left: 8,
              zIndex: 9999,
              padding: '6px 12px',
              background: '#333',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            open sheet
          </button>
          <BottomSheet
            open={testSheetOpen}
            onClose={() => setTestSheetOpen(false)}
            aria-label="Test bottom sheet"
          >
            <p
              data-test-sheet-content
              style={{ color: '#fff', fontFamily: 'var(--font-mono)', padding: 16 }}
            >
              Test sheet content
            </p>
          </BottomSheet>
        </>
      )}
    </div>
  )
}
