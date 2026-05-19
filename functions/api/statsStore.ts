// Pure stats-store rules — NO Cloudflare imports, so this is unit-testable
// from a Node-context Playwright spec (e2e/arcade-stats.spec.ts). functions/
// api/stats.ts is the thin HTTP shell that delegates here. Mirrors liveStore.ts.
import type { StatsEnvelope } from '../../src/types/jx'

type ValidStatsPayload = {
  since: string
  projects: number
  prsMerged: number
}

// Validates the client POST body.
// Accepts only { since: non-empty string, projects: int ≥ 0, prsMerged: int ≥ 0 }.
export function validatePayload(payload: unknown): payload is ValidStatsPayload {
  if (!payload || typeof payload !== 'object') return false
  const p = payload as Record<string, unknown>
  if (typeof p.since !== 'string' || !p.since.trim()) return false
  if (
    typeof p.projects !== 'number' ||
    !Number.isInteger(p.projects) ||
    p.projects < 0
  )
    return false
  if (
    typeof p.prsMerged !== 'number' ||
    !Number.isInteger(p.prsMerged) ||
    p.prsMerged < 0
  )
    return false
  return true
}

// Builds the server-authoritative envelope: server generates generatedAt.
export function buildEnvelope(p: ValidStatsPayload): StatsEnvelope {
  return {
    generatedAt: new Date().toISOString(),
    since: p.since,
    projects: p.projects,
    prsMerged: p.prsMerged,
  }
}
