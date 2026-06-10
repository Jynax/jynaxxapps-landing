// TRACE mobile playing screen (Task #48, design-spec-terminal §M.9).
//
// The bottom-sheet play surface: stacked 5-tile rows (start → moves → current
// → target) driven directly by traceLogic. Input comes from a hidden <input>
// wrapped in a <form> so the soft keyboard's Go/Return key submits — the
// desktop TraceGame relies on hardware `keydown` events, which mobile soft
// keyboards do not deliver reliably, so mobile needs this separate surface.
// This component never renders the phosphor keyboard.

import { useState, useRef, useEffect } from 'react'
import { createGame, submitWord } from './traceLogic'
import type { Puzzle, Game, SubmitError } from './traceLogic'
import { WORD_SET } from './words5'

const ERR: Record<SubmitError, string> = {
  length:  '5 letters',
  notword: 'not a word',
  toofar:  'change one letter',
  same:    'already there',
}

const mono = { fontFamily: 'var(--font-mono)' } as const

// One 5-tile word row. variant: 'done' = committed word, 'current' = the row
// being typed (brighter border + amber tint per §M.9), 'target' = the goal.
function TileRow({ word, variant, label }: {
  word:    string
  variant: 'done' | 'current' | 'target'
  label:   string
}) {
  const isCurrent = variant === 'current'
  return (
    <div
      data-trace-tile-row
      data-trace-row-variant={variant}
      aria-label={label}
      style={{
        display: 'flex',
        gap: 6,
        marginBottom: 6,
        padding: '5px 7px',
        background: isCurrent ? 'rgba(244,185,66,0.08)' : 'transparent',
        border: `1px solid ${isCurrent ? 'var(--term-fg)' : 'rgba(244,185,66,0.16)'}`,
        borderRadius: 2,
      }}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const char   = word[i] ?? ''
        const filled = char !== ''
        return (
          <div
            key={i}
            style={{
              ...mono,
              width: 36,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.06em',
              border: '1px solid',
              borderColor: isCurrent ? 'var(--term-fg)' : 'rgba(244,185,66,0.22)',
              color: filled
                ? (variant === 'current' ? 'var(--term-fg-bright)'
                  : variant === 'target' ? 'var(--term-fg)'
                  : 'var(--term-accent)')
                : 'rgba(244,185,66,0.20)',
              textShadow: filled && variant !== 'current' ? 'var(--term-glow)' : 'none',
              background: isCurrent && filled ? 'rgba(244,185,66,0.06)' : 'transparent',
            }}
          >
            {char.toUpperCase()}
          </div>
        )
      })}
    </div>
  )
}

export function TraceMobilePlay({ puzzle, onEnd }: {
  puzzle: Puzzle
  onEnd:  (result: 'win' | 'loss', path: string[]) => void
}) {
  const [game,          setGame]          = useState<Game>(() => createGame(puzzle))
  const [draft,         setDraft]         = useState('')
  const [error,         setError]         = useState<string | null>(null)
  const [moveAnnounce,  setMoveAnnounce]  = useState('')

  const inputRef   = useRef<HTMLInputElement>(null)
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus the hidden input on mount so the OS keyboard pops up. This effect runs
  // after the mount that the [PRESS TO BEGIN] tap triggered — close enough for
  // Android Chrome. iOS Safari may require the focus call to be synchronous
  // inside the tap gesture; revisit if a device test shows the keyboard not
  // appearing. The play area is tap-to-refocus as a safety net (see onClick).
  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => () => { if (errorTimer.current) clearTimeout(errorTimer.current) }, [])

  const flashError = (msg: string) => {
    setError(msg)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setError(null), 1200)
  }

  const handleSubmit = () => {
    if (game.status !== 'playing') return
    const { game: next, error: err } = submitWord(game, draft, WORD_SET)
    if (err) { flashError(ERR[err]); return }
    setGame(next)
    setDraft('')
    setError(null)
    // Mirror desktop TraceGame announcement strings exactly
    if (next.status === 'playing') {
      setMoveAnnounce(`${draft.toUpperCase()} accepted — ${next.movesLeft} moves left`)
    } else {
      setMoveAnnounce(next.status === 'won'
        ? `${draft.toUpperCase()} — route resolved`
        : `${draft.toUpperCase()} — connection dropped`)
      onEnd(next.status === 'won' ? 'win' : 'loss', next.path)
    }
  }

  // Letters only, lowercase internally, max 5. Native backspace shortens value.
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5))
    if (error) setError(null)
  }

  return (
    <div
      data-trace-mobile-playing
      onClick={() => inputRef.current?.focus()}
      style={{ padding: '4px 16px 24px' }}
    >
      {/* Visually-hidden polite live region — mirrors desktop TraceGame pattern */}
      <div aria-live="polite" aria-atomic="true" style={{
        position: 'absolute', width: 1, height: 1, overflow: 'hidden',
        clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
      }}>
        {moveAnnounce}
      </div>

      {/* moves-left HUD */}
      <div style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: 'var(--term-fg-dim)', marginBottom: 12 }}>
        moves left{' '}
        <span style={{ color: game.movesLeft <= 3 ? 'var(--term-danger)' : 'var(--term-fg)' }}>
          {game.movesLeft}
        </span>
      </div>

      {/* Committed ladder: start word + accepted moves */}
      {game.path.map((word, i) => (
        <TileRow
          key={i}
          word={word}
          variant="done"
          label={i === 0 ? `start word ${word}` : `move ${i}, ${word}`}
        />
      ))}

      {/* Current row — the word being typed */}
      <TileRow word={draft} variant="current" label="current word" />

      {/* Target row */}
      <TileRow word={puzzle.target} variant="target" label={`target word ${puzzle.target}`} />

      {/* Error flash — reserved height so the layout does not jump */}
      <div role="alert" style={{
        ...mono, fontSize: 12, letterSpacing: '0.04em', minHeight: 18,
        color: 'var(--term-danger)', marginTop: 4,
      }}>
        {error ?? ''}
      </div>

      {/* Hidden OS-keyboard input wrapped in a form so the soft keyboard's
          Go/Return key submits. Off-screen but focusable (not display:none). */}
      <form onSubmit={e => { e.preventDefault(); handleSubmit() }} style={{ margin: 0 }}>
        <input
          ref={inputRef}
          data-trace-hidden-input
          type="text"
          inputMode="text"
          enterKeyHint="go"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={5}
          value={draft.toUpperCase()}
          onChange={onChange}
          aria-label="Type your next word, five letters"
          style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, opacity: 0 }}
        />
        <button
          type="submit"
          data-trace-submit
          style={{
            ...mono, width: '100%', height: 48, marginTop: 8,
            fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--term-bg)', background: 'var(--term-fg-bright)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 0 12px rgba(244,185,66,0.4)',
          }}
        >
          [ SUBMIT ]
        </button>
      </form>
    </div>
  )
}
