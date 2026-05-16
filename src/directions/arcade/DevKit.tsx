import { JX_STATUS } from '../../data/jxData'
import type { Project } from '../../types/jx'
import { ARC, statusToNeon } from './tokens'

const px = { fontFamily: 'var(--font-pixel)' }
const mono = { fontFamily: 'var(--font-vt)' }

// Workshop ("B-Sides") compact row (reference `DevKitRow`, 2026-05-16
// revision). Rendered as a <button> for keyboard access.
export function DevKitRow({
  project: p,
  selected,
  onSelect,
}: {
  project: Project
  selected: boolean
  onSelect: () => void
}) {
  const statusColor = statusToNeon(p.status)
  const statusLabel = (JX_STATUS[p.status] ?? JX_STATUS.sketch).label
  return (
    <button
      type="button"
      data-arcade-devkit-row
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 110px',
        gap: 14,
        alignItems: 'center',
        padding: '12px 14px',
        width: '100%',
        textAlign: 'left',
        font: 'inherit',
        border: `1px solid ${selected ? statusColor : `${ARC.neon2}55`}`,
        background: selected ? `${statusColor}15` : '#0006',
        boxShadow: selected ? `0 0 18px ${statusColor}55, inset 0 0 16px ${statusColor}22` : 'none',
        cursor: 'pointer',
        transition: 'all .15s',
      }}
      onMouseEnter={e => {
        if (!selected) e.currentTarget.style.background = '#0009'
      }}
      onMouseLeave={e => {
        if (!selected) e.currentTarget.style.background = '#0006'
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: `2px solid ${statusColor}`,
          background: `${statusColor}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...px,
          fontSize: 11,
          color: statusColor,
          textShadow: `0 0 6px ${statusColor}88`,
        }}
      >
        {p.chapter.replace('.', '')}
      </div>
      <div>
        <div style={{ ...mono, fontSize: 20, color: ARC.ink, lineHeight: 1.1 }}>{p.name}</div>
        <div style={{ ...mono, fontSize: 14, color: ARC.dim, lineHeight: 1.2, marginTop: 2 }}>{p.tag}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ ...px, fontSize: 8, color: statusColor, letterSpacing: '0.08em' }}>● {statusLabel.toUpperCase()}</div>
        <div style={{ ...mono, fontSize: 13, color: ARC.dim, marginTop: 4 }}>{selected ? 'LOADED ▸' : p.touched}</div>
      </div>
    </button>
  )
}

// Inline expansion shown under the grid when a workshop item is selected
// (reference `DevKitInline`, 2026-05-16 revision).
export function DevKitInline({ project, onClose }: { project: Project; onClose: () => void }) {
  const c = statusToNeon(project.status)
  const statusLabel = (JX_STATUS[project.status] ?? JX_STATUS.sketch).label
  return (
    <div
      data-arcade-devkit-inline
      style={{
        marginTop: 14,
        border: `1px solid ${c}`,
        background: `${c}10`,
        boxShadow: `inset 0 0 24px ${c}22, 0 0 18px ${c}44`,
        padding: '14px 18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ ...px, fontSize: 10, color: c, textShadow: `0 0 6px ${c}88`, letterSpacing: '0.14em' }}>
          ▸ NOW LOADING / {project.name.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onClose()
          }}
          style={{
            ...px,
            fontSize: 8,
            color: ARC.dim,
            cursor: 'pointer',
            letterSpacing: '0.1em',
            background: 'transparent',
            border: 'none',
            padding: 0,
          }}
        >
          × EJECT
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 22, alignItems: 'start' }}>
        <div style={{ ...mono, fontSize: 18, color: ARC.ink, lineHeight: 1.4 }}>{project.blurb}</div>
        <div style={{ borderLeft: `1px dashed ${c}55`, paddingLeft: 18 }}>
          <div style={{ ...px, fontSize: 8, color: ARC.dim, letterSpacing: '0.18em', marginBottom: 8 }}>STACK</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
            {project.stack.map(s => (
              <span key={s} style={{ ...mono, fontSize: 14, color: ARC.ink }}>
                ▸ {s}
              </span>
            ))}
          </div>
          <div style={{ ...px, fontSize: 8, color: ARC.dim, letterSpacing: '0.14em', marginTop: 10 }}>
            <span style={{ color: c }}>● {statusLabel.toUpperCase()}</span> · {project.touched.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}
