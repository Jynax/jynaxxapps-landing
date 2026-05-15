import { useState } from 'react'
import type { Project } from '../../data/jxData'
import { JX_STATUS } from '../../data/jxData'
import { CON } from './accents'

// Section 5 — Workbench row (table-style, denser).
// Grid: [64px chip][200px name+slug][1fr brief][160px status][120px touched].
// Click expands a full-width dossier below the row, indented to align with the
// name column. Chip = 40×40 outlined square with the Roman-numeral chapter.

const mono = { fontFamily: 'var(--font-mono)' }
const display = { fontFamily: 'var(--font-display)', fontWeight: 700 }

interface WorkbenchRowProps {
  project: Project
  isOpen: boolean
  /** Render a bottom divider when not the last row and not open. */
  divider: boolean
  onToggle: () => void
}

function DossierMeta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div
        style={{
          ...mono,
          fontSize: 9,
          color: CON.dim,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {k}
      </div>
      <div style={{ ...mono, fontSize: 12, color: CON.ink }}>{v}</div>
    </div>
  )
}

export function WorkbenchRow({ project: p, isOpen, divider, onToggle }: WorkbenchRowProps) {
  const [hover, setHover] = useState(false)
  const status = JX_STATUS[p.status]
  const stackStr = p.stack.length > 0 ? p.stack.join(' · ') : '—'
  const rowBg = isOpen ? `${status.color}10` : hover ? `${status.color}0A` : 'transparent'
  const chapterRoman = p.chapter.replace('.', '')

  return (
    <div data-workbench-row>
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${p.name} dossier`}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '64px 200px 1fr 160px 120px',
          gap: 14,
          padding: '18px 20px',
          alignItems: 'center',
          borderBottom: divider && !isOpen ? `1px solid ${CON.line}` : '1px solid transparent',
          transition: 'background .15s',
          cursor: 'pointer',
          background: rowBg,
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            border: `1px solid ${status.color}55`,
            background: `${status.color}10`,
            color: status.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...mono,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {chapterRoman}
        </span>
        <span>
          <span style={{ ...display, fontSize: 19, color: CON.ink, lineHeight: 1.15, display: 'block' }}>
            {p.name}
          </span>
          <span style={{ ...mono, fontSize: 11, color: CON.dim, marginTop: 2, display: 'block' }}>
            {p.slug}
          </span>
        </span>
        <span
          style={{
            fontSize: 13,
            color: CON.mid,
            lineHeight: 1.4,
            textWrap: 'pretty',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {p.tag}
        </span>
        <span
          style={{
            ...mono,
            fontSize: 11,
            color: status.color,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          ● {status.label}
        </span>
        <span
          style={{
            ...mono,
            fontSize: 11,
            color: isOpen ? status.color : CON.dim,
            textAlign: 'right',
          }}
        >
          {isOpen ? '▴ close' : p.touched}
        </span>
      </button>

      {isOpen && (
        <div
          data-workbench-dossier
          style={{
            padding: '4px 20px 22px 84px',
            borderBottom: divider ? `1px solid ${CON.line}` : 'none',
            background: `${status.color}10`,
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              background: `${CON.bg}80`,
              border: `1px solid ${status.color}44`,
            }}
          >
            <div
              style={{
                ...mono,
                fontSize: 10,
                color: status.color,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              ◆ dossier // {p.id}
            </div>
            <p
              style={{
                margin: '0 0 14px',
                fontSize: 14,
                lineHeight: 1.6,
                color: CON.ink,
                textWrap: 'pretty',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {p.blurb}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 14,
                fontSize: 12,
                paddingTop: 12,
                borderTop: `1px dashed ${CON.line}`,
              }}
            >
              <DossierMeta k="started" v={p.started} />
              <DossierMeta k="touched" v={p.touched} />
              <DossierMeta k="address" v={p.slug} />
              <DossierMeta k="stack" v={stackStr} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
