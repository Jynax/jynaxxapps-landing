import { useState } from 'react'
import { Prompt } from '../parts/Prompt'

// About prose: composed from brand.md Identity + "Who it's for" + Voice
// (lowercase, first-person, sarcastic). Names "michael chartrand" once,
// Jynaxx-voiced and non-professional, per the S153 product decision closing
// Redesign Open Item #4 — brand.md's Identity names him itself; its only hard
// never-name rule is the partner, who is never named here. Collapse/expand
// mechanics (clamp ~110px → 1200px, .35s ease, dotted-underline toggle) match
// canonical behaviour.

/**
 * Block 5 — `cat ./about.txt` collapsible story block.
 *
 * Per design-spec-terminal.md "Collapsible about block":
 *   - Default: collapsed (max-height 0, no bio visible).
 *   - Click the prompt (dotted underline) OR the `[+ expand]`/`[− collapse]`
 *     tag to toggle. Animates max-height 0 → 1200px over .35s ease.
 *
 * The clickable toggle carries `data-about-toggle`; the full-bio container
 * carries `data-about-full` (Task 5 e2e contract).
 */
export function AboutBlock() {
  const [open, setOpen] = useState(false)

  const toggle = () => setOpen(v => !v)

  return (
    <section aria-label="about">
      {/* The prompt line doubles as a click target (dotted underline = clickable) */}
      <button
        data-about-toggle
        type="button"
        onClick={toggle}
        aria-expanded={open}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            borderBottom: '1px dotted var(--term-fg-dim)',
          }}
        >
          <Prompt command="cat ./about.txt" />
        </span>
        <span
          style={{
            display: 'inline-block',
            marginTop: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.08em',
            color: 'var(--term-fg-bright)',
            textShadow: 'var(--term-glow)',
          }}
        >
          {open ? '[− collapse]' : '[+ expand]'}
        </span>
      </button>

      {/* Bio body. Collapsed: max-height clamp shows ~first 2 sentences.
          Expanded: animates to 1200px over .35s ease. */}
      <div
        data-about-full={open ? '' : undefined}
        style={{
          marginTop: 14,
          overflow: 'hidden',
          maxHeight: open ? 1200 : 0,
          transition: 'max-height .35s ease',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--term-fg)',
          textShadow: 'var(--term-glow)',
        }}
      >
        <p style={{ margin: 0 }}>
          i'm michael chartrand. by day, an ai experience lead — years of
          process, systems, and people behind me. by night i'm jynaxx: the
          curious, mischievous, sarcastic half that builds small things with
          ai for the joy of seeing what's possible, then writes down every
          decision along the way.
        </p>
        <p style={{ margin: '14px 0 0' }}>
          this site is the workshop. it's a personal portfolio and a public
          maker's notebook — not a corporate site, not a pitch. i pick the
          weirder option on purpose, break things to learn how they work, and
          keep notes so future me knows what past me was thinking.
        </p>
        <p style={{ margin: '14px 0 0' }}>
          who it's for: other indie makers and curious tinkerers who'll
          appreciate the craft and the experiments. future me, as an index of
          what got built and learned. and — optionally — anyone who wants to
          see the maker side.
        </p>
      </div>
    </section>
  )
}
