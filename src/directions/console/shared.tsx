import { CON } from './accents'

// Shared Console primitives — single source for the focus ring style and the
// dossier metadata cell, previously duplicated in ProjectCard / WorkbenchRow.

const mono = { fontFamily: 'var(--font-mono)' }

// Module-scope focus ring (spec 187: no outline:none without a replacement).
// Same injection pattern as Console.tsx's <style> block. Combined selector so
// one source string serves both the card toggle and the workbench row.
// Keyboard-only via :focus-visible; does not affect hover/open styles.
export const CONSOLE_FOCUS_STYLE = `.jx-con-toggle:focus-visible, .jx-con-row:focus-visible { outline: 2px solid var(--con-cyan); outline-offset: 2px }`

export function DossierMeta({ k, v }: { k: string; v: string }) {
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
