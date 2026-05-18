import { useEffect, useState } from 'react'
import { JX_PROJECTS, JX_NOW } from '../../data/jxData'
import type { Project, LiveFeedEntry, LiveFeedEnvelope } from '../../types/jx'
import { useReducedMotion } from './useReducedMotion'

/**
 * Live-feed contract consumed by every direction widget (Terminal `tail -f`,
 * Console signal readout, Arcade live strip). The returned `LiveFeed` is the
 * stable seam — it stays a SINGLE current entry so the widgets need no
 * structural change.
 *
 * Task #30 (reverses Decision 8.3 #3, S153 — see decisions.md): `/api/live`
 * now returns a capped rotating set `{ entries: [...] }` (newest-first, cap 3,
 * 24h TTL). This hook fetches that set and rotates which entry is "current"
 * every ROTATE_MS. `index`/`total` reflect position in the set.
 *
 * Reduced motion (spec §3): NO rotation timer is started — the newest entry
 * (index 0) is shown static. Zero new animation anywhere.
 *
 * Graceful fallback: Pages Functions are not served by `vite dev`, and a fresh
 * deploy may have no entry yet, so any non-OK / non-JSON / empty response
 * keeps the static `JX_NOW` line.
 */
export interface LiveFeed {
  /** Public-safe activity line (the current rotating entry). */
  activity: string
  /** The project the current entry is about, or null if untagged. */
  project: Project | null
  /** Human "how recent" label, e.g. 'today'. */
  since: string
  /** Zero-based position of the current entry within the set. */
  index: number
  /** Total entries in the rotating set (1 when fallback / single). */
  total: number
  /** Concurrent viewers — minimal placeholder until real presence (Stages 2–3). */
  watchers: number
}

const ROTATE_MS = 7000 // spec §3: 7s dwell per entry
const FALLBACK_PROJECT_ID = 'meta-tracker' // JX_NOW references the Meta Tracker rewrite

function resolveProject(id: string | null): Project | null {
  if (!id) return null
  return JX_PROJECTS.find(p => p.id === id) ?? null
}

function fallbackEntry(): LiveFeed {
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

function toFeed(entry: LiveFeedEntry, index: number, total: number): LiveFeed {
  return {
    activity: entry.activity,
    project: resolveProject(entry.project),
    since: entry.since || 'today',
    index,
    total,
    watchers: 1,
  }
}

export function useLiveFeed(): LiveFeed {
  const reduced = useReducedMotion()
  const [entries, setEntries] = useState<LiveFeedEntry[]>([])
  const [cursor, setCursor] = useState(0)

  // Fetch the set once on mount.
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/live', { signal: controller.signal })
      .then(async res => {
        if (!res.ok) return // 404 (unset) / non-OK → keep fallback
        const env = (await res.json()) as Partial<LiveFeedEnvelope>
        const list = Array.isArray(env?.entries) ? env.entries : []
        const valid = list.filter(
          e => e && typeof e.activity === 'string' && e.activity && e.type !== 'eod',
        )
        if (valid.length > 0) {
          setEntries(valid)
          setCursor(0)
        }
      })
      .catch(() => {
        // Aborted / network error / HTML (vite dev) — keep static fallback.
      })
    return () => controller.abort()
  }, [])

  // Rotation timer. Not started under reduced motion or with < 2 entries.
  useEffect(() => {
    if (reduced || entries.length < 2) return
    const id = setInterval(
      () => setCursor(c => (c + 1) % entries.length),
      ROTATE_MS,
    )
    return () => clearInterval(id)
  }, [reduced, entries.length])

  if (entries.length === 0) return fallbackEntry()

  // Reduced motion → always the newest (index 0); else the rotating cursor.
  const i = reduced ? 0 : cursor % entries.length
  return toFeed(entries[i], i, entries.length)
}
