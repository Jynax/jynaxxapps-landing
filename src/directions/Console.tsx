// Console direction — refined neo-retro operations console.
//
// Re-implemented faithfully in our React 19 + TS stack from the canonical
// reference design comp (handoff/reference-impl/.../directions/console.jsx),
// the project owner's source-of-truth visual artifact. Structure follows
// design-spec-console.md "Page structure" sections 1–8 in order. Data is
// consumed from src/data/jxData.ts only (never a copied array).
//
// Visual system: multi-accent, NO border-radius anywhere, flat surfaces,
// blueprint grid bg (48×48 desktop / 32×32 mobile) + faint scanlines,
// 48px outer padding on desktop / 16px on mobile, 64px between sections
// on desktop / 40px on mobile. HUD tickers via shared useTicker; pulse +
// tickers freeze under reduced motion (handled inside their components/hooks).
//
// Mobile (< 1024px): blueprint grid 32×32, section padding 0 16px 40px,
// page bottom clearance 96px (clears the floating mode pill). Manifest stays
// 2-up. Workbench header row hidden, outer box border/bg dropped (row-cards
// from #57 read individually, not double-framed). Directives 1-col stack.
// Handshake 2-col grid. HudCounters strip mounts below <Hero /> (never in
// the DOM at the same time as the desktop HUD counters — strict e2e contract).

import { useState } from 'react'
import { JX_PROJECTS, JX_MANIFESTO, JX_CONTACT, JX_FOOTER } from '../data/jxData'
import { JynaxxWordmark } from '../components/brand/ConsoleWordmark'
import { useMediaQuery } from './parts/useMediaQuery'
import { useFontFamilies } from './parts/useFontFamilies'
import { SectionHeader } from './parts/SectionHeader'
import { HudBar, HudCounters } from './console/HudBar'
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
  // Space Grotesk is Console-only — inject lazily on first mount.
  useFontFamilies('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  // Single shared open-id across manifest + workbench (matches reference:
  // opening one collapses any other).
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id))

  // Section padding: desktop 0 48px 64px, mobile 0 16px 40px
  const sectionPad = isDesktop ? '0 48px 64px' : '0 16px 40px'

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
      {/* Blueprint grid background — 48×48 desktop / 32×32 mobile, --con-line ~13%, radial fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `linear-gradient(${CON.line}22 1px, transparent 1px), linear-gradient(90deg, ${CON.line}22 1px, transparent 1px)`,
          backgroundSize: isDesktop ? '48px 48px' : '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 90%)',
        }}
      />
      {/* Faint scanlines — unchanged across breakpoints */}
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

      {/* Mobile: 96px bottom clearance so the last section clears the floating mode pill */}
      <div style={{ position: 'relative', zIndex: 2, paddingBottom: isDesktop ? 0 : 96 }}>
        {/* 1 — HUD top bar (sticky) */}
        <HudBar />

        {/* 2 — Hero / mission briefing */}
        <Hero />

        {/* Mobile-only: HUD counters strip below hero.
            Desktop: counters render inside HudBar. Never both in the DOM — strict e2e rule. */}
        {!isDesktop && <HudCounters strip />}

        {/* 3 — Signal · Now Playing */}
        <SignalPanel />

        {/* 4 — Manifest // Active Channel */}
        <div id="con-manifest" style={{ padding: sectionPad }}>
          <SectionHeader
            id="01"
            title="manifest"
            subtitle="active channel"
            meta={`${publicProjects.length} units live · open any for a dossier`}
          />
          <div
            style={{
              display: 'grid',
              // Stays 2-up on mobile — compact cards (#56); gap tightens
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: isDesktop ? 22 : 12,
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
        <div style={{ padding: sectionPad }}>
          <SectionHeader
            id="02"
            title="workbench"
            subtitle="not yet shipped"
            meta={`${workshopProjects.length} units in research, dev, or private use`}
          />
          {/* Desktop: bordered table-box containing header row + rows.
              Mobile: no outer border/bg (row-cards from #57 read individually, M.7 contract).
              Both halves of the #54/#57 contract must land for correct mobile styling. */}
          <div
            style={{
              border: isDesktop ? `1px solid ${CON.line}` : 'none',
              background: isDesktop ? `${CON.bgAlt}80` : 'transparent',
            }}
          >
            {/* Column-label header row — desktop only (meaningless for stacked cards) */}
            {isDesktop && (
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
            )}
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
        <div id="con-directives" style={{ padding: sectionPad }}>
          <SectionHeader
            id="03"
            title="directives"
            subtitle="house rules"
            meta="five lines I keep coming back to"
          />
          <div
            style={{
              display: 'grid',
              // Desktop: 5-column row; mobile: single-column stack
              gridTemplateColumns: isDesktop ? 'repeat(5, 1fr)' : '1fr',
              gap: 14,
            }}
          >
            {/* static frozen order — index key is safe */}
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
        <div style={{ padding: sectionPad }}>
          <SectionHeader
            id="04"
            title="handshake"
            subtitle="outbound channels"
            meta="how to reach the operator"
          />
          <div
            style={{
              display: 'grid',
              // Desktop: 4-column row; mobile: 2-column grid
              gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
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

        {/* 8 — Footer — standard brand footer */}
        <footer
          style={{
            padding: isDesktop ? '40px 48px 32px' : '40px 16px 32px',
            borderTop: `1px solid ${CON.line}`,
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <JynaxxWordmark size={18} glow={false} />
          </div>
          <div style={{ ...mono, fontSize: 13, color: CON.dim, lineHeight: 2.2, marginBottom: 16 }}>
            <div>jynaxx@gmail.com</div>
            <div>github.com/Jynax</div>
            <div>@mrchartrand.bsky.social</div>
          </div>
          <div style={{ ...mono, fontSize: 12, color: CON.dim, lineHeight: 2 }}>
            <div>{JX_FOOTER.copyright}</div>
            <div>{JX_FOOTER.built}</div>
            <div>{JX_FOOTER.made}</div>
          </div>
          <div style={{ ...mono, fontSize: 11, color: CON.cyan, marginTop: 16, letterSpacing: '0.15em' }}>
            {'◇ mission ongoing · no exit conditions'}
          </div>
        </footer>
      </div>
    </section>
  )
}
