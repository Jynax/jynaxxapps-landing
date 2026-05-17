// Pure live-feed store rules — NO Cloudflare imports, so this is unit-testable
// from a Node-context Playwright spec (e2e/live-store.spec.ts). functions/api/
// live.ts is the thin HTTP shell that delegates here. Spec §1/§2.
import type { LiveFeedEntry } from '../../src/types/jx';

export const CAP = 3;
export const TTL_MS = 24 * 60 * 60 * 1000;

type Source = LiveFeedEntry['source'];
const SOURCES: readonly Source[] = ['wcc', 'lcc'];

export type ValidPayload = {
  activity: string;
  project: string | null;
  since: string;
  source: Source;
};

export type ValidateResult =
  | { ok: true; value: ValidPayload }
  | { ok: false; error: string };

// Validates the client POST body. publicSafe is NEVER trusted from the client:
// presence of an explicit `false`/non-true is rejected; the server SETS it
// true in buildEntry (defense-in-depth — spec §2 point 3).
export function validatePayload(payload: unknown): ValidateResult {
  const p = (payload ?? {}) as Record<string, unknown>;

  const activity = typeof p.activity === 'string' ? p.activity.trim() : '';
  if (!activity) return { ok: false, error: 'activity is required' };

  if ('publicSafe' in p && p.publicSafe !== true) {
    return { ok: false, error: 'publicSafe must be true or omitted' };
  }

  const source: Source =
    typeof p.source === 'string' && (SOURCES as readonly string[]).includes(p.source)
      ? (p.source as Source)
      : p.source === undefined
        ? 'wcc'
        : ('__invalid__' as Source);
  if (!(SOURCES as readonly string[]).includes(source)) {
    return { ok: false, error: 'source must be "wcc" or "lcc"' };
  }

  return {
    ok: true,
    value: {
      activity,
      project: typeof p.project === 'string' && p.project ? p.project : null,
      since: typeof p.since === 'string' && p.since ? p.since : 'today',
      source,
    },
  };
}

// Builds the server-authoritative entry: server generates id + updated and
// forces publicSafe true (the line is Michael-approved / LCC-tagged-then-
// approved by the time it reaches here; the gate is still re-asserted).
export function buildEntry(p: ValidPayload, nowMs: number): LiveFeedEntry {
  return {
    id: crypto.randomUUID(),
    activity: p.activity,
    project: p.project,
    since: p.since,
    updated: new Date(nowMs).toISOString(),
    publicSafe: true,
    source: p.source,
  };
}

// Read/write normaliser: drop entries older than TTL, sort newest-first by
// `updated`, cap to CAP (FIFO — oldest fall off the end).
export function pruneAndCap(entries: LiveFeedEntry[], nowMs: number): LiveFeedEntry[] {
  return entries
    .filter(e => nowMs - Date.parse(e.updated) <= TTL_MS)
    .sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated))
    .slice(0, CAP);
}
