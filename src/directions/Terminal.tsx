// RECONCILE: confirm exact micro-structure (boot-line wording, help command list,
// footer string) vs directions/terminal.jsx if it becomes available. The reference
// impl referenced by design-spec-terminal.md (`directions/terminal.jsx`) is not in
// this repo; structure below follows the spec's "Page structure (top to bottom)".

import { JX_PROJECTS, JX_NOW, JX_FOOTER } from '../data/jxData'
import { Prompt } from './parts/Prompt'
import { BootLine } from './parts/BootLine'
import { useBootStream } from './parts/useBootStream'
import { CrtHeader } from './terminal/CrtHeader'
import { AsciiTitle } from './terminal/AsciiTitle'
import { AboutBlock } from './terminal/AboutBlock'
import { ProjectListing } from './terminal/ProjectListing'
import { ManifestoBox } from './terminal/ManifestoBox'
import { ContactBlock } from './terminal/ContactBlock'
import { CursorPrompt } from './terminal/CursorPrompt'

/**
 * Block 3 — boot log. Exactly 7 POST-style self-test lines, streamed in via
 * useBootStream(7) (first at 200ms, +80ms each; all-immediate under
 * reduced-motion). One WARN allowed per the spec example. The LAST line reads
 * exactly `ready. type help for commands.` with status OK.
 */
const BOOT_LINES: { status: 'OK' | 'WARN' | 'FAIL'; text: string }[] = [
  { status: 'OK',   text: 'POST self-test' },
  { status: 'OK',   text: 'phosphor display calibrated' },
  { status: 'OK',   text: 'amber lookup table loaded' },
  { status: 'WARN', text: 'coffee reservoir running low' },
  { status: 'OK',   text: 'project register mounted' },
  { status: 'OK',   text: 'curiosity daemon online' },
  { status: 'OK',   text: 'ready. type help for commands.' },
]

/** Block 4 — the 5 available commands `help` lists (map to sections below). */
const HELP_COMMANDS: { cmd: string; desc: string }[] = [
  { cmd: 'about',          desc: 'who is jynaxx, and why this exists' },
  { cmd: 'now',            desc: 'what i am obsessed with this week' },
  { cmd: 'ls ~/apps',      desc: 'things that are live in the wild' },
  { cmd: 'ls ~/workshop',  desc: 'things still on the bench' },
  { cmd: 'manifesto',      desc: 'the five house rules' },
]

const publicProjects = JX_PROJECTS.filter(p => p.group === 'public')
const workshopProjects = JX_PROJECTS.filter(p => p.group === 'workshop')

export default function Terminal() {
  // Boot log streaming — re-runs whenever the Terminal component mounts (the
  // shell unmounts/remounts directions on toggle, so a fresh mount restarts it).
  const visible = useBootStream(BOOT_LINES.length)

  const section: React.CSSProperties = { marginTop: 40 }

  return (
    <section
      data-direction="terminal"
      style={{
        position: 'relative',
        minHeight: '100%',
        flex: 1,
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
                <span style={{ color: 'var(--term-fg-bright)', textShadow: 'var(--term-glow)' }}>
                  {h.cmd}
                </span>
                <span style={{ color: 'var(--term-fg-dim)' }}>{h.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5 — cat ./about.txt (collapsible) */}
        <div style={section}>
          <AboutBlock />
        </div>

        {/* 6 — cat ./now.txt */}
        <div style={section}>
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
        <div style={section}>
          <ProjectListing command="ls -la ~/apps/" projects={publicProjects} />
        </div>

        {/* 8 — ls -la ~/workshop/ (6 workshop) */}
        <div style={section}>
          <ProjectListing command="ls -la ~/workshop/" projects={workshopProjects} />
        </div>

        {/* 9 — cat manifesto.txt (boxed ASCII) */}
        <div style={section}>
          <ManifestoBox />
        </div>

        {/* 10 — contact */}
        <div style={section}>
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
