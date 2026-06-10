// Coin Catch — Arcade easter-egg game. Endless survival: move the pot
// left/right to catch falling coins; 3 misses ends the run. Fall speed and
// spawn frequency ramp continuously as elapsed time grows.
//
// Motion contract (load-bearing): no SVG <animate> anywhere under
// [data-direction="arcade"]. Motion = div transforms driven by React state.
// Under reduced motion: discrete tick-step variant (fully playable, no rAF).

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ARC } from '../tokens'
import { PotOfGold, WIDTH as POT_W_DEFAULT, HEIGHT as POT_H_DEFAULT } from './PotOfGold'
import { useMediaQuery } from '../../parts/useMediaQuery'

const FIELD_W = 440
const FIELD_H = 320
const COIN = 22
const PLAYER_STEP = 34
const GLIDE_PX_PER_MS = 0.30 // held-key / pad glide speed (px/ms)
const MAX_MISSES = 3 // playtest-tunable miss budget

// Smooth (non-reduced) ramp tuning — playtest-tunable
const FALL_START     = 0.10   // px/ms at game start
const FALL_CAP       = 0.50   // px/ms at full ramp (base; coarse softened ×0.85)
const SPAWN_START_MS = 1200   // spawn interval at game start (ms)
const SPAWN_MIN_MS   = 300    // spawn interval at full ramp (ms)
const RAMP_WINDOW_MS = 25_000 // ms to interpolate from start to cap

// Discrete (reduced-motion) ramp tuning — playtest-tunable
const TICK_MS             = 100  // base interval; small for smooth ramp
const COIN_STEP_START     = 25   // px/tick at game start
const COIN_STEP_CAP       = 65   // px/tick at full ramp (base; coarse softened ×0.85)
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
  // Separate from isDesktop — gates touch drag, pads, paddle size, speed cap.
  const isCoarsePointer = useMediaQuery('(pointer: coarse)')

  // Paddle dimensions derived from pointer type; drives collision math.
  const POT_W = isCoarsePointer ? 64 : POT_W_DEFAULT  // 64 touch / 60 mouse
  const POT_H = isCoarsePointer ? 60 : POT_H_DEFAULT  // 60 touch / 68 mouse

  // Speed-cap softening on coarse pointer (applied at cap, not start).
  const fallCapEff     = isCoarsePointer ? FALL_CAP * 0.85 : FALL_CAP
  const coinStepCapEff = isCoarsePointer ? COIN_STEP_CAP * 0.85 : COIN_STEP_CAP

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
  const fieldRef = useRef<HTMLDivElement>(null)
  const keysHeldRef = useRef(new Set<string>())
  // Active pad direction: -1 = left held, 0 = none, 1 = right held.
  const padDirRef = useRef<-1 | 0 | 1>(0)
  // Active drag touch identifier — prevents a pad thumb hijacking drag X.
  const dragIdRef = useRef<number | null>(null)

  // Portal target element for ◀/▶ pads (resolved after mount).
  const [padSlotEl, setPadSlotEl] = useState<Element | null>(null)

  useEffect(() => {
    onGameOverRef.current = onGameOver
  })

  const playerTopY = FIELD_H - POT_H

  // Resolve [data-coingame-pad-slot] for portal rendering (#76 contract).
  // setState called inside a setTimeout callback (not the synchronous effect
  // body) to satisfy react-hooks/set-state-in-effect; the slot element is
  // guaranteed to be in the DOM once the overlay is open, so a 0ms defer is safe.
  useEffect(() => {
    if (!isCoarsePointer) return
    const id = setTimeout(() => {
      setPadSlotEl(document.querySelector('[data-coingame-pad-slot]'))
    }, 0)
    return () => clearTimeout(id)
  }, [isCoarsePointer])

  // Window-capture key handler. Capture phase ensures LiveShell's 1–4 switcher
  // never sees Arrow/A/D while the game is mounted. Escape bubbles (overlay closes).
  // keydown: immediate step + held-key tracking; keyup: clears held state.
  useEffect(() => {
    const move = (dir: -1 | 1) => {
      const next = Math.max(
        0,
        Math.min(FIELD_W - POT_W, playerXRef.current + dir * PLAYER_STEP),
      )
      playerXRef.current = next
      setPlayerX(next)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        e.preventDefault()
        e.stopPropagation()
        keysHeldRef.current.add(k)
        move(-1)
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        e.preventDefault()
        e.stopPropagation()
        keysHeldRef.current.add(k)
        move(1)
      } else if (k === ' ' || k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.key)
    }
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCoarsePointer]) // re-register when POT_W clamp changes

  // Pointer-follow (non-reduced + non-coarse only). Centers the pot on the cursor X.
  useEffect(() => {
    if (reduced || isCoarsePointer) return
    const el = fieldRef.current
    if (!el) return
    const onPointerMove = (e: PointerEvent) => {
      if (finishedRef.current) return
      const rect = el.getBoundingClientRect()
      const next = Math.max(0, Math.min(FIELD_W - POT_W, e.clientX - rect.left - POT_W / 2))
      playerXRef.current = next
      setPlayerX(next)
    }
    el.addEventListener('pointermove', onPointerMove)
    return () => el.removeEventListener('pointermove', onPointerMove)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, isCoarsePointer]) // POT_W covered transitively via isCoarsePointer

  // Touch drag — coarse-pointer only. Attaches to [data-coingame-field].
  // Tracks active touch by identifier so a thumb on a pad never hijacks drag X.
  useEffect(() => {
    if (!isCoarsePointer) return
    const el = fieldRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (dragIdRef.current !== null) return
      const touch = e.changedTouches[0]
      dragIdRef.current = touch.identifier
      const rect = el.getBoundingClientRect()
      const next = Math.max(0, Math.min(FIELD_W - POT_W, touch.clientX - rect.left - POT_W / 2))
      playerXRef.current = next
      setPlayerX(next)
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault() // suppress page scroll while dragging
      if (dragIdRef.current === null) return
      let found: Touch | null = null
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === dragIdRef.current) {
          found = e.changedTouches[i]
          break
        }
      }
      if (!found) return
      const rect = el.getBoundingClientRect()
      const next = Math.max(0, Math.min(FIELD_W - POT_W, found.clientX - rect.left - POT_W / 2))
      playerXRef.current = next
      setPlayerX(next)
    }
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === dragIdRef.current) {
          dragIdRef.current = null
          break
        }
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCoarsePointer]) // POT_W covered transitively via isCoarsePointer

  // Game loop. Non-reduced: rAF with real dt. Reduced: small base interval
  // (TICK_MS) with spawn accumulator so both step size and spawn rate ramp.
  // playerTopY in deps covers all isCoarsePointer-derived values transitively.
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
        const coinStep      = lerp(COIN_STEP_START, coinStepCapEff, t)
        const spawnInterval = lerp(SPAWN_TICK_START_MS, SPAWN_TICK_MIN_MS, t)

        spawnAccRef.current += TICK_MS
        if (spawnAccRef.current >= spawnInterval) {
          spawnAccRef.current -= spawnInterval
          spawn()
        }

        // Pad glide in reduced-motion tick (same speed constant as smooth loop).
        if (padDirRef.current !== 0) {
          const next = Math.max(
            0,
            Math.min(FIELD_W - POT_W, playerXRef.current + padDirRef.current * GLIDE_PX_PER_MS * TICK_MS),
          )
          playerXRef.current = next
          setPlayerX(next)
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
      const fallSpeed     = lerp(FALL_START, fallCapEff, t)
      const spawnInterval = lerp(SPAWN_START_MS, SPAWN_MIN_MS, t)

      spawnAccRef.current += dt
      if (spawnAccRef.current >= spawnInterval) {
        spawnAccRef.current -= spawnInterval
        spawn()
      }

      // Held-key + pad glide (continuous movement while held or pad pressed).
      const leftHeld  =
        keysHeldRef.current.has('ArrowLeft') ||
        keysHeldRef.current.has('a') ||
        keysHeldRef.current.has('A') ||
        padDirRef.current === -1
      const rightHeld =
        keysHeldRef.current.has('ArrowRight') ||
        keysHeldRef.current.has('d') ||
        keysHeldRef.current.has('D') ||
        padDirRef.current === 1
      if (leftHeld || rightHeld) {
        const dir = (rightHeld ? 1 : 0) - (leftHeld ? 1 : 0)
        const next = Math.max(0, Math.min(FIELD_W - POT_W, playerXRef.current + dir * GLIDE_PX_PER_MS * dt))
        playerXRef.current = next
        setPlayerX(next)
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

    // Pause the loop when the tab is hidden; reset lastTs on resume so hidden
    // time doesn't count as a huge dt spike.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        cancelAnimationFrame(raf)
      } else {
        lastTs = null
        raf = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, playerTopY]) // playerTopY covers all isCoarsePointer-derived values

  const livesLeft = MAX_MISSES - misses

  return (
    <>
      <div
        ref={fieldRef}
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
        {/* HUD: score + lives — position unchanged from desktop */}
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
          <PotOfGold width={POT_W} height={POT_H} />
        </div>
      </div>

      {/* ◀ / ▶ pads — portal into [data-coingame-pad-slot] when on coarse pointer */}
      {isCoarsePointer && padSlotEl && createPortal(
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 16px',
            width: '100%',
            boxSizing: 'border-box' as const,
          }}
        >
          <button
            type="button"
            aria-label="Slide left"
            onPointerDown={() => { padDirRef.current = -1 }}
            onPointerUp={() => { if (padDirRef.current === -1) padDirRef.current = 0 }}
            onPointerLeave={() => { if (padDirRef.current === -1) padDirRef.current = 0 }}
            onPointerCancel={() => { if (padDirRef.current === -1) padDirRef.current = 0 }}
            style={{
              width: 72,
              height: 72,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: ARC.bgLight,
                border: `1px solid ${ARC.neon2}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...px,
                fontSize: 20,
                color: ARC.neon2,
                userSelect: 'none' as const,
                pointerEvents: 'none' as const,
              }}
            >
              ◀
            </div>
          </button>

          <button
            type="button"
            aria-label="Slide right"
            onPointerDown={() => { padDirRef.current = 1 }}
            onPointerUp={() => { if (padDirRef.current === 1) padDirRef.current = 0 }}
            onPointerLeave={() => { if (padDirRef.current === 1) padDirRef.current = 0 }}
            onPointerCancel={() => { if (padDirRef.current === 1) padDirRef.current = 0 }}
            style={{
              width: 72,
              height: 72,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: ARC.bgLight,
                border: `1px solid ${ARC.neon2}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...px,
                fontSize: 20,
                color: ARC.neon2,
                userSelect: 'none' as const,
                pointerEvents: 'none' as const,
              }}
            >
              ▶
            </div>
          </button>
        </div>,
        padSlotEl,
      )}
    </>
  )
}
