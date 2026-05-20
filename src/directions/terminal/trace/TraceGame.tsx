// TRACE play screen (Task #40). Handles keydown input, renders the word ladder,
// entry line, HUD, error flash, and phosphor keyboard. No browser dependency —
// only uses window keydown, which the overlay suppresses from the LiveShell
// direction-switcher via stopPropagation.

import { useState, useEffect, useRef } from 'react'
import { createGame, submitWord } from './traceLogic'
import type { Puzzle, Game, SubmitError } from './traceLogic'
import { WORD_SET } from './words5'
import { PhosphorKeyboard } from '../PhosphorKeyboard'

const BLINK = `@keyframes jx-term-live-blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }`

const ERR: Record<SubmitError, string> = {
  length:  '5 letters',
  notword: 'not a word',
  toofar:  'change one letter',
  same:    'already there',
}

export function TraceGame({
  puzzle,
  reduced,
  onEnd,
}: {
  puzzle:  Puzzle
  reduced: boolean
  onEnd:   (result: 'win' | 'loss', path: string[]) => void
}) {
  const [game,     setGame]     = useState<Game>(() => createGame(puzzle))
  const [entry,    setEntry]    = useState('')
  const [lastChar, setLastChar] = useState('')
  const [error,    setError]    = useState<string | null>(null)

  // Refs keep event-listener closures fresh without re-registering on every render.
  const gameRef      = useRef(game);     gameRef.current     = game
  const entryRef     = useRef(entry);    entryRef.current    = entry
  const onEndRef     = useRef(onEnd);    onEndRef.current    = onEnd
  const reducedRef   = useRef(reduced);  reducedRef.current  = reduced
  const errorTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameRef.current.status !== 'playing') return

      if (e.key === 'Enter') {
        e.preventDefault(); e.stopPropagation()
        const { game: next, error: err } = submitWord(gameRef.current, entryRef.current, WORD_SET)
        if (err) {
          setError(ERR[err])
          if (errorTimer.current) clearTimeout(errorTimer.current)
          errorTimer.current = setTimeout(() => setError(null), reducedRef.current ? 0 : 1200)
          return
        }
        setGame(next)
        setEntry('')
        setLastChar('')
        setError(null)
        if (next.status !== 'playing') {
          onEndRef.current(next.status === 'won' ? 'win' : 'loss', next.path)
        }
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        setEntry(prev => prev.slice(0, -1))
        setLastChar('')
        return
      }

      if (/^[a-zA-Z]$/.test(e.key) && entryRef.current.length < 5) {
        e.preventDefault()
        const ch = e.key.toLowerCase()
        setEntry(prev => prev + ch)
        setLastChar(ch)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => { if (errorTimer.current) clearTimeout(errorTimer.current) }, [])

  const mono = { fontFamily: 'var(--font-mono)' } as const

  return (
    <div data-trace-game style={{ ...mono, fontSize: 14 }}>
      <style>{BLINK}</style>

      {/* HUD */}
      <div style={{
        display: 'flex', gap: 24, marginBottom: 14,
        fontSize: 12, letterSpacing: '0.06em', color: 'var(--term-fg-dim)',
      }}>
        <span>
          {'moves left: '}
          <span style={{ color: game.movesLeft <= 3 ? 'var(--term-danger)' : 'var(--term-fg)' }}>
            {game.movesLeft}
          </span>
        </span>
        <span>
          {'target: '}
          <span style={{ color: 'var(--term-fg-bright)', textShadow: 'var(--term-glow)' }}>
            {game.puzzle.target}
          </span>
        </span>
      </div>

      {/* Word ladder — start dimmed, moves in accent green */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {game.path.map((word, i) => (
          <div key={i} style={{
            letterSpacing: '0.3em', fontSize: 20, lineHeight: 1.2,
            color:      i === 0 ? 'var(--term-fg-dim)' : 'var(--term-accent)',
            textShadow: i === 0 ? 'none'               : 'var(--term-glow)',
          }}>
            {word.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Entry line */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
        fontSize: 20, letterSpacing: '0.3em', lineHeight: 1.2,
        color: 'var(--term-fg)',
      }}>
        <span style={{ color: 'var(--term-fg-dim)', fontSize: 14, letterSpacing: 0 }}>▸</span>
        <span style={{ minWidth: '6ch', textShadow: entry ? 'var(--term-glow)' : 'none' }}>
          {entry.toUpperCase() || '     '}
        </span>
        <span style={{
          color: 'var(--term-fg-bright)', textShadow: 'var(--term-glow-strong)',
          animation: reduced ? 'none' : 'jx-term-live-blink 530ms steps(1,end) infinite',
        }}>
          █
        </span>
      </div>

      {/* Error flash */}
      {error && (
        <div role="alert" style={{
          fontSize: 12, letterSpacing: '0.04em',
          color: 'var(--term-danger)', marginBottom: 8,
        }}>
          ✕ {error}
        </div>
      )}

      {/* Phosphor keyboard — snap+decay on the last typed character */}
      <div style={{ marginTop: 4 }}>
        <PhosphorKeyboard activeChar={lastChar} />
      </div>
    </div>
  )
}
