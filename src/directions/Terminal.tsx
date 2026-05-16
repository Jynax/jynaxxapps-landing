// Reconciled against the canonical reference impl (handoff/reference/directions/
// terminal.jsx) and design-spec-terminal.md "Page structure (top to bottom)".
// Boot-log content and the `help` command list below are reproduced faithfully
// from terminal.jsx. The 12-section structure / semantic HTML / reduced-motion /
// data-from-jxData were spec-reviewed and approved and are intentionally kept.

import { JX_PROJECTS, JX_NOW, JX_FOOTER } from '../data/jxData'
import { Prompt } from './parts/Prompt'
import { BootLine } from './parts/BootLine'
import { useBootStream } from './parts/useBootStream'
import { useReducedMotion } from './parts/useReducedMotion'
import { CrtHeader } from './terminal/CrtHeader'
import { AsciiTitle } from './terminal/AsciiTitle'
import { AboutBlock } from './terminal/AboutBlock'
import { ProjectListing } from './terminal/ProjectListing'
import { ManifestoBox } from './terminal/ManifestoBox'
import { ContactBlock } from './terminal/ContactBlock'
import { CursorPrompt } from './terminal/CursorPrompt'

/**
 * Block 3 — boot log. The 7 vintage POST self-test lines below are reproduced
 * faithfully from canonical terminal.jsx `BOOT_LINES` (exact labels, results,
 * and OK/WARN statuses, one WARN: caffeine.service). Canonical bakes the
 * dot-leaders into each string and prints them verbatim (its own `BootLine`
 * applies no padding), so we bake them here too — every line is normalised to
 * a fixed 52-char column so all results right-align (the vintage POST look the
 * spec calls for; canonical's own dot counts vary 47–51, we tighten them to a
 * single column). 52 ≥ the shared `BootLine`'s 48-char pad threshold, so the
 * shared part passes these strings through verbatim — NO double-padding.
 *
 * Canonical renders `ready. type help for commands.` as a separate non-streamed
 * element AFTER its 7 BOOT_LINES; our approved architecture keeps every boot row
 * in one streamed array (each row carries `data-bootline`), so that mandated
 * final line is entry 8 here. useBootStream(BOOT_LINES.length) streams all 8
 * (first at 200ms, +80ms each; all-immediate under reduced-motion).
 */
const BOOT_LINES: { status: 'OK' | 'WARN' | 'FAIL'; text: string }[] = [
  { status: 'OK',   text: 'POST self-test .............................. passed' },
  { status: 'OK',   text: 'load /etc/jynaxx/identity ....................... ok' },
  { status: 'OK',   text: 'mount /workshop ................................. ok' },
  { status: 'WARN', text: 'caffeine.service .............................. high' },
  { status: 'OK',   text: 'sync with claude@anthropic ...................... ok' },
  { status: 'OK',   text: 'attach 11 projects .............................. ok' },
  { status: 'OK',   text: 'restoring last session [remnants] ............... ok' },
  { status: 'OK',   text: 'ready. type help for commands.' },
]

/**
 * Block 4 — the commands `help` lists. Reproduced faithfully from canonical
 * terminal.jsx's `help` block (commands + descriptions, in canonical order):
 * about, now, ls, manifesto, contact. The spec's "5 commands" was approximate;
 * canonical lists 5 (a single `ls` row, plus `contact` — which our prior list
 * dropped). Every command maps to a section that exists below.
 */
const HELP_COMMANDS: { cmd: string; desc: string }[] = [
  { cmd: 'about',     desc: 'who is jynaxx and why does this exist' },
  { cmd: 'now',       desc: "what i'm obsessed with this week" },
  { cmd: 'ls',        desc: 'list projects (click any row to read its dossier)' },
  { cmd: 'manifesto', desc: 'the five rules' },
  { cmd: 'contact',   desc: 'how to reach me' },
]

const publicProjects = JX_PROJECTS.filter(p => p.group === 'public')
const workshopProjects = JX_PROJECTS.filter(p => p.group === 'workshop')

export default function Terminal() {
  // Boot log streaming — re-runs whenever the Terminal component mounts (the
  // shell unmounts/remounts directions on toggle, so a fresh mount restarts it).
  const visible = useBootStream(BOOT_LINES.length)
  const reduced = useReducedMotion()

  // Enhancement beyond the canonical reference (where `help` is a static
  // signpost): clicking a command jumps to its on-page section. Pure in-page
  // scroll — NO url-hash anchors, which would collide with the direction
  // router (#terminal/#console).
  const jumpToSection = (id: string) => {
    document
      .querySelector(`[data-term-section="${id}"]`)
      ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const section: React.CSSProperties = { marginTop: 40 }

  return (
    <section
      data-direction="terminal"
      style={{
        position: 'relative',
        minHeight: '100%',
        background: 'var(--term-bg)',
        color: 'var(--term-fg)',
        fontFamily: 'var(--font-mono)',
        // single column, spec padding
        padding: '40px 56px 80px',
        overflow: 'hidden',
      }}
    >
      {/* ── CRT overlay: scanlines (multiply) + radial vignette. Non-soft per
            spec Don'ts; pointer-events:none so it never blocks interaction. ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.18) 2px 3px)',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* ── Content (above overlays) ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 1 — CRT chrome header */}
        <CrtHeader />

        {/* 2 — ASCII title */}
        <div style={{ marginTop: 32 }}>
          <AsciiTitle />
        </div>

        {/* 3 — boot log (streamed) */}
        <div style={{ ...section, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {BOOT_LINES.slice(0, visible).map((b, i) => (
            <BootLine key={i} status={b.status} text={b.text} />
          ))}
        </div>

        {/* 4 — help */}
        <div style={section}>
          <Prompt command="help" />
          <ul
            style={{
              listStyle: 'none',
              margin: '12px 0 0',
              padding: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              lineHeight: 1.8,
            }}
          >
            {HELP_COMMANDS.map(h => (
              <li
                key={h.cmd}
                style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}
              >
                <button
                  type="button"
                  onClick={() => jumpToSection(h.cmd)}
                  aria-label={`Jump to ${h.cmd} section`}
                  style={{
                    appearance: 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    font: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--term-fg-bright)',
                    textShadow: 'var(--term-glow)',
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                    textUnderlineOffset: 4,
                    justifySelf: 'start',
                  }}
                >
                  {h.cmd}
                </button>
                <span style={{ color: 'var(--term-fg-dim)' }}>{h.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5 — cat ./about.txt (collapsible) */}
        <div style={section} data-term-section="about">
          <AboutBlock />
        </div>

        {/* 6 — cat ./now.txt */}
        <div style={section} data-term-section="now">
          <Prompt command="cat ./now.txt" />
          <p
            style={{
              margin: '12px 0 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--term-fg)',
              textShadow: 'var(--term-glow)',
              maxWidth: '72ch',
            }}
          >
            {JX_NOW.line}
          </p>
        </div>

        {/* 7 — ls -la ~/apps/ (6 public) */}
        <div style={section} data-term-section="ls">
          <ProjectListing command="ls -la ~/apps/" projects={publicProjects} />
        </div>

        {/* 8 — ls -la ~/workshop/ (6 workshop) */}
        <div style={section}>
          <ProjectListing command="ls -la ~/workshop/" projects={workshopProjects} />
        </div>

        {/* 9 — cat manifesto.txt (boxed ASCII) */}
        <div style={section} data-term-section="manifesto">
          <ManifestoBox />
        </div>

        {/* 10 — contact */}
        <div style={section} data-term-section="contact">
          <ContactBlock />
        </div>

        {/* 11 — live blinking cursor prompt */}
        <div style={section}>
          <CursorPrompt />
        </div>

        {/* 12 — footer (display only) */}
        <footer
          style={{
            marginTop: 40,
            paddingTop: 18,
            borderTop: '1px solid rgba(244,185,66,0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--term-fg-dim)',
          }}
        >
          <span>uptime 2y 134d · F1 help · F2 ls · F10 quit</span>
          <span>{JX_FOOTER.built}</span>
          <span>
            {JX_FOOTER.copyright} · {JX_FOOTER.made}
          </span>
        </footer>
      </div>
    </section>
  )
}
