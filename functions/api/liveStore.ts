// Pure live-feed store rules — NO Cloudflare imports, so this is unit-testable
// from a Node-context Playwright spec (e2e/live-store.spec.ts). functions/api/
// live.ts is the thin HTTP shell that delegates here. Spec §1/§2.
import type { LiveFeedEntry } from '../../src/types/jx';

export const CAP = 3;
export const TTL_MS = 24 * 60 * 60 * 1000;

// Input caps — keep field lengths reasonable for storage and display.
const MAX_ACTIVITY_CHARS = 200; // display cap; practical entries are ≤ 40 chars
const MAX_SINCE_CHARS = 40;     // short relative label ("today", "this week", etc.)
const MAX_PROJECT_CHARS = 100;  // project name / slug

type Source = LiveFeedEntry['source'];
const SOURCES: readonly Source[] = ['wcc', 'lcc'];

type EntryType = NonNullable<LiveFeedEntry['type']>;
const ENTRY_TYPES: readonly EntryType[] = ['work', 'eod'];

export type ValidPayload = {
  activity: string;
  project: string | null;
  since: string;
  source: Source;
  type: EntryType;
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
  if (activity.length > MAX_ACTIVITY_CHARS) {
    return { ok: false, error: `activity must be ${MAX_ACTIVITY_CHARS} characters or fewer` };
  }

  if ('publicSafe' in p && p.publicSafe !== true) {
    return { ok: false, error: 'publicSafe must be true or omitted' };
  }

  let source: Source;
  if (p.source === undefined) {
    source = 'wcc';
  } else if (typeof p.source === 'string' && (SOURCES as readonly string[]).includes(p.source)) {
    source = p.source as Source;
  } else {
    return { ok: false, error: 'source must be "wcc" or "lcc"' };
  }

  let type: EntryType;
  if (p.type === undefined) {
    type = 'work';
  } else if (typeof p.type === 'string' && (ENTRY_TYPES as readonly string[]).includes(p.type)) {
    type = p.type as EntryType;
  } else {
    return { ok: false, error: 'type must be "work" or "eod"' };
  }

  // since: cap length if provided
  const since = typeof p.since === 'string' && p.since ? p.since : 'today';
  if (since.length > MAX_SINCE_CHARS) {
    return { ok: false, error: `since must be ${MAX_SINCE_CHARS} characters or fewer` };
  }

  // project: cap length if provided
  const project = typeof p.project === 'string' && p.project ? p.project : null;
  if (project !== null && project.length > MAX_PROJECT_CHARS) {
    return { ok: false, error: `project must be ${MAX_PROJECT_CHARS} characters or fewer` };
  }

  return {
    ok: true,
    value: {
      activity,
      project,
      since,
      source,
      type,
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
    type: p.type,
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
