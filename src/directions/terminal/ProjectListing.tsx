import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../data/jxData'
import { useMediaQuery } from '../parts/useMediaQuery'
import { JX_STATUS } from '../../data/jxData'

// Reconciled against canonical terminal.jsx: the collapsed-row grid
// (arrow / status / name+tag / touched / cat ./) and the green-outlined
// dossier (// dossier · ./<id>/README.md title, blurb, 3-col started/stack/
// address meta, "open ./<id>/ →" launch line) match canonical's layout and
// instant (no-transition) reveal. Implemented as a semantic <button> per the
// spec's a11y note (canonical uses div-onClick) — a sanctioned a11y upgrade,
// not a visual deviation.

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
  const [pressed, setPressed] = useState(false)
  const pressTimer = useRef<number | undefined>(undefined)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const status = JX_STATUS[project.status]
  const hasHref = project.href !== '#'

  useEffect(() => {
    return () => {
      if (pressTimer.current !== undefined) window.clearTimeout(pressTimer.current)
    }
  }, [])

  const flashPressed = () => {
    if (isDesktop) return
    setPressed(true)
    if (pressTimer.current !== undefined) window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setPressed(false), 120)
  }

  return (
    <div>
      <button
        data-project-row
        type="button"
        onClick={() => setOpen(v => !v)}
        onPointerDown={flashPressed}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-expanded={open}
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '16px 150px 1fr 140px 100px' : '1fr',
          alignItems: isDesktop ? 'baseline' : 'stretch',
          gap: isDesktop ? 16 : 2,
          width: '100%',
          textAlign: 'left',
          height: isDesktop ? undefined : 64,
          background: isDesktop
            ? hover ? 'rgba(244,185,66,0.035)' : 'transparent'
            : pressed ? 'rgba(244,185,66,0.12)' : 'rgba(244,185,66,0.025)',
          border: 'none',
          borderBottom: isDesktop
            ? '1px solid rgba(244,185,66,0.08)'
            : '1px solid rgba(244,185,66,0.06)',
          padding: isDesktop ? '9px 6px' : '6px 10px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: 'var(--term-fg)',
          lineHeight: isDesktop ? 1.5 : 1.2,
        }}
      >
        {isDesktop ? (
          <>
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
          </>
        ) : (
          <>
            <span
              style={{
                justifySelf: 'start',
                color: status.color,
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textShadow: '0 0 6px rgba(244,185,66,0.25)',
                whiteSpace: 'nowrap',
                border: `1px solid ${status.color}`,
                borderRadius: 2,
                padding: '1px 5px',
                lineHeight: 1.1,
              }}
            >
              {status.label}
            </span>
            <span
              style={{
                minWidth: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span style={{ color: 'var(--term-fg-dim)' }}>{open ? '▾' : '▸'} </span>
              <span style={{ color: 'var(--term-fg-bright)', textShadow: 'var(--term-glow)' }}>
                {project.chapter} {project.name}
              </span>
              <span style={{ color: 'var(--term-fg-dim)' }}>{'  '}{project.tag}</span>
            </span>
            <span
              style={{
                color: 'var(--term-fg-dim)',
                fontSize: 12,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {project.touched} · {open ? 'close' : `cat ./${project.id}`}
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          data-dossier
          style={{
            border: '1px solid var(--term-accent)',
            borderRadius: 2,
            margin: isDesktop ? '10px 0 18px' : '0 0 14px',
            padding: isDesktop ? '18px 22px' : '16px',
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
              gridTemplateColumns: isDesktop ? '1fr 2fr 1fr' : '1fr',
              gap: isDesktop ? 20 : 10,
              fontSize: 12,
              color: 'var(--term-fg-dim)',
            }}
          >
            <div
              style={{
                display: isDesktop ? 'block' : 'grid',
                gridTemplateColumns: isDesktop ? undefined : '82px minmax(0, 1fr)',
                gap: isDesktop ? undefined : 12,
              }}
            >
              <div style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: isDesktop ? 5 : 0 }}>
                started
              </div>
              <div style={{ color: 'var(--term-fg)' }}>{project.started}</div>
            </div>
            <div
              style={{
                display: isDesktop ? 'block' : 'grid',
                gridTemplateColumns: isDesktop ? undefined : '82px minmax(0, 1fr)',
                gap: isDesktop ? undefined : 12,
              }}
            >
              <div style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: isDesktop ? 5 : 0 }}>
                stack
              </div>
              <div style={{ color: 'var(--term-fg)' }}>
                {project.stack.length > 0 ? project.stack.join(' · ') : '—'}
              </div>
            </div>
            <div
              style={{
                display: isDesktop ? 'block' : 'grid',
                gridTemplateColumns: isDesktop ? undefined : '82px minmax(0, 1fr)',
                gap: isDesktop ? undefined : 12,
              }}
            >
              <div style={{ letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: isDesktop ? 5 : 0 }}>
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
                display: isDesktop ? 'inline-block' : 'flex',
                alignItems: isDesktop ? undefined : 'center',
                justifyContent: isDesktop ? undefined : 'space-between',
                minHeight: isDesktop ? undefined : 44,
                width: isDesktop ? undefined : '100%',
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
