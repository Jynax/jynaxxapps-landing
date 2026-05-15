import { useState } from 'react'
import type { Project } from '../../data/jxData'
import { JX_STATUS } from '../../data/jxData'

// RECONCILE: confirm exact dossier micro-layout & column widths vs
// directions/terminal.jsx if it becomes available.

interface ProjectRowProps {
  project: Project
}

/**
 * One interactive listing row (per design-spec-terminal.md "Project listing row").
 *
 * Collapsed grid: [▸/▾ 16px][status 150px][name + tag 1fr][touched 140px][cat ./ 100px]
 * Click toggles a green-outlined dossier directly below the row.
 * Reveal is instant (no max-height transition) — terminal-correct.
 *
 * Semantic: a real <button> (spec requires this, not div-onClick).
 * Carries `data-project-row`; the dossier carries `data-dossier`.
 */
function ProjectRow({ project }: ProjectRowProps) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const status = JX_STATUS[project.status]
  const hasHref = project.href !== '#'

  return (
    <div>
      <button
        data-project-row
        type="button"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-expanded={open}
        style={{
          display: 'grid',
          gridTemplateColumns: '16px 150px 1fr 140px 100px',
          alignItems: 'baseline',
          gap: 16,
          width: '100%',
          textAlign: 'left',
          background: hover ? 'rgba(244,185,66,0.035)' : 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(244,185,66,0.08)',
          padding: '9px 6px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: 'var(--term-fg)',
          lineHeight: 1.5,
        }}
      >
        {/* arrow */}
        <span style={{ color: 'var(--term-fg-dim)' }}>{open ? '▾' : '▸'}</span>

        {/* status */}
        <span
          style={{
            color: status.color,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textShadow: '0 0 6px rgba(244,185,66,0.25)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {status.label}
        </span>

        {/* name + tag */}
        <span style={{ minWidth: 0 }}>
          <span style={{ color: 'var(--term-fg-bright)', textShadow: 'var(--term-glow)' }}>
            {project.chapter} {project.name}
          </span>
          <span style={{ color: 'var(--term-fg-dim)' }}>{'  '}— {project.tag}</span>
        </span>

        {/* touched */}
        <span
          style={{
            color: 'var(--term-fg-dim)',
            fontSize: 12,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {project.touched}
        </span>

        {/* cat ./ display-only affordance */}
        <span
          style={{
            color: 'var(--term-fg-dim)',
            fontSize: 12,
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          {open ? 'close' : `cat ./${project.id}`}
        </span>
      </button>

      {open && (
        <div
          data-dossier
          style={{
            border: '1px solid var(--term-accent)',
            borderRadius: 2,
            margin: '10px 0 18px',
            padding: '18px 22px',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            color: 'var(--term-fg)',
            lineHeight: 1.7,
            background: 'rgba(134,194,107,0.03)',
          }}
        >
          {/* dossier title */}
          <div
            style={{
              color: 'var(--term-accent)',
              fontSize: 12,
              letterSpacing: '0.1em',
              textShadow: '0 0 6px rgba(134,194,107,0.4)',
              marginBottom: 14,
            }}
          >
            // dossier · ./{project.id}/README.md
          </div>

          {/* blurb */}
          <p style={{ margin: '0 0 18px', textShadow: 'var(--term-glow)' }}>
            {project.blurb}
          </p>

          {/* 3-column meta: started / stack / address */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: 20,
              fontSize: 12,
              color: 'var(--term-fg-dim)',
            }}
          >
            <div>
              <div style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                started
              </div>
              <div style={{ color: 'var(--term-fg)' }}>{project.started}</div>
            </div>
            <div>
              <div style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                stack
              </div>
              <div style={{ color: 'var(--term-fg)' }}>
                {project.stack.length > 0 ? project.stack.join(' · ') : '—'}
              </div>
            </div>
            <div>
              <div style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                address
              </div>
              <div style={{ color: 'var(--term-fg)' }}>{project.slug}</div>
            </div>
          </div>

          {/* launch line — only when href is a real URL */}
          {hasHref && (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.name}`}
              style={{
                display: 'inline-block',
                marginTop: 18,
                color: 'var(--term-fg-bright)',
                textShadow: 'var(--term-glow)',
                textDecoration: 'none',
                borderBottom: '1px dotted var(--term-fg-bright)',
              }}
            >
              open ./{project.id}/ →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

interface ProjectListingProps {
  /** The command shown in the Prompt (e.g. "ls -la ~/apps/"). */
  command: string
  projects: Project[]
}

/**
 * Blocks 7 & 8 — a `Prompt` followed by an interactive listing of projects.
 */
export function ProjectListing({ command, projects }: ProjectListingProps) {
  const sectionLabel = command.includes('~/apps')
    ? 'Apps'
    : command.includes('~/workshop')
      ? 'Workshop projects'
      : command
  return (
    <section aria-label={sectionLabel}>
      <h2
        style={{
          margin: '0 0 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.5,
        }}
      >
        <span style={{ color: 'var(--term-accent)' }}>jynaxx</span>
        <span style={{ color: 'var(--term-fg-dim)' }}>@workshop</span>
        <span style={{ color: 'var(--term-fg-dim)' }}>:~$</span>{' '}
        <span style={{ color: 'var(--term-fg)' }}>{command}</span>
      </h2>
      <div>
        {projects.map(p => (
          <ProjectRow key={p.id} project={p} />
        ))}
      </div>
    </section>
  )
}
