// RECONCILE: confirm exact micro-structure vs directions/terminal.jsx if it becomes available.

interface PromptProps {
  /** The command text displayed after the prompt chrome (e.g. "cat ./about.txt") */
  command: string
  className?: string
}

/**
 * Renders the `jynaxx@workshop:~$` prompt line that precedes every terminal command.
 *
 * Token mapping (per design-spec-terminal.md "Prompt"):
 *   - username `jynaxx`  → --term-accent  (green)
 *   - `@workshop` / `:` / `~` / `$` chrome → --term-fg-dim
 *   - command text → --term-fg  (primary amber)
 *
 * Never uses a proportional font — monospace exclusivity is required by the spec.
 */
export function Prompt({ command, className }: PromptProps) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        whiteSpace: 'pre',
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: 'var(--term-accent)' }}>jynaxx</span>
      <span style={{ color: 'var(--term-fg-dim)' }}>@workshop</span>
      <span style={{ color: 'var(--term-fg-dim)' }}>:</span>
      <span style={{ color: 'var(--term-fg-dim)' }}>~</span>
      <span style={{ color: 'var(--term-fg-dim)' }}>$</span>
      {command && (
        <>
          {' '}
          <span style={{ color: 'var(--term-fg)' }}>{command}</span>
        </>
      )}
    </div>
  )
}
