// Coin Catch — Arcade easter-egg game. Endless survival: move the pot
// left/right to catch falling coins; 3 misses ends the run. Fall speed and
// spawn frequency ramp continuously as elapsed time grows.
//
// Motion contract (load-bearing): no SVG <animate> anywhere under
// [data-direction="arcade"]. Motion = div transforms driven by React state.
// Under reduced motion: discrete tick-step variant (fully playable, no rAF).

import { useEffect, useRef, useState } from 'react'
import { ARC } from '../tokens'
import { PotOfGold, WIDTH as POT_W, HEIGHT as POT_H } from './PotOfGold'

const FIELD_W = 440
const FIELD_H = 320
const COIN = 22
const PLAYER_STEP = 34
const MAX_MISSES = 3 // playtest-tunable miss budget

// Smooth (non-reduced) ramp tuning — playtest-tunable
const FALL_START     = 0.10   // px/ms at game start
const FALL_CAP       = 0.50   // px/ms at full ramp
const SPAWN_START_MS = 1200   // spawn interval at game start (ms)
const SPAWN_MIN_MS   = 300    // spawn interval at full ramp (ms)
const RAMP_WINDOW_MS = 25_000 // ms to interpolate from start to cap

// Discrete (reduced-motion) ramp tuning — playtest-tunable
const TICK_MS            = 100  // base interval; small for smooth ramp
const COIN_STEP_START    = 25   // px/tick at game start
const COIN_STEP_CAP      = 65   // px/tick at full ramp
const SPAWN_TICK_START_MS = 1200 // ms between spawns at game start
const SPAWN_TICK_MIN_MS   = 300  // ms between spawns at full ramp

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, t)

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
  const [playerX, setPlayerX] = useState((FIELD_W - POT_W) / 2)
  const [coins, setCoins] = useState<Coin[]>([])
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)

  // Authoritative mutable game state (refs — render state is a mirror).
  const playerXRef = useRef(playerX)
  const coinsRef = useRef<Coin[]>([])
  const scoreRef = useRef(0)
  const missesRef = useRef(0)
  const elapsedRef = useRef(0)
  const spawnAccRef = useRef(0)
  const nextIdRef = useRef(1)
  const finishedRef = useRef(false)
  const onGameOverRef = useRef(onGameOver)
  useEffect(() => {
    onGameOverRef.current = onGameOver
  })

  const playerTopY = FIELD_H - POT_H

  // Window-capture key handler. Capture phase ensures LiveShell's 1–4 switcher
  // never sees Arrow/A/D while the game is mounted. Escape bubbles (overlay closes).
  useEffect(() => {
    const move = (dir: -1 | 1) => {
      const next = Math.max(
        0,
        Math.min(FIELD_W - POT_W, playerXRef.current + dir * PLAYER_STEP),
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
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  // Game loop. Non-reduced: rAF with real dt. Reduced: small base interval
  // (TICK_MS) with spawn accumulator so both step size and spawn rate ramp.
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
        const overlap = c.x + COIN > px0 && c.x < px0 + POT_W
        if (reachedBand && overlap) {
          scoreRef.current += 1
          continue // caught
        }
        if (c.y > FIELD_H) {
          missesRef.current += 1 // missed
          continue
        }
        kept.push(c)
      }
      coinsRef.current = kept
    }

    const mirror = () => {
      setCoins(coinsRef.current.map(c => ({ ...c })))
      setScore(scoreRef.current)
      setMisses(missesRef.current)
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
        const t = elapsedRef.current / RAMP_WINDOW_MS
        const coinStep      = lerp(COIN_STEP_START, COIN_STEP_CAP, t)
        const spawnInterval = lerp(SPAWN_TICK_START_MS, SPAWN_TICK_MIN_MS, t)

        spawnAccRef.current += TICK_MS
        if (spawnAccRef.current >= spawnInterval) {
          spawnAccRef.current -= spawnInterval
          spawn()
        }

        coinsRef.current = coinsRef.current.map(c => ({
          ...c,
          y: c.y + coinStep,
        }))
        resolveCollisions()
        if (missesRef.current >= MAX_MISSES) {
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

      const t = elapsedRef.current / RAMP_WINDOW_MS
      const fallSpeed     = lerp(FALL_START, FALL_CAP, t)
      const spawnInterval = lerp(SPAWN_START_MS, SPAWN_MIN_MS, t)

      spawnAccRef.current += dt
      if (spawnAccRef.current >= spawnInterval) {
        spawnAccRef.current -= spawnInterval
        spawn()
      }

      coinsRef.current = coinsRef.current.map(c => ({
        ...c,
        y: c.y + fallSpeed * dt,
      }))
      resolveCollisions()
      if (missesRef.current >= MAX_MISSES) {
        finish()
        return
      }
      mirror()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduced, playerTopY])

  const livesLeft = MAX_MISSES - misses

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
      {/* HUD: score + lives */}
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
        <span data-coingame-lives style={{ color: ARC.neon1 }}>
          {'●'.repeat(Math.max(0, livesLeft))}{'○'.repeat(Math.min(misses, MAX_MISSES))}
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
          width: POT_W,
          height: POT_H,
        }}
      >
        <PotOfGold />
      </div>
    </div>
  )
}
