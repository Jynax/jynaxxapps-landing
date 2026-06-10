// TRACE modal overlay (Task #40). Mirrors CoinGameOverlay's pattern:
// attract → playing → over. "Locked today" renders instead of attract when the
// player has already completed today's puzzle.
//
// Test seam: window.__TRACE_TEST__?.{ dateISO, puzzleId } overrides the date /
// forces a specific puzzle for deterministic e2e — only consumed here.

import { useState, useEffect, useRef } from 'react'
import { puzzleForDate, bfsShortestPath } from './traceLogic'
import type { Puzzle } from './traceLogic'
import { PUZZLES } from './puzzles'
import { WORD_SET } from './words5'
import { isLockedToday, loadState, recordResult } from './traceStorage'
import type { TraceState } from './traceStorage'
import { formatShare } from './traceShare'
import { useReducedMotion } from '../../parts/useReducedMotion'
import { useFocusTrap } from '../../parts/useFocusTrap'
import { TraceGame } from './TraceGame'
import { TraceMobilePlay } from './TraceMobilePlay'
import { BottomSheet } from '../../../shell/BottomSheet'
import { useIsMobile } from '../../parts/useIsMobile'

declare global {
  interface Window {
    __TRACE_TEST__?: { dateISO?: string; puzzleId?: number }
  }
}

type Phase = 'attract' | 'playing' | 'over'

interface OverData {
  result: 'win' | 'loss'
  path:   string[]
  route:  string[] | null  // BFS route revealed on loss
  state:  TraceState
}

function useCountdown(): string {
  const compute = () => {
    const now = new Date()
    const mn  = new Date(now); mn.setHours(24, 0, 0, 0)
    const ms  = Math.max(0, mn.getTime() - now.getTime())
    const h   = Math.floor(ms / 3600000)
    const m   = Math.floor((ms % 3600000) / 60000)
    const s   = Math.floor((ms % 60000) / 1000)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }
  const [cd, setCd] = useState(compute)
  useEffect(() => {
    const id = setInterval(() => setCd(compute()), 1000)
    return () => clearInterval(id)
  }, [])
  return cd
}

export function TraceOverlay({ onClose }: { onClose: () => void }) {
  const reduced   = useReducedMotion()
  const countdown = useCountdown()
  const mobile    = useIsMobile()

  // Computed once on mount — stable for the lifetime of this overlay instance.
  const [{ today, puzzle, locked, savedState }] = useState<{
    today:      Date
    puzzle:     Puzzle
    locked:     boolean
    savedState: TraceState | null
  }>(() => {
    const to = typeof window !== 'undefined' ? window.__TRACE_TEST__ : undefined
    const d: Date = to?.dateISO ? new Date(to.dateISO + 'T12:00:00') : new Date()
    const p: Puzzle = to?.puzzleId !== undefined
      ? (PUZZLES.find(q => q.id === to!.puzzleId) ?? puzzleForDate(d, PUZZLES))
      : puzzleForDate(d, PUZZLES)
    const lk = isLockedToday(localStorage, d)
    return { today: d, puzzle: p, locked: lk, savedState: lk ? loadState(localStorage) : null }
  })

  const [phase,    setPhase]    = useState<Phase>('attract')
  const [overData, setOverData] = useState<OverData | null>(null)
  const [copied,   setCopied]   = useState(false)

  const panelRef        = useRef<HTMLDivElement>(null)
  const phaseRef        = useRef<Phase>(phase)
  const onCloseRef      = useRef(onClose)
  const copyTimer       = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => { phaseRef.current = phase },   [phase])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Focus the desktop panel on open, restore focus on close. On mobile the
  // BottomSheet owns its surface and TraceMobilePlay focuses its own input.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    if (!mobile) panelRef.current?.focus()
    return () => prev?.focus()
  }, [mobile])

  // Focus trap: Tab/Shift+Tab cycle within the desktop panel only.
  useFocusTrap(panelRef, !mobile)

  // Global key handler: ESC always closes; ENTER advances from attract/over.
  // 1–4 keys suppressed so the LiveShell direction switcher can't fire.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation()
        onCloseRef.current(); return
      }
      if (e.key === 'Enter') {
        if (phaseRef.current === 'attract' && !locked) {
          e.preventDefault(); e.stopPropagation()
          setPhase('playing'); return
        }
        if (phaseRef.current === 'over') {
          e.preventDefault(); e.stopPropagation()
          onCloseRef.current(); return
        }
      }
      if ('1234'.includes(e.key)) e.stopPropagation()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [locked])

  const handleGameEnd = (result: 'win' | 'loss', path: string[]) => {
    const route = result === 'loss' ? bfsShortestPath(puzzle.start, puzzle.target, WORD_SET) : null
    recordResult(localStorage, { result, path }, today)
    const state = loadState(localStorage)
    setOverData({ result, path, route, state })
    setPhase('over')
  }

  const doCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      el.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(el); el.select()
      try { document.execCommand('copy') } catch { /* ignored */ }
      document.body.removeChild(el)
    }
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current) }, [])

  const mono = { fontFamily: 'var(--font-mono)' } as const

  // ── Shared UI fragments ────────────────────────────────────────────────────

  const countdownLine = (
    <div style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: 'var(--term-fg-dim)', marginTop: 18 }}>
      next route in{' '}
      <span style={{ color: 'var(--term-fg)', fontVariantNumeric: 'tabular-nums' }}>
        {countdown}
      </span>
    </div>
  )

  const shareBlock = (text: string) => (
    <div style={{ marginTop: 16 }}>
      <pre style={{
        ...mono, fontSize: 12, lineHeight: 1.7, margin: 0,
        color: 'var(--term-fg)', textShadow: 'var(--term-glow)',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {text}
      </pre>
      <button
        type="button"
        data-trace-copy
        onClick={() => doCopy(text)}
        style={{
          ...mono, marginTop: 12, fontSize: 11, letterSpacing: '0.1em',
          color:       copied ? 'var(--term-accent)' : 'var(--term-fg-dim)',
          background:  'transparent',
          border:      `1px solid ${copied ? 'var(--term-accent)' : 'rgba(244,185,66,0.28)'}`,
          padding:     '5px 14px', cursor: 'pointer',
        }}
      >
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  )

  // ── Mobile sheet body — attract phase ─────────────────────────────────────

  const mobileAttractBody = (
    <div data-trace-attract style={{ padding: '0 16px 24px' }}>
      {/* Streak counter top-left per §M.9 */}
      {savedState && (
        <div style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: 'var(--term-fg-dim)', marginBottom: 14 }}>
          streak{' '}
          <span style={{ color: 'var(--term-fg)' }}>{savedState.streak}</span>
          {' · best '}
          <span style={{ color: 'var(--term-fg)' }}>{savedState.maxStreak}</span>
        </div>
      )}

      {locked && savedState && savedState.lastResult != null ? (
        /* Locked today */
        <div data-trace-locked>
          <div style={{
            ...mono, fontSize: 12, letterSpacing: '0.12em',
            color: savedState.lastResult === 'win' ? 'var(--term-accent)' : 'var(--term-danger)',
            textShadow: 'var(--term-glow)', marginBottom: 10,
          }}>
            {savedState.lastResult === 'win'
              ? '[ OK ] route resolved'
              : '[FAIL] no route — connection dropped'}
          </div>
          {shareBlock(formatShare({
            id:        puzzle.id,
            result:    savedState.lastResult,
            moves:     Math.max(0, savedState.lastPath.length - 1),
            par:       puzzle.par,
            streak:    savedState.streak,
            maxStreak: savedState.maxStreak,
          }))}
          {countdownLine}
        </div>
      ) : (
        /* Attract — start/target display */
        <div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', color: 'var(--term-fg-dim)', marginBottom: 10 }}>
            daily route #{puzzle.id}
          </div>
          <div
            data-trace-puzzle
            style={{
              ...mono, fontSize: 20, letterSpacing: '0.2em',
              color: 'var(--term-fg-bright)', textShadow: 'var(--term-glow)',
              marginBottom: 22,
            }}
          >
            {puzzle.start.toUpperCase()} → {puzzle.target.toUpperCase()}
          </div>
          <button
            type="button"
            data-trace-begin
            onClick={() => setPhase('playing')}
            style={{
              ...mono, fontSize: 11, letterSpacing: '0.18em',
              height: 48,
              color: 'var(--term-bg)', background: 'var(--term-fg-bright)',
              border: 'none', padding: '0 20px', cursor: 'pointer',
              boxShadow: '0 0 14px rgba(244,185,66,0.45)',
              width: '100%',
            }}
          >
            [ PRESS TO BEGIN ]
          </button>
        </div>
      )}
    </div>
  )

  // ── Mobile sheet body — playing phase ─────────────────────────────────────
  //
  // §M.9 play surface: stacked 5-tile rows + hidden OS-keyboard input. Built as
  // a separate component because mobile soft keyboards need an <input> event
  // model, not the hardware-keydown model the desktop TraceGame uses.

  const mobilePlayingBody = (
    <TraceMobilePlay puzzle={puzzle} onEnd={handleGameEnd} />
  )

  // ── Mobile sheet body — over phase ────────────────────────────────────────

  const mobileOverBody = overData && (
    <div style={{ padding: '0 16px 24px' }}>
      {/* Streak counter top-left §M.9 */}
      <div style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: 'var(--term-fg-dim)', marginBottom: 12 }}>
        streak{' '}
        <span style={{ color: 'var(--term-fg)' }}>{overData.state.streak}</span>
        {' · best '}
        <span style={{ color: 'var(--term-fg)' }}>{overData.state.maxStreak}</span>
      </div>

      <div style={{
        ...mono, fontSize: 14, letterSpacing: '0.12em',
        color: overData.result === 'win' ? 'var(--term-accent)' : 'var(--term-danger)',
        textShadow: 'var(--term-glow)', marginBottom: 10,
      }}>
        {overData.result === 'win'
          ? '[ OK ] route resolved'
          : '[FAIL] no route — connection dropped'}
      </div>

      {/* Win: move count */}
      {overData.result === 'win' && (
        <div style={{ ...mono, fontSize: 12, letterSpacing: '0.06em', color: 'var(--term-fg-dim)', marginBottom: 10 }}>
          {overData.path.length - 1} moves · par {puzzle.par}
        </div>
      )}

      {/* Player's actual path as stacked words */}
      <div data-trace-player-path style={{ display: 'inline-block', textAlign: 'left', marginBottom: 16 }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--term-fg-dim)', marginBottom: 6 }}>
          your route:
        </div>
        {overData.path.map((word, i) => (
          <div key={i} style={{
            ...mono, fontSize: 16, letterSpacing: '0.25em', lineHeight: 1.4,
            color:      i === 0 ? 'var(--term-fg-dim)' : 'var(--term-accent)',
            textShadow: i === 0 ? 'none'               : 'var(--term-glow)',
          }}>
            {word.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Loss: reveal route */}
      {overData.result === 'loss' && overData.route && (
        <div data-trace-reveal style={{ display: 'inline-block', textAlign: 'left', marginLeft: 24, marginBottom: 16, verticalAlign: 'top' }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--term-fg-dim)', marginBottom: 6 }}>
            one route (par {puzzle.par}):
          </div>
          {overData.route.map((word, i) => (
            <div key={i} style={{
              ...mono, fontSize: 16, letterSpacing: '0.25em', lineHeight: 1.4,
              color:      i === 0 ? 'var(--term-fg-dim)' : 'var(--term-accent)',
              textShadow: i === 0 ? 'none'               : 'var(--term-glow)',
            }}>
              {word.toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {/* Share CTA — bottom of sheet, visible only after solve (§M.9) */}
      {shareBlock(formatShare({
        id:        puzzle.id,
        result:    overData.result,
        moves:     overData.path.length - 1,
        par:       puzzle.par,
        streak:    overData.state.streak,
        maxStreak: overData.state.maxStreak,
      }))}

      {countdownLine}

      <div style={{ ...mono, fontSize: 9, letterSpacing: '0.14em', color: 'var(--term-fg-dim)', marginTop: 16 }}>
        ESC OR SWIPE TO CLOSE
      </div>
    </div>
  )

  // ── Mobile render path ─────────────────────────────────────────────────────

  if (mobile) {
    const sheetTitle = (
      <div style={{
        ...mono,
        fontSize: 11,
        letterSpacing: '0.14em',
        color: 'var(--term-fg-dim)',
        textTransform: 'uppercase' as const,
      }}>
        TRACE{' '}
        <span style={{ color: 'rgba(244,185,66,0.4)' }}>·</span>
        {' '}daily word ladder
      </div>
    )

    return (
      <>
        {/* Screen reader live-region (polite) — same as desktop */}
        <div aria-live="polite" aria-atomic="true" style={{
          position: 'absolute', width: 1, height: 1, overflow: 'hidden',
          clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
        }}>
          {phase === 'over' && overData
            ? overData.result === 'win' ? 'Route resolved.' : 'No route — connection dropped.'
            : ''}
        </div>

        <BottomSheet
          open
          onClose={onClose}
          heightVh={90}
          closeGlyph="[ESC]"
          title={sheetTitle}
          aria-label="TRACE — daily word puzzle"
        >
          <div data-trace-sheet data-trace-phase={phase}>
            {phase === 'attract' && mobileAttractBody}
            {phase === 'playing' && mobilePlayingBody}
            {phase === 'over'    && mobileOverBody}
          </div>
        </BottomSheet>
      </>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      data-trace-overlay
      data-trace-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label="TRACE — daily word puzzle"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,8,5,0.90)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        padding: 20,
      }}
    >
      {/* Visually-hidden polite announcer for screen readers */}
      <div aria-live="polite" aria-atomic="true" style={{
        position: 'absolute', width: 1, height: 1, overflow: 'hidden',
        clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
      }}>
        {phase === 'over' && overData
          ? overData.result === 'win' ? 'Route resolved.' : 'No route — connection dropped.'
          : ''}
      </div>

      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 480, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto',
          padding: '28px 28px 24px',
          border: '2px solid var(--term-fg-bright)',
          background: 'rgba(10,8,5,0.97)',
          boxShadow: '0 0 40px rgba(244,185,66,0.22)',
          outline: 'none',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          data-trace-close
          onClick={onClose}
          aria-label="Close TRACE"
          style={{
            position: 'absolute', top: 8, right: 10,
            background: 'transparent', border: 'none',
            color: 'var(--term-fg-dim)', cursor: 'pointer',
            ...mono, fontSize: 11, lineHeight: 1, padding: 4,
          }}
        >
          [ X ]
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            ...mono, fontSize: 9, letterSpacing: '0.3em',
            color: 'var(--term-fg-dim)', marginBottom: 8,
          }}>
            ─── TERMINAL ───
          </div>
          <div style={{
            ...mono, fontSize: 22, letterSpacing: '0.2em',
            color: 'var(--term-fg-bright)', textShadow: 'var(--term-glow-strong)',
          }}>
            TRACE
          </div>
        </div>

        {/* ── ATTRACT ── */}
        {phase === 'attract' && (
          locked && savedState && savedState.lastResult != null ? (

            /* Locked today */
            <div data-trace-locked style={{ textAlign: 'center' }}>
              <div style={{
                ...mono, fontSize: 12, letterSpacing: '0.12em',
                color: savedState.lastResult === 'win' ? 'var(--term-accent)' : 'var(--term-danger)',
                textShadow: 'var(--term-glow)', marginBottom: 10,
              }}>
                {savedState.lastResult === 'win'
                  ? '[ OK ] route resolved'
                  : '[FAIL] no route — connection dropped'}
              </div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: 'var(--term-fg-dim)', marginBottom: 4 }}>
                streak{' '}
                <span style={{ color: 'var(--term-fg)' }}>{savedState.streak}</span>
                {' · best '}
                <span style={{ color: 'var(--term-fg)' }}>{savedState.maxStreak}</span>
              </div>
              {shareBlock(formatShare({
                id:        puzzle.id,
                result:    savedState.lastResult,
                moves:     Math.max(0, savedState.lastPath.length - 1),
                par:       puzzle.par,
                streak:    savedState.streak,
                maxStreak: savedState.maxStreak,
              }))}
              {countdownLine}
            </div>

          ) : (

            /* Attract */
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.1em', color: 'var(--term-fg-dim)', marginBottom: 6 }}>
                daily route #{puzzle.id}
              </div>
              <div
                data-trace-puzzle
                style={{
                  ...mono, fontSize: 20, letterSpacing: '0.2em',
                  color: 'var(--term-fg-bright)', textShadow: 'var(--term-glow)',
                  marginBottom: 22,
                }}
              >
                {puzzle.start.toUpperCase()} → {puzzle.target.toUpperCase()}
              </div>
              <button
                type="button"
                data-trace-begin
                onClick={() => setPhase('playing')}
                style={{
                  ...mono, fontSize: 11, letterSpacing: '0.18em',
                  color: 'var(--term-bg)', background: 'var(--term-fg-bright)',
                  border: 'none', padding: '10px 20px', cursor: 'pointer',
                  boxShadow: '0 0 14px rgba(244,185,66,0.45)',
                }}
              >
                [ PRESS ENTER TO BEGIN ]
              </button>
              <div style={{ ...mono, fontSize: 9, letterSpacing: '0.14em', color: 'var(--term-fg-dim)', marginTop: 14 }}>
                ENTER · ESC TO EXIT
              </div>
            </div>

          )
        )}

        {/* ── PLAYING ── */}
        {phase === 'playing' && (
          <TraceGame puzzle={puzzle} reduced={reduced} onEnd={handleGameEnd} />
        )}

        {/* ── OVER ── */}
        {phase === 'over' && overData && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              ...mono, fontSize: 14, letterSpacing: '0.12em',
              color: overData.result === 'win' ? 'var(--term-accent)' : 'var(--term-danger)',
              textShadow: 'var(--term-glow)', marginBottom: 12,
            }}>
              {overData.result === 'win'
                ? '[ OK ] route resolved'
                : '[FAIL] no route — connection dropped'}
            </div>

            {/* Win: move count */}
            {overData.result === 'win' && (
              <div style={{ ...mono, fontSize: 12, letterSpacing: '0.06em', color: 'var(--term-fg-dim)', marginBottom: 10 }}>
                {overData.path.length - 1} moves · par {puzzle.par}
              </div>
            )}

            {/* Player's actual path */}
            <div data-trace-player-path style={{ display: 'inline-block', textAlign: 'left', margin: '0 auto 16px' }}>
              <div style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--term-fg-dim)', marginBottom: 6 }}>
                your route:
              </div>
              {overData.path.map((word, i) => (
                <div key={i} style={{
                  ...mono, fontSize: 16, letterSpacing: '0.25em', lineHeight: 1.4,
                  color:      i === 0 ? 'var(--term-fg-dim)' : 'var(--term-accent)',
                  textShadow: i === 0 ? 'none'               : 'var(--term-glow)',
                }}>
                  {word.toUpperCase()}
                </div>
              ))}
            </div>

            {/* Loss: reveal a par-length route */}
            {overData.result === 'loss' && overData.route && (
              <div data-trace-reveal style={{ display: 'inline-block', textAlign: 'left', margin: '0 auto 16px' }}>
                <div style={{ ...mono, fontSize: 10, letterSpacing: '0.1em', color: 'var(--term-fg-dim)', marginBottom: 6 }}>
                  one route (par {puzzle.par}):
                </div>
                {overData.route.map((word, i) => (
                  <div key={i} style={{
                    ...mono, fontSize: 16, letterSpacing: '0.25em', lineHeight: 1.4,
                    color:      i === 0 ? 'var(--term-fg-dim)' : 'var(--term-accent)',
                    textShadow: i === 0 ? 'none'               : 'var(--term-glow)',
                  }}>
                    {word.toUpperCase()}
                  </div>
                ))}
              </div>
            )}

            {/* Streak */}
            <div style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: 'var(--term-fg-dim)', marginBottom: 4 }}>
              streak{' '}
              <span style={{ color: 'var(--term-fg)' }}>{overData.state.streak}</span>
              {' · best '}
              <span style={{ color: 'var(--term-fg)' }}>{overData.state.maxStreak}</span>
            </div>

            {shareBlock(formatShare({
              id:        puzzle.id,
              result:    overData.result,
              moves:     overData.path.length - 1,
              par:       puzzle.par,
              streak:    overData.state.streak,
              maxStreak: overData.state.maxStreak,
            }))}

            {countdownLine}

            <div style={{ ...mono, fontSize: 9, letterSpacing: '0.14em', color: 'var(--term-fg-dim)', marginTop: 18 }}>
              ENTER · ESC TO CLOSE
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
