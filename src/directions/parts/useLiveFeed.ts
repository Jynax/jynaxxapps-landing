import { useEffect, useState } from 'react'
import { JX_PROJECTS, JX_NOW } from '../../data/jxData'
import type { Project, LiveEntry } from '../../types/jx'

/**
 * Live-feed contract consumed by every direction widget (Terminal `tail -f`,
 * Console signal readout, Arcade live strip). Task #26 swapped this hook's
 * internals from a static stub to a real `GET /api/live` fetch — the `LiveFeed`
 * shape below is the stable seam, so the widgets (and the #25 Arcade strip)
 * needed no contract change, only real data.
 *
 * Decision 8.3 (S153): single current entry, not a rotating queue → always
 * index 0 of total 1. `watchers` stays honest-minimal (1) until real presence
 * lands (Stages 2–3, deferred Phase 2 — `/api/presence`).
 *
 * Graceful fallback: Pages Functions are not served by `vite dev`, and a fresh
 * deploy may have no entry yet, so any non-OK / non-JSON response keeps the
 * static `JX_NOW` line (the same public-safe copy Console already shipped).
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

const FALLBACK_PROJECT_ID = 'meta-tracker' // JX_NOW references the Meta Tracker rewrite

function resolveProject(id: string | null): Project | null {
  if (!id) return null
  return JX_PROJECTS.find(p => p.id === id) ?? null
}

function fallbackFeed(): LiveFeed {
  return {
    activity: JX_NOW.line,
    project:
      resolveProject(FALLBACK_PROJECT_ID) ??
      JX_PROJECTS.find(p => p.group === 'public') ??
      null,
    since: 'today',
    index: 0,
    total: 1,
    watchers: 1,
  }
}

export function useLiveFeed(): LiveFeed {
  const [feed, setFeed] = useState<LiveFeed>(fallbackFeed)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/live', { signal: controller.signal })
      .then(async res => {
        if (!res.ok) return // 404 (unset) / non-OK → keep fallback
        const entry = (await res.json()) as Partial<LiveEntry>
        if (!entry || typeof entry.activity !== 'string' || !entry.activity) return
        setFeed({
          activity: entry.activity,
          project: resolveProject(typeof entry.project === 'string' ? entry.project : null),
          since: typeof entry.since === 'string' && entry.since ? entry.since : 'today',
          index: 0,
          total: 1,
          watchers: 1,
        })
      })
      .catch(() => {
        // Aborted, network error, or HTML (vite dev fallthrough → res.json
        // throws) — keep the static fallback. No setState needed.
      })

    return () => controller.abort()
  }, [])

  return feed
}
