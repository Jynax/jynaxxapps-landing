import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../data/jxData'
import { JX_STATUS } from '../../data/jxData'
import { CON } from './accents'
import { CONSOLE_FOCUS_STYLE, DossierMeta } from './shared'

// Section 5 — Workbench row (table-style, denser).
// Grid: [64px chip][200px name+slug][1fr brief][160px status][120px touched].
// Click expands a full-width dossier below the row, indented to align with the
// name column. Chip = 40×40 outlined square with the Roman-numeral chapter.

const mono = { fontFamily: 'var(--font-mono)' }
const display = { fontFamily: 'var(--font-display)', fontWeight: 700 }

function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return defaultValue
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

interface WorkbenchRowProps {
  project: Project
  isOpen: boolean
  /** Render a bottom divider when not the last row and not open. */
  divider: boolean
  onToggle: () => void
}

export function WorkbenchRow({ project: p, isOpen, divider, onToggle }: WorkbenchRowProps) {
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)
  const pressTimer = useRef<number | undefined>(undefined)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const status = JX_STATUS[p.status]
  const stackStr = p.stack.length > 0 ? p.stack.join(' · ') : '—'
  const rowBg = isDesktop
    ? isOpen ? `${status.color}10` : hover ? `${status.color}0A` : 'transparent'
    : pressed ? `${status.color}1A` : isOpen ? `${status.color}12` : `${CON.bgRaise}66`
  const chapterRoman = p.chapter.replace('.', '')

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
    <div data-workbench-row style={{ marginBottom: isDesktop ? undefined : divider ? 10 : 0 }}>
      <style>{CONSOLE_FOCUS_STYLE}</style>
      <button
        type="button"
        className="jx-con-row"
        onClick={onToggle}
        onPointerDown={flashPressed}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${p.name} dossier`}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          width: '100%',
          display: isDesktop ? 'grid' : 'flex',
          gridTemplateColumns: isDesktop ? '64px 200px 1fr 160px 120px' : undefined,
          flexDirection: isDesktop ? undefined : 'column',
          gap: isDesktop ? 14 : 12,
          minHeight: isDesktop ? undefined : 64,
          padding: isDesktop ? '18px 20px' : '12px 10px',
          alignItems: isDesktop ? 'center' : 'stretch',
          border: isDesktop ? 'none' : `1px solid ${CON.line}`,
          borderBottom: isDesktop
            ? divider && !isOpen ? `1px solid ${CON.line}` : '1px solid transparent'
            : `1px solid ${CON.line}`,
          transition: 'background .15s',
          cursor: 'pointer',
          background: rowBg,
        }}
      >
        {isDesktop ? (
          <>
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
          </>
        ) : (
          <>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  flex: '0 0 40px',
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
              <span
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  minWidth: 0,
                  flex: '1 1 auto',
                }}
              >
                <span
                  style={{
                    ...display,
                    fontSize: 17,
                    color: CON.ink,
                    lineHeight: 1.15,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  {p.name}
                </span>
                <span
                  style={{
                    ...mono,
                    fontSize: 10,
                    color: CON.dim,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 28,
                  }}
                >
                  {p.slug}
                </span>
              </span>
              <span
                style={{
                  ...mono,
                  fontSize: 10,
                  color: status.color,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                }}
              >
                ● {status.label}
              </span>
            </span>
            <span style={{ borderTop: `1px solid ${CON.line}`, height: 0 }} />
            <span
              style={{
                fontSize: 13,
                color: CON.mid,
                lineHeight: 1.45,
                textWrap: 'pretty',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {p.tag}
            </span>
            <span
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                ...mono,
                fontSize: 11,
                color: CON.dim,
              }}
            >
              <span>touched · {p.touched}</span>
              <span style={{ color: isOpen ? status.color : CON.ink }}>{isOpen ? '▴ close' : 'OPEN →'}</span>
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div
          data-workbench-dossier
          style={{
            padding: isDesktop ? '4px 20px 22px 84px' : '4px 10px 18px',
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
                gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr',
                gap: isDesktop ? 14 : 12,
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
