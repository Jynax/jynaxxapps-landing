// Console direction — refined neo-retro operations console.
//
// Re-implemented faithfully in our React 19 + TS stack from the canonical
// reference design comp (handoff/reference-impl/.../directions/console.jsx),
// the project owner's source-of-truth visual artifact. Structure follows
// design-spec-console.md "Page structure" sections 1–8 in order. Data is
// consumed from src/data/jxData.ts only (never a copied array).
//
// Visual system: multi-accent, NO border-radius anywhere, flat surfaces,
// blueprint grid bg (48×48) + faint scanlines, 48px outer padding, 64px
// between sections. HUD tickers via shared useTicker; pulse + tickers freeze
// under reduced motion (handled inside their components/hooks).

import { useState } from 'react'
import { JX_PROJECTS, JX_MANIFESTO, JX_CONTACT, JX_FOOTER } from '../data/jxData'
import { SectionHeader } from './parts/SectionHeader'
import { HudBar } from './console/HudBar'
import { Hero } from './console/Hero'
import { SignalPanel } from './console/SignalPanel'
import { ProjectCard } from './console/ProjectCard'
import { WorkbenchRow } from './console/WorkbenchRow'
import { DirectiveCard } from './console/DirectiveCard'
import { ContactCard } from './console/ContactCard'
import {
  CON,
  CARD_ACCENTS,
  DIRECTIVE_ACCENTS,
  CONTACT_ACCENTS,
  accentAt,
} from './console/accents'

const mono = { fontFamily: 'var(--font-mono)' }

const publicProjects = JX_PROJECTS.filter(p => p.group === 'public')
const workshopProjects = JX_PROJECTS.filter(p => p.group === 'workshop')

export default function Console() {
  // Single shared open-id across manifest + workbench (matches reference:
  // opening one collapses any other).
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id))

  return (
    <section
      data-direction="console"
      style={{
        width: '100%',
        minHeight: '100%',
        background: CON.bg,
        color: CON.ink,
        fontFamily: 'var(--font-sans)',
        fontWeight: 400,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blueprint grid background — 48×48, --con-line ~13%, radial fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `linear-gradient(${CON.line}22 1px, transparent 1px), linear-gradient(90deg, ${CON.line}22 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 90%)',
        }}
      />
      {/* Faint scanlines */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background:
            'repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)',
        }}
      />

      {/* Pulse keyframes (consumed by SignalPanel; disabled there under reduced motion) */}
      <style>{`@keyframes jxConPulse { 0% { transform: scale(.5); opacity: .6 } 100% { transform: scale(1.5); opacity: 0 } }`}</style>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* 1 — HUD top bar (sticky) */}
        <HudBar />

        {/* 2 — Hero / mission briefing */}
        <Hero />

        {/* 3 — Signal · Now Playing */}
        <SignalPanel />

        {/* 4 — Manifest // Active Channel */}
        <div id="con-manifest" style={{ padding: '0 48px 64px' }}>
          <SectionHeader
            id="01"
            title="manifest"
            subtitle="active channel"
            meta={`${publicProjects.length} units live · open any for a dossier`}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 22,
            }}
          >
            {publicProjects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                accent={accentAt(CARD_ACCENTS, i)}
                isOpen={openId === p.id}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </div>
        </div>

        {/* 5 — Workbench // Not Yet Shipped */}
        <div style={{ padding: '0 48px 64px' }}>
          <SectionHeader
            id="02"
            title="workbench"
            subtitle="not yet shipped"
            meta={`${workshopProjects.length} units in research, dev, or private use`}
          />
          <div style={{ border: `1px solid ${CON.line}`, background: `${CON.bgAlt}80` }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 200px 1fr 160px 120px',
                gap: 14,
                padding: '12px 20px',
                borderBottom: `1px solid ${CON.line}`,
                ...mono,
                fontSize: 10,
                color: CON.mid,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              <span>id</span>
              <span>name</span>
              <span>brief</span>
              <span>status</span>
              <span>touched</span>
            </div>
            {workshopProjects.map((p, i) => (
              <WorkbenchRow
                key={p.id}
                project={p}
                isOpen={openId === p.id}
                divider={i < workshopProjects.length - 1}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </div>
        </div>

        {/* 6 — Directives // House Rules */}
        <div id="con-directives" style={{ padding: '0 48px 64px' }}>
          <SectionHeader
            id="03"
            title="directives"
            subtitle="house rules"
            meta="five lines I keep coming back to"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 14,
            }}
          >
            {JX_MANIFESTO.map((m, i) => (
              <DirectiveCard
                key={i}
                text={m}
                index={i}
                accent={accentAt(DIRECTIVE_ACCENTS, i)}
              />
            ))}
          </div>
        </div>

        {/* 7 — Handshake // Outbound Channels */}
        <div style={{ padding: '0 48px 64px' }}>
          <SectionHeader
            id="04"
            title="handshake"
            subtitle="outbound channels"
            meta="how to reach the operator"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
            }}
          >
            {JX_CONTACT.map((c, i) => (
              <ContactCard
                key={c.kind}
                kind={c.kind}
                label={c.label}
                value={c.value}
                href={c.href}
                accent={accentAt(CONTACT_ACCENTS, i)}
              />
            ))}
          </div>
        </div>

        {/* 8 — Footer (display only) */}
        <footer
          style={{
            padding: '32px 48px',
            borderTop: `1px solid ${CON.line}`,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            ...mono,
            fontSize: 10,
            color: CON.dim,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <span>{JX_FOOTER.copyright}</span>
          <span>
            <span style={{ color: CON.cyan }}>◇</span> {JX_FOOTER.built}
          </span>
          <span>v0.4.0 · {JX_FOOTER.made}</span>
        </footer>
      </div>
    </section>
  )
}
