import { JX_STATUS } from '../../data/jxData'
import type { Project } from '../../types/jx'
import { ARC, statusToNeon } from './tokens'

const px = { fontFamily: 'var(--font-pixel)' }
const mono = { fontFamily: 'var(--font-vt)' }

function DossierMeta({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div>
      <div style={{ ...px, fontSize: 8, color: ARC.dim, letterSpacing: '0.18em', marginBottom: 6 }}>{k}</div>
      <div style={{ ...mono, fontSize: 15, color: color ?? ARC.ink }}>{v}</div>
    </div>
  )
}

// Always-visible cabinet "screen" (reference `CartDossier`, 2026-05-16
// revision): idle placeholder when nothing is loaded, full dossier otherwise.
export function CartDossier({
  project,
  onClose,
}: {
  project: Project | null | undefined
  onClose: () => void
}) {
  if (!project) {
    return (
      <div
        data-arcade-screen
        style={{
          position: 'relative',
          minHeight: 180,
          border: `2px solid ${ARC.neon2}66`,
          background: '#000A',
          boxShadow: `0 0 24px ${ARC.neon2}22, inset 0 0 32px ${ARC.neon2}11`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(61,234,255,0.04) 3px, rgba(61,234,255,0.04) 4px)',
          }}
        />
        <div style={{ ...px, fontSize: 14, color: ARC.neon2, letterSpacing: '0.2em', textShadow: `0 0 10px ${ARC.neon2}AA` }}>
          ◇ INSERT CARTRIDGE ◇
        </div>
        <div style={{ ...mono, fontSize: 18, color: ARC.dim, letterSpacing: '0.06em' }}>
          select a cart below to load its dossier
        </div>
      </div>
    )
  }

  const c = statusToNeon(project.status)
  const statusLabel = (JX_STATUS[project.status] ?? JX_STATUS.sketch).label

  return (
    <div
      data-arcade-screen
      style={{
        position: 'relative',
        border: `2px solid ${c}`,
        background: '#000A',
        boxShadow: `0 0 32px ${c}55, inset 0 0 32px ${c}22`,
        padding: 0,
      }}
    >
      <div
        style={{
          background: `linear-gradient(90deg, ${c}33 0%, transparent 100%)`,
          padding: '10px 18px',
          borderBottom: `2px solid ${c}66`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ ...px, fontSize: 11, color: c, textShadow: `0 0 6px ${c}88`, letterSpacing: '0.16em' }}>
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
            fontSize: 9,
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
      <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 200px', gap: 28, alignItems: 'start' }}>
        <div>
          <div style={{ ...mono, fontSize: 22, color: ARC.ink, lineHeight: 1.4, marginBottom: 16 }}>{project.blurb}</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
              paddingTop: 14,
              borderTop: `1px dashed ${c}55`,
            }}
          >
            <DossierMeta k="STATUS" v={statusLabel.toUpperCase()} color={c} />
            <DossierMeta k="STARTED" v={project.started} />
            <DossierMeta k="TOUCHED" v={project.touched} />
            <DossierMeta k="ADDRESS" v={project.slug} />
          </div>
        </div>
        <div style={{ borderLeft: `1px dashed ${c}55`, paddingLeft: 22 }}>
          <div style={{ ...px, fontSize: 9, color: ARC.dim, letterSpacing: '0.18em', marginBottom: 10 }}>STACK</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
            {project.stack.map(s => (
              <span key={s} style={{ ...mono, fontSize: 15, color: ARC.ink }}>
                ▸ {s}
              </span>
            ))}
          </div>
          {project.href && project.href !== '#' ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                ...px,
                display: 'block',
                fontSize: 11,
                color: '#000',
                background: c,
                padding: '10px 14px',
                textAlign: 'center',
                letterSpacing: '0.12em',
                boxShadow: `0 0 16px ${c}88`,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              ▶ LAUNCH
            </a>
          ) : (
            <div
              style={{
                ...px,
                fontSize: 11,
                color: ARC.dim,
                border: `1px dashed ${ARC.dim}`,
                padding: '10px 14px',
                textAlign: 'center',
                letterSpacing: '0.12em',
              }}
            >
              OFFLINE
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
