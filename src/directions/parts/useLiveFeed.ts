import { JX_PROJECTS, JX_NOW } from '../../data/jxData'
import type { Project } from '../../types/jx'

/**
 * Live-feed contract consumed by the Arcade live strip (and any future
 * direction widget). This is the **stub** implementation: a single static
 * "current" entry derived from the already-public `JX_NOW` line.
 *
 * Task #26 owns the real data wiring (`useLiveFeed` → `/api/live` KV, Stage-1
 * session-ritual gate). It will swap *only this hook's internals*; the shape
 * below is the stable seam, so the strip UI built in #25 needs no change.
 *
 * Decision 8.3 (S153): single current entry, not a rotating queue → index 0
 * of total 1. Phrasing stays public-safe (it's the same line Console already
 * ships). `watchers` is honest-minimal until real presence lands (Stages 2–3).
 */
export interface LiveFeed {
  /** Public-safe activity line. */
  activity: string
  /** The project the current entry is about, or null if untagged. */
  project: Project | null
  /** Human "how recent" label, e.g. 'today'. */
  since: string
  /** Zero-based position in the feed (single entry → 0). */
  index: number
  /** Total entries in the feed (single current entry → 1). */
  total: number
  /** Concurrent viewers — minimal placeholder until real presence (Stages 2–3). */
  watchers: number
}

const CURRENT_PROJECT_ID = 'meta-tracker' // JX_NOW references the Meta Tracker rewrite

export function useLiveFeed(): LiveFeed {
  const project =
    JX_PROJECTS.find(p => p.id === CURRENT_PROJECT_ID) ??
    JX_PROJECTS.find(p => p.group === 'public') ??
    null

  return {
    activity: JX_NOW.line,
    project,
    since: 'today',
    index: 0,
    total: 1,
    watchers: 1,
  }
}
