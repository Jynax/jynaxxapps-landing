import { useState } from 'react'
import type { Project } from '../../data/jxData'
import { JX_STATUS } from '../../data/jxData'
import { ProjectArt } from '../ProjectArt'
import { CON } from './accents'
import { CONSOLE_FOCUS_STYLE, DossierMeta } from './shared'

// Section 4 — Manifest project card (the most important component).
// Structure top→bottom: 180px screen (ProjectArt) / metadata strip /
// body (name/tag/blurb) / collapsible dossier / footer line.
//
// Semantic: the card is an <article>. A single <button> overlay covers the
// clickable surface (art + metadata + body + footer CTA) and owns the toggle;
// it contains NO interactive children. The dossier (and its Launch <a>) render
// as siblings of that button, inside the <article>, so we never nest an <a>
// inside a <button> (invalid interactive content). The Launch link sits above
// the overlay via z-index so it stays clickable without toggling.

const mono = { fontFamily: 'var(--font-mono)' }
const display = { fontFamily: 'var(--font-display)', fontWeight: 700 }

interface ProjectCardProps {
  project: Project
  /** Resolved hex accent for this card (from CARD_ACCENTS rotation). */
  accent: string
  isOpen: boolean
  onToggle: () => void
}

export function ProjectCard({ project: p, accent: c, isOpen, onToggle }: ProjectCardProps) {
  const [hover, setHover] = useState(false)
  const status = JX_STATUS[p.status]
  const hasHref = p.href !== '#'
  const stackStr = p.stack.length > 0 ? p.stack.join(' · ') : '—'
  const stackTight = p.stack.length > 0 ? p.stack.join('·') : '—'

  const borderColor = isOpen ? c : hover ? `${c}88` : CON.line

  return (
    <article
      data-project-card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: CON.bgAlt,
        border: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color .15s, box-shadow .15s',
        boxShadow: isOpen ? `0 0 0 1px ${c}, 0 8px 32px ${c}22` : 'none',
      }}
    >
      <style>{CONSOLE_FOCUS_STYLE}</style>

      {/* Toggle overlay — covers the full card surface, owns the click/keyboard
          affordance, contains no interactive children. The Launch <a> below
          sits above this via z-index, so it stays clickable and is not nested
          inside the button. */}
      <button
        type="button"
        className="jx-con-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${p.name} — details`}
        style={{
          all: 'unset',
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      />

      {/* Screen — vector illustration */}
      <div
        style={{
          height: 180,
          background: `linear-gradient(135deg, ${CON.bgRaise} 0%, ${CON.bg} 100%)`,
          borderBottom: `1px solid ${CON.line}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ProjectArt id={p.id} accent={c} />
      </div>

      {/* Metadata strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 22px',
          background: `${CON.bgRaise}80`,
          borderBottom: `1px solid ${CON.line}`,
          ...mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: CON.mid }}>
          <span style={{ color: c }}>{p.chapter}</span> &nbsp;/&nbsp; {p.id}.app
        </span>
        <span style={{ color: status.color, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: status.color,
              boxShadow: `0 0 8px ${status.color}AA`,
            }}
          />
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          style={{
            ...display,
            fontSize: 30,
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.05,
            color: CON.ink,
            letterSpacing: '-0.02em',
          }}
        >
          {p.name}
        </h3>
        <div style={{ ...mono, fontSize: 12, color: c, marginTop: 6, letterSpacing: '0.04em' }}>
          {p.tag}
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: CON.mid,
            margin: '14px 0 16px',
            textWrap: 'pretty',
            flex: 1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {p.blurb}
        </p>

        {/* Dossier — collapsed by default, instant reveal. Sibling of the
            toggle button (not nested), with the Launch <a> raised above the
            overlay so it is clickable and never inside the <button>. */}
        {isOpen && (
          <div data-card-dossier style={{ position: 'relative', zIndex: 2, marginBottom: 14 }}>
            <div
              style={{
                padding: '16px 18px',
                background: `${CON.bg}80`,
                border: `1px solid ${c}33`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  ...mono,
                  fontSize: 10,
                  color: c,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                ◆ dossier // {p.id}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 14,
                  fontSize: 12,
                }}
              >
                <DossierMeta k="started" v={p.started} />
                <DossierMeta k="touched" v={p.touched} />
                <DossierMeta k="address" v={p.slug} />
                <DossierMeta k="stack" v={stackStr} />
              </div>
              {hasHref && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${p.name}`}
                  style={{
                    display: 'block',
                    marginTop: 14,
                    ...mono,
                    fontSize: 11,
                    color: CON.bg,
                    background: c,
                    padding: '8px 20px',
                    textAlign: 'center',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    clipPath:
                      'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)',
                  }}
                >
                  ▶ launch {p.slug}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: 14,
            borderTop: `1px dashed ${CON.line}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 14,
              ...mono,
              fontSize: 11,
              color: CON.dim,
              letterSpacing: '0.04em',
            }}
          >
            <span>
              <span style={{ color: CON.mid }}>STK</span> {stackTight}
            </span>
            <span>
              <span style={{ color: CON.mid }}>EST</span> {p.started}
            </span>
          </div>
          <span
            style={{
              ...mono,
              fontSize: 11,
              color: c,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              borderBottom: `1px solid ${c}`,
              paddingBottom: 1,
            }}
          >
            {isOpen ? '▴ close' : 'open →'}
          </span>
        </div>
      </div>
    </article>
  )
}
