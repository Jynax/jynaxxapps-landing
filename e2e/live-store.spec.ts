import { test, expect } from '@playwright/test';
import {
  CAP,
  TTL_MS,
  pruneAndCap,
  buildEntry,
  validatePayload,
} from '../functions/api/liveStore';
import type { LiveFeedEntry } from '../src/types/jx';

// Pure-logic suite (no browser). Covers the server rules that route-mocking
// in live-feed.spec.ts cannot exercise (spec §7: cap eviction, TTL drop,
// publicSafe rejection, newest-first ordering).

const NOW = Date.parse('2026-05-17T12:00:00.000Z');

function entry(over: Partial<LiveFeedEntry> = {}): LiveFeedEntry {
  return {
    id: over.id ?? crypto.randomUUID(),
    activity: over.activity ?? 'doing a thing',
    project: over.project ?? null,
    since: over.since ?? 'today',
    updated: over.updated ?? new Date(NOW).toISOString(),
    publicSafe: true,
    source: over.source ?? 'wcc',
  };
}

test.describe('liveStore — constants', () => {
  test('cap is 3 and TTL is 24h', () => {
    expect(CAP).toBe(3);
    expect(TTL_MS).toBe(24 * 60 * 60 * 1000);
  });
});

test.describe('liveStore — pruneAndCap', () => {
  test('drops entries older than 24h on read', () => {
    const fresh = entry({ updated: new Date(NOW - 1000).toISOString() });
    const stale = entry({ updated: new Date(NOW - TTL_MS - 1000).toISOString() });
    const out = pruneAndCap([fresh, stale], NOW);
    expect(out.map(e => e.id)).toEqual([fresh.id]);
  });

  test('keeps an entry exactly at the TTL boundary (not older-than)', () => {
    const edge = entry({ updated: new Date(NOW - TTL_MS).toISOString() });
    expect(pruneAndCap([edge], NOW).map(e => e.id)).toEqual([edge.id]);
  });

  test('caps to newest 3, evicting oldest (FIFO), newest-first', () => {
    const e1 = entry({ id: 'e1', updated: new Date(NOW - 4000).toISOString() });
    const e2 = entry({ id: 'e2', updated: new Date(NOW - 3000).toISOString() });
    const e3 = entry({ id: 'e3', updated: new Date(NOW - 2000).toISOString() });
    const e4 = entry({ id: 'e4', updated: new Date(NOW - 1000).toISOString() });
    // Caller prepends newest; pruneAndCap must normalise to newest-first + cap.
    const out = pruneAndCap([e4, e3, e2, e1], NOW);
    expect(out.map(e => e.id)).toEqual(['e4', 'e3', 'e2']);
  });

  test('normalises out-of-order input to newest-first before capping', () => {
    const e1 = entry({ id: 'e1', updated: new Date(NOW - 4000).toISOString() });
    const e2 = entry({ id: 'e2', updated: new Date(NOW - 3000).toISOString() });
    const e3 = entry({ id: 'e3', updated: new Date(NOW - 2000).toISOString() });
    const e4 = entry({ id: 'e4', updated: new Date(NOW - 1000).toISOString() });
    // Shuffled input — pruneAndCap must sort newest-first, then cap to 3.
    const out = pruneAndCap([e1, e3, e2, e4], NOW);
    expect(out.map(e => e.id)).toEqual(['e4', 'e3', 'e2']);
  });

  test('empty in → empty out', () => {
    expect(pruneAndCap([], NOW)).toEqual([]);
  });
});

test.describe('liveStore — validatePayload', () => {
  test('rejects missing activity', () => {
    const r = validatePayload({ activity: '   ' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/activity/i);
  });

  test('accepts a minimal valid payload (publicSafe defaulted by server, not client)', () => {
    const r = validatePayload({ activity: 'wiring a widget' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.activity).toBe('wiring a widget');
      expect(r.value.project).toBeNull();
      expect(r.value.since).toBe('today');
      expect(r.value.source).toBe('wcc');
    }
  });

  test('rejects a non-true publicSafe sent by client', () => {
    const r = validatePayload({ activity: 'x', publicSafe: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/publicSafe/i);
  });

  test('accepts source lcc; rejects an unknown source', () => {
    expect(validatePayload({ activity: 'x', source: 'lcc' }).ok).toBe(true);
    const bad = validatePayload({ activity: 'x', source: 'pi' });
    expect(bad.ok).toBe(false);
  });
});

test.describe('liveStore — buildEntry', () => {
  test('stamps id + updated, forces publicSafe true', () => {
    const built = buildEntry(
      { activity: 'a', project: null, since: 'today', source: 'wcc', type: 'work' },
      NOW,
    );
    expect(built.id).toMatch(/[0-9a-f-]{36}/);
    expect(built.updated).toBe(new Date(NOW).toISOString());
    expect(built.publicSafe).toBe(true);
  });

  test('passes type through (work and eod)', () => {
    const work = buildEntry({ activity: 'a', project: null, since: 'today', source: 'wcc', type: 'work' }, NOW);
    expect(work.type).toBe('work');
    const eod = buildEntry({ activity: 'done for the night', project: null, since: 'tonight', source: 'wcc', type: 'eod' }, NOW);
    expect(eod.type).toBe('eod');
  });
});

test.describe('liveStore — type field', () => {
  test('validatePayload defaults type to "work" when omitted', () => {
    const r = validatePayload({ activity: 'wiring a widget' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.type).toBe('work');
  });

  test('validatePayload accepts type "eod"', () => {
    const r = validatePayload({ activity: 'done for the night', type: 'eod' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.type).toBe('eod');
  });

  test('validatePayload accepts type "work"', () => {
    const r = validatePayload({ activity: 'shipping something', type: 'work' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.type).toBe('work');
  });

  test('validatePayload rejects unknown type', () => {
    const r = validatePayload({ activity: 'x', type: 'night' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/type/i);
  });
});
