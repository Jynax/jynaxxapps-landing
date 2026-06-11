// Rotation shell for the Arcade "insert coin" easter egg (Task #29).
//
// A modal overlay launched from the (now interactive) ◇ INSERT COIN ◇ marquee.
// Owns the attract → playing → over meta-loop; each "insert coin" while not
// playing advances to the next game in ARCADE_GAMES and returns to attract, so
// the cabinet genuinely rotates games across presses. The games list currently
// has one entry (Coin Catch); adding more needs no change here.
//
// Static (no motion) so it adds zero SVG <animate> to the arcade root — the
// reduced-motion e2e contract holds. The active game handles its own motion.

import { useEffect, useRef, useState } from 'react'
import { ARC } from '../tokens'
import { ARCADE_GAMES } from './games'
import { useArcadePlays } from './useArcadePlays'
import { useMediaQuery } from '../../parts/useMediaQuery'
import { useFocusTrap } from '../../parts/useFocusTrap'

type Phase = 'attract' | 'playing' | 'over'

const px = { fontFamily: 'var(--font-pixel)' } as const
const mono = { fontFamily: 'var(--font-vt)' } as const

export function CoinGameOverlay({
  index,
  hiScore,
  reduced,
  onAdvance,
  onScore,
  onClose,
}: {
  index: number
  hiScore: number
  reduced: boolean
  onAdvance: () => void
  onScore: (finalScore: number) => void
  onClose: () => void
}) {
  const game = ARCADE_GAMES[index % ARCADE_GAMES.length]
  const [phase, setPhase] = useState<Phase>('attract')
  const [lastScore, setLastScore] = useState(0)
  const [playAgainActive, setPlayAgainActive] = useState(false)
  const [closeActive, setCloseActive] = useState(false)

  const phaseRef = useRef<Phase>(phase)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  // overlayRef covers the full overlay surface (close button + panel), so the
  // focus trap contains every interactive element. panelRef still points to the
  // inner panel for initial-focus purposes.
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // Pad portal target ref — #77 queries [data-coingame-pad-slot] via querySelector/createPortal
  const padSlotRef = useRef<HTMLDivElement>(null)
  const { count: plays, registerPlay } = useArcadePlays()

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isLandscapeMobile = useMediaQuery('(orientation: landscape) and (max-width: 1023px)')
  // Show the rotate card when in landscape on a mobile-sized viewport
  const showRotateCard = !isDesktop && isLandscapeMobile

  // "Insert coin": start from attract, or rotate to the next game from over.
  const insertCoin = () => {
    if (phaseRef.current === 'playing') return
    if (phaseRef.current === 'over') onAdvance()
    registerPlay()
    setPhase('playing')
  }

  // Focus the dialog on open; restore focus to the trigger on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => prev?.focus()
  }, [])

  // Focus trap: Tab/Shift+Tab cycle within the full overlay surface (outer div),
  // so the [data-coingame-close] button — which is a DOM sibling before the
  // panel div — is included in the containment check.
  useFocusTrap(overlayRef, true)

  // Meta keys (window-capture so they never reach LiveShell's 1–4 switcher).
  // Space/Enter only act outside of play; Escape always closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        return
      }
      if (
        (e.key === ' ' || e.key === 'Enter') &&
        phaseRef.current !== 'playing'
      ) {
        e.preventDefault()
        e.stopPropagation()
        insertCoin()
        return
      }
      // Modal: suppress LiveShell's 1–4 direction switcher while open so a
      // stray number key can't unmount the game mid-play.
      if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // insertCoin/onClose are stable enough for this lifecycle-bound listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGameOver = (finalScore: number) => {
    setLastScore(finalScore)
    onScore(finalScore)
    setPhase('over')
  }

  const Game = game.Component
  const newHigh = phase === 'over' && lastScore > hiScore

  return (
    <div
        ref={overlayRef}
        data-arcade-coingame
        data-coingame-state={phase}
        role="dialog"
        aria-modal="true"
        aria-label={`Arcade mini-game: ${game.label}`}
        onClick={isDesktop ? onClose : undefined}
        style={
          isDesktop
            ? {
                position: 'fixed',
                inset: 0,
                zIndex: 10001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(3, 4, 18, 0.86)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                padding: 20,
              }
            : {
                // Mobile: full-takeover sheet
                position: 'fixed',
                inset: 0,
                zIndex: 10001,
                height: '100dvh',
                width: '100vw',
                background: 'rgba(3, 4, 18, 0.96)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: reduced
                  ? undefined
                  : 'coingame-slide-in 0.28s cubic-bezier(.2,.7,.3,1) both',
              }
        }
      >
        {/* Mobile-only: centered header block ~80px tall */}
        {!isDesktop && (
          <div
            style={{
              flexShrink: 0,
              height: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderBottom: `1px solid ${ARC.bgLight}`,
              padding: '0 56px',
            }}
          >
            <div style={{ ...mono, fontSize: 11, color: ARC.neon1, letterSpacing: '0.18em' }}>
              ★ JYNAXX ARCADE ★
            </div>
            <div style={{ ...px, fontSize: 22, color: ARC.neon3, marginTop: 4, textShadow: `0 0 10px ${ARC.neon3}88` }}>
              COIN CATCH
            </div>
          </div>
        )}

        {/* Close button — absolute top-right; 44×44 on mobile, compact on desktop */}
        <button
          type="button"
          data-coingame-close
          onClick={(e) => { e.stopPropagation(); onClose() }}
          aria-label="Close mini-game"
          style={
            isDesktop
              ? {
                  position: 'absolute',
                  top: 8,
                  right: 10,
                  background: 'transparent',
                  border: 'none',
                  color: ARC.dim,
                  cursor: 'pointer',
                  ...px,
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 4,
                  zIndex: 1,
                }
              : {
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: ARC.dim,
                  cursor: 'pointer',
                  ...px,
                  fontSize: 16,
                  zIndex: 1,
                }
          }
        >
          ✕
        </button>

        {/* Inner panel — desktop: centered box; mobile: flex-column content area */}
        <div
          ref={panelRef}
          tabIndex={-1}
          onClick={e => e.stopPropagation()}
          style={
            isDesktop
              ? {
                  position: 'relative',
                  width: 520,
                  maxWidth: '94vw',
                  padding: '28px 28px 24px',
                  border: `2px solid ${ARC.neon2}`,
                  background: `${ARC.bg}F2`,
                  boxShadow: `0 0 32px ${ARC.neon2}55`,
                  outline: 'none',
                }
              : {
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 20px',
                  outline: 'none',
                  overflow: 'hidden',
                }
          }
        >
          {/* Desktop-only: marquee header */}
          {isDesktop && (
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div
                style={{
                  ...px,
                  fontSize: 9,
                  letterSpacing: '0.3em',
                  color: ARC.neon1,
                  marginBottom: 8,
                }}
              >
                ★ JYNAXX ARCADE ★
              </div>
              <div
                data-coingame-title
                style={{
                  ...px,
                  fontSize: 20,
                  letterSpacing: '0.12em',
                  color: ARC.neon3,
                  textShadow: `0 0 12px ${ARC.neon3}88`,
                }}
              >
                {game.label}
              </div>
            </div>
          )}

          {/* Landscape mobile gate: show rotate card instead of content */}
          {showRotateCard ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 24px',
                border: `1px solid ${ARC.bgLight}`,
              }}
            >
              <div style={{ ...px, fontSize: 28, color: ARC.neon3, marginBottom: 16 }}>↻</div>
              <div style={{ ...px, fontSize: 18, color: ARC.ink, letterSpacing: '0.12em' }}>
                ROTATE PHONE
              </div>
            </div>
          ) : (
            <>
              {phase === 'attract' && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <p
                    style={{
                      ...mono,
                      fontSize: 16,
                      lineHeight: 1.5,
                      color: ARC.ink,
                      opacity: 0.9,
                      margin: '0 0 22px',
                    }}
                  >
                    {game.blurb}
                  </p>
                  <button
                    type="button"
                    data-coingame-insert
                    onClick={insertCoin}
                    style={{
                      ...px,
                      fontSize: 12,
                      letterSpacing: '0.2em',
                      color: ARC.bg,
                      background: ARC.neon3,
                      border: 'none',
                      padding: isDesktop ? '12px 22px' : '14px 22px',
                      cursor: 'pointer',
                      boxShadow: `0 0 16px ${ARC.neon3}88`,
                      width: isDesktop ? undefined : '100%',
                      minHeight: isDesktop ? undefined : 44,
                    }}
                  >
                    ◇ INSERT COIN ◇
                  </button>
                  {/* Desktop: keyboard hint; Mobile: TAP TO START pulse */}
                  {isDesktop ? (
                    <div
                      style={{
                        ...px,
                        fontSize: 8,
                        letterSpacing: '0.16em',
                        color: ARC.dim,
                        marginTop: 14,
                      }}
                    >
                      SPACE / ENTER · ESC TO EXIT
                    </div>
                  ) : (
                    <div
                      style={{
                        ...px,
                        fontSize: 18,
                        letterSpacing: '0.14em',
                        color: ARC.neon2,
                        marginTop: 20,
                        animation: reduced
                          ? undefined
                          : 'coingame-tap-pulse 1.4s ease-in-out infinite',
                      }}
                    >
                      TAP TO START
                    </div>
                  )}
                  {plays !== null && (
                    <div
                      data-coingame-plays
                      style={{
                        ...px,
                        fontSize: 8,
                        letterSpacing: '0.16em',
                        color: ARC.neon2,
                        marginTop: 8,
                      }}
                    >
                      ▸ {plays.toLocaleString('en-US')} EXPLORERS HAVE FOUND THIS ◂
                    </div>
                  )}
                </div>
              )}

              {/* playing phase: CoinCatch only mounts when NOT landscape-mobile */}
              {phase === 'playing' && (
                <Game reduced={reduced} onGameOver={handleGameOver} />
              )}

              {phase === 'over' && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  {isDesktop ? (
                    // Desktop: existing layout
                    <>
                      <div
                        data-coingame-final
                        style={{
                          ...px,
                          fontSize: 16,
                          color: ARC.neon4,
                          letterSpacing: '0.12em',
                          marginBottom: 10,
                        }}
                      >
                        GAME OVER
                      </div>
                      <div style={{ ...mono, fontSize: 18, color: ARC.ink, marginBottom: 4 }}>
                        SCORE&nbsp;
                        <span data-coingame-finalscore style={{ color: ARC.neon3 }}>
                          {lastScore}
                        </span>
                      </div>
                      <div style={{ ...mono, fontSize: 13, color: ARC.dim, marginBottom: 22 }}>
                        {newHigh ? (
                          <span style={{ color: ARC.neon1 }}>★ NEW HI-SCORE ★</span>
                        ) : (
                          <>HI-SCORE&nbsp;{Math.max(hiScore, lastScore)}</>
                        )}
                      </div>
                      <button
                        type="button"
                        data-coingame-insert
                        data-coingame-next
                        onClick={insertCoin}
                        style={{
                          ...px,
                          fontSize: 12,
                          letterSpacing: '0.2em',
                          color: ARC.bg,
                          background: ARC.neon3,
                          border: 'none',
                          padding: '12px 22px',
                          cursor: 'pointer',
                          boxShadow: `0 0 16px ${ARC.neon3}88`,
                        }}
                      >
                        ◇ INSERT COIN ▸ NEXT GAME ◇
                      </button>
                      <div
                        style={{
                          ...px,
                          fontSize: 8,
                          letterSpacing: '0.16em',
                          color: ARC.dim,
                          marginTop: 14,
                        }}
                      >
                        SPACE / ENTER · ESC TO EXIT
                      </div>
                      {plays !== null && (
                        <div
                          data-coingame-plays
                          style={{
                            ...px,
                            fontSize: 8,
                            letterSpacing: '0.16em',
                            color: ARC.neon2,
                            marginTop: 8,
                          }}
                        >
                          ▸ {plays.toLocaleString('en-US')} EXPLORERS HAVE FOUND THIS ◂
                        </div>
                      )}
                    </>
                  ) : (
                    // Mobile: full-sheet card with stacked 48px buttons
                    <div
                      style={{
                        border: `1px solid ${ARC.bgLight}`,
                        padding: '32px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 16,
                        width: '100%',
                      }}
                    >
                      <div
                        data-coingame-final
                        style={{
                          ...px,
                          fontSize: 20,
                          color: ARC.neon4,
                          letterSpacing: '0.12em',
                        }}
                      >
                        GAME OVER
                      </div>
                      <div style={{ ...mono, fontSize: 18, color: ARC.ink }}>
                        SCORE&nbsp;
                        <span data-coingame-finalscore style={{ color: ARC.neon3 }}>
                          {lastScore}
                        </span>
                      </div>
                      <div style={{ ...mono, fontSize: 13, color: ARC.dim }}>
                        {newHigh ? (
                          <span
                            style={{
                              color: ARC.neon1,
                              ...px,
                              fontSize: 13,
                              letterSpacing: '0.12em',
                            }}
                          >
                            ★ NEW HI! ★
                          </span>
                        ) : (
                          <>HI&nbsp;{Math.max(hiScore, lastScore)}</>
                        )}
                      </div>
                      {plays !== null && (
                        <div
                          data-coingame-plays
                          style={{
                            ...px,
                            fontSize: 8,
                            letterSpacing: '0.16em',
                            color: ARC.neon2,
                          }}
                        >
                          ▸ {plays.toLocaleString('en-US')} EXPLORERS HAVE FOUND THIS ◂
                        </div>
                      )}
                      {/* Stacked 48px buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
                        <button
                          type="button"
                          data-coingame-insert
                          data-coingame-next
                          onClick={insertCoin}
                          onPointerDown={() => setPlayAgainActive(true)}
                          onPointerUp={() => setPlayAgainActive(false)}
                          onPointerLeave={() => setPlayAgainActive(false)}
                          style={{
                            ...px,
                            fontSize: 12,
                            letterSpacing: '0.2em',
                            color: ARC.bg,
                            background: playAgainActive ? ARC.neon3 + 'CC' : ARC.neon3,
                            border: 'none',
                            height: 48,
                            width: '100%',
                            cursor: 'pointer',
                          }}
                        >
                          ◇ PLAY AGAIN ◇
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          onPointerDown={() => setCloseActive(true)}
                          onPointerUp={() => setCloseActive(false)}
                          onPointerLeave={() => setCloseActive(false)}
                          style={{
                            ...px,
                            fontSize: 12,
                            letterSpacing: '0.2em',
                            color: closeActive ? ARC.bg : ARC.dim,
                            background: closeActive ? ARC.dim : 'transparent',
                            border: `1px solid ${ARC.bgLight}`,
                            height: 48,
                            width: '100%',
                            cursor: 'pointer',
                          }}
                        >
                          CLOSE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile: pad portal target — bottom of sheet, empty until #77 renders pads */}
        {!isDesktop && (
          <div
            data-coingame-pad-slot
            ref={padSlotRef}
            style={{
              flexShrink: 0,
              width: '100%',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          />
        )}
    </div>
  )
}
