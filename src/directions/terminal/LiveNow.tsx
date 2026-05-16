import { useLiveFeed } from '../parts/useLiveFeed'
import { useTypeOut } from '../parts/useTypeOut'
import { useReducedMotion } from '../parts/useReducedMotion'
import { Prompt } from '../parts/Prompt'
import { PhosphorKeyboard } from './PhosphorKeyboard'

// Block 6 — `tail -f /var/log/jynaxx/now`. Replaces the static now.txt line
// with the live feed: the activity types out char-by-char with a blinking
// cursor while the phosphor keyboard lights the key being struck. The project
// + recency render in an always-present meta line (not typed) so the resolved
// project is reachable immediately.
//
// TailLine is keyed on the activity string so a feed swap (static fallback →
// fetched /api/live activity) remounts it and re-types from zero — that keeps
// useTypeOut's `text` stable per mount, satisfying the no-setState-in-effect /
// no-refs-in-render lint (same constraint useBootStream/CursorPrompt work to).
//
// Reduced-motion: useTypeOut returns the full string at once (no interval) and
// the cursor blink keyframe is dropped — fully frozen, no SVG animation.

const BLINK = `@keyframes jx-term-live-blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }`

function TailLine({ activity, reduced }: { activity: string; reduced: boolean }) {
  const shown = useTypeOut(activity)
  const text = activity.slice(0, shown)
  const activeChar = shown > 0 ? activity[shown - 1] : ''
  const typing = shown < activity.length

  return (
    <>
      <p
        style={{
          margin: '12px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--term-fg)',
          textShadow: 'var(--term-glow)',
          maxWidth: '72ch',
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
        <span
          style={{
            color: 'var(--term-fg-bright)',
            textShadow: 'var(--term-glow-strong)',
            // Solid while typing; blink only when idle at end of line.
            animation:
              reduced || typing ? 'none' : 'jx-term-live-blink 530ms steps(1, end) infinite',
          }}
        >
          █
        </span>
      </p>
      <PhosphorKeyboard activeChar={activeChar} />
    </>
  )
}

export function LiveNow() {
  const feed = useLiveFeed()
  const reduced = useReducedMotion()

  return (
    <div data-term-live>
      <style>{BLINK}</style>
      <Prompt command="tail -f /var/log/jynaxx/now" />
      <div
        style={{
          margin: '8px 0 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          letterSpacing: '0.04em',
          color: 'var(--term-fg-dim)',
        }}
      >
        ── tailing · {feed.project ? feed.project.name : 'workshop'} · {feed.since}
        {' · '}
        <span style={{ color: 'var(--term-fg)' }}>
          {feed.index + 1}/{feed.total}
        </span>
      </div>
      <TailLine key={feed.activity} activity={feed.activity} reduced={reduced} />
    </div>
  )
}
