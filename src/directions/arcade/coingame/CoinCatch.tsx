// Coin Catch — game 1 of the Arcade "insert coin" easter-egg rotation
// (Task #29). Timed 15s run: move the chibi player left/right, catch falling
// coins, misses don't score. Final score bubbles up via onGameOver and feeds
// the HUD HI-SCORE.
//
// Motion contract (load-bearing — matches the Arcade reduced-motion e2e: no
// SVG <animate> anywhere under [data-direction="arcade"]): this game animates
// with div transforms driven by React state, never SMIL. Under reduced motion
// it switches to a discrete tick-step variant (coins drop one step per beat),
// so it stays fully playable without continuous motion.

import { useEffect, useRef, useState } from 'react'
import { ARC } from '../tokens'
import { PlayerSprite } from '../PlayerSprite'

const FIELD_W = 440
const FIELD_H = 320
const PLAYER_W = 78
const PLAYER_H = 86
const COIN = 22
const PLAYER_STEP = 34
const DURATION_MS = 15_000

// Smooth (non-reduced) tuning.
const FALL_PX_PER_MS = 0.16
const SPAWN_MS = 850

// Discrete (reduced-motion) tuning.
const TICK_MS = 650
const COIN_STEP = 42
const SPAWN_EVERY_TICKS = 2

interface Coin {
  id: number
  x: number
  y: number
}

const px = { fontFamily: 'var(--font-pixel)' } as const

export function CoinCatch({
  reduced,
  onGameOver,
}: {
  reduced: boolean
  onGameOver: (score: number) => void
}) {
  const [playerX, setPlayerX] = useState((FIELD_W - PLAYER_W) / 2)
  const [coins, setCoins] = useState<Coin[]>([])
  const [score, setScore] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(DURATION_MS / 1000))

  // Authoritative mutable game state (refs — render state is a mirror).
  const playerXRef = useRef(playerX)
  const coinsRef = useRef<Coin[]>([])
  const scoreRef = useRef(0)
  const elapsedRef = useRef(0)
  const spawnAccRef = useRef(0)
  const tickRef = useRef(0)
  const nextIdRef = useRef(1)
  const finishedRef = useRef(false)
  const onGameOverRef = useRef(onGameOver)
  useEffect(() => {
    onGameOverRef.current = onGameOver
  })

  const playerTopY = FIELD_H - PLAYER_H

  // Single window-capture key handler for movement. Capture phase + the game
  // being mounted only while playing means LiveShell's 1–4 switcher never sees
  // these. Escape is deliberately left to bubble (the overlay shell closes on
  // it). Arrow/Space defaults are prevented so the page behind never scrolls.
  useEffect(() => {
    const move = (dir: -1 | 1) => {
      const next = Math.max(
        0,
        Math.min(FIELD_W - PLAYER_W, playerXRef.current + dir * PLAYER_STEP),
      )
      playerXRef.current = next
      setPlayerX(next)
    }
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        e.preventDefault()
        e.stopPropagation()
        move(-1)
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        e.preventDefault()
        e.stopPropagation()
        move(1)
      } else if (k === ' ' || k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault() // swallow scroll keys while playing
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  // Game loop. Non-reduced: requestAnimationFrame with real dt. Reduced:
  // a slow discrete interval (coins step down one row per beat).
  useEffect(() => {
    finishedRef.current = false

    const spawn = () => {
      const x = Math.floor(Math.random() * (FIELD_W - COIN))
      coinsRef.current = [
        ...coinsRef.current,
        { id: nextIdRef.current++, x, y: -COIN },
      ]
    }

    const resolveCollisions = () => {
      const px0 = playerXRef.current
      const kept: Coin[] = []
      for (const c of coinsRef.current) {
        const reachedBand = c.y + COIN >= playerTopY
        const overlap = c.x + COIN > px0 && c.x < px0 + PLAYER_W
        if (reachedBand && overlap) {
          scoreRef.current += 1
          continue // caught — remove
        }
        if (c.y > FIELD_H) continue // missed — remove, no score
        kept.push(c)
      }
      coinsRef.current = kept
    }

    const mirror = () => {
      setCoins(coinsRef.current.map(c => ({ ...c })))
      setScore(scoreRef.current)
      setSecondsLeft(
        Math.max(0, Math.ceil((DURATION_MS - elapsedRef.current) / 1000)),
      )
    }

    const finish = () => {
      if (finishedRef.current) return
      finishedRef.current = true
      mirror()
      onGameOverRef.current(scoreRef.current)
    }

    if (reduced) {
      const id = setInterval(() => {
        elapsedRef.current += TICK_MS
        tickRef.current += 1
        if (tickRef.current % SPAWN_EVERY_TICKS === 0) spawn()
        coinsRef.current = coinsRef.current.map(c => ({
          ...c,
          y: c.y + COIN_STEP,
        }))
        resolveCollisions()
        if (elapsedRef.current >= DURATION_MS) {
          clearInterval(id)
          finish()
          return
        }
        mirror()
      }, TICK_MS)
      return () => clearInterval(id)
    }

    let raf = 0
    let lastTs: number | null = null
    const loop = (ts: number) => {
      if (lastTs === null) lastTs = ts
      const dt = ts - lastTs
      lastTs = ts
      elapsedRef.current += dt
      spawnAccRef.current += dt
      if (spawnAccRef.current >= SPAWN_MS) {
        spawnAccRef.current -= SPAWN_MS
        spawn()
      }
      coinsRef.current = coinsRef.current.map(c => ({
        ...c,
        y: c.y + FALL_PX_PER_MS * dt,
      }))
      resolveCollisions()
      if (elapsedRef.current >= DURATION_MS) {
        finish()
        return
      }
      mirror()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduced, playerTopY])

  return (
    <div
      data-coingame-field
      style={{
        position: 'relative',
        width: FIELD_W,
        maxWidth: '90vw',
        height: FIELD_H,
        margin: '0 auto',
        border: `2px solid ${ARC.neon2}66`,
        background:
          `radial-gradient(ellipse at 50% 0%, ${ARC.bgLight} 0%, ${ARC.bg} 70%)`,
        overflow: 'hidden',
        boxShadow: `inset 0 0 40px ${ARC.neon2}22`,
      }}
    >
      {/* HUD: score + clock */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 10,
          right: 10,
          display: 'flex',
          justifyContent: 'space-between',
          ...px,
          fontSize: 10,
          letterSpacing: '0.12em',
          color: ARC.dim,
          zIndex: 2,
        }}
      >
        <span data-coingame-score style={{ color: ARC.neon3 }}>
          SCORE&nbsp;<span style={{ color: ARC.ink }}>{score}</span>
        </span>
        <span data-coingame-timer style={{ color: ARC.neon2 }}>
          TIME&nbsp;<span style={{ color: ARC.ink }}>{secondsLeft}</span>
        </span>
      </div>

      {coins.map(c => (
        <div
          key={c.id}
          data-coingame-coin
          aria-hidden="true"
          style={{
            position: 'absolute',
            transform: `translate(${c.x}px, ${c.y}px)`,
            width: COIN,
            height: COIN,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, #FFF1A8 0%, ${ARC.neon3} 55%, #B8860B 100%)`,
            boxShadow: `0 0 8px ${ARC.neon3}AA`,
          }}
        />
      ))}

      <div
        data-coingame-player
        style={{
          position: 'absolute',
          left: 0,
          top: playerTopY,
          transform: `translateX(${playerX}px)`,
          width: PLAYER_W,
          height: PLAYER_H,
        }}
      >
        <PlayerSprite />
      </div>
    </div>
  )
}
