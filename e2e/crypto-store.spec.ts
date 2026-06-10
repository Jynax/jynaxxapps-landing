// Pure-logic suite (no browser) — tests for shared crypto helpers in
// functions/api/_crypto.ts and the statsStore input caps added in Task #94.
//
// Uses the same Node-context dynamic-import pattern as live-store.spec.ts.

import { test, expect } from '@playwright/test';
import { timingSafeEqual, createHmac } from '../functions/api/_crypto';

// ── timingSafeEqual ──────────────────────────────────────────────────────────

test.describe('timingSafeEqual', () => {
  test('returns true for equal strings', () => {
    expect(timingSafeEqual('hello', 'hello')).toBe(true);
  });

  test('returns false for unequal same-length strings', () => {
    expect(timingSafeEqual('hello', 'world')).toBe(false);
  });

  test('returns false when lengths differ (shorter a)', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });

  test('returns false when lengths differ (shorter b)', () => {
    expect(timingSafeEqual('abcd', 'abc')).toBe(false);
  });

  test('returns true for empty strings', () => {
    expect(timingSafeEqual('', '')).toBe(true);
  });

  test('returns false for empty vs non-empty', () => {
    expect(timingSafeEqual('', 'a')).toBe(false);
    expect(timingSafeEqual('a', '')).toBe(false);
  });
});

// ── createHmac ───────────────────────────────────────────────────────────────

test.describe('createHmac', () => {
  test('produces 64-character lowercase hex', async () => {
    const result = await createHmac('data', 'key');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  test('is deterministic for the same input and key', async () => {
    const a = await createHmac('same-data', 'same-key');
    const b = await createHmac('same-data', 'same-key');
    expect(a).toBe(b);
  });

  test('produces different output for different data', async () => {
    const a = await createHmac('data-a', 'key');
    const b = await createHmac('data-b', 'key');
    expect(a).not.toBe(b);
  });

  test('produces different output for different keys', async () => {
    const a = await createHmac('data', 'key-a');
    const b = await createHmac('data', 'key-b');
    expect(a).not.toBe(b);
  });
});

// ── statsStore input caps (Task #94) ─────────────────────────────────────────

test.describe('statsStore — input caps', () => {
  test('rejects since over 40 chars', async () => {
    const { validatePayload } = await import('../functions/api/statsStore.ts');
    const long = 's'.repeat(41);
    expect(validatePayload({ since: long, projects: 1, prsMerged: 1 })).toBe(false);
  });

  test('accepts since exactly at 40 chars', async () => {
    const { validatePayload } = await import('../functions/api/statsStore.ts');
    const exact = 's'.repeat(40);
    expect(validatePayload({ since: exact, projects: 1, prsMerged: 1 })).toBe(true);
  });

  test('rejects empty since', async () => {
    const { validatePayload } = await import('../functions/api/statsStore.ts');
    expect(validatePayload({ since: '', projects: 1, prsMerged: 1 })).toBe(false);
    expect(validatePayload({ since: '   ', projects: 1, prsMerged: 1 })).toBe(false);
  });
});
