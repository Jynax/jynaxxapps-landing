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

  const phaseRef = useRef<Phase>(phase)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  const panelRef = useRef<HTMLDivElement>(null)
  const { count: plays, registerPlay } = useArcadePlays()

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
      data-arcade-coingame
      data-coingame-state={phase}
      role="dialog"
      aria-modal="true"
      aria-label={`Arcade mini-game: ${game.label}`}
      onClick={onClose}
      style={{
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
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 520,
          maxWidth: '94vw',
          padding: '28px 28px 24px',
          border: `2px solid ${ARC.neon2}`,
          background: `${ARC.bg}F2`,
          boxShadow: `0 0 32px ${ARC.neon2}55`,
          outline: 'none',
        }}
      >
        <button
          type="button"
          data-coingame-close
          onClick={onClose}
          aria-label="Close mini-game"
          style={{
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
          }}
        >
          ✕
        </button>

        {/* Marquee */}
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

        {phase === 'attract' && (
          <div style={{ textAlign: 'center' }}>
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
                padding: '12px 22px',
                cursor: 'pointer',
                boxShadow: `0 0 16px ${ARC.neon3}88`,
              }}
            >
              ◇ INSERT COIN ◇
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
          </div>
        )}

        {phase === 'playing' && (
          <Game reduced={reduced} onGameOver={handleGameOver} />
        )}

        {phase === 'over' && (
          <div style={{ textAlign: 'center' }}>
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
          </div>
        )}
      </div>
    </div>
  )
}
