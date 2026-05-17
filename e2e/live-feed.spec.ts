import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Task #26 → Task #30 — live activity feed. Capped rotating set (Decision
// 8.3 #3 single-entry DELIBERATELY REVERSED), real GET/POST /api/live,
// per-direction widgets, reduced-motion freeze.
//
// Pages Functions are NOT served by `vite dev` (same as /api/content), so the
// hook gracefully falls back to the static JX_NOW line. The consumer contract
// is exercised by mocking /api/live with the locked ENVELOPE shape. Server
// cap/TTL/publicSafe rules are unit-tested in live-store.spec.ts.

const PROBE = 'E2E-LIVE-PROBE rewiring the flux capacitor';

// Locked wire shape: { entries: LiveFeedEntry[] } — single-entry envelope
// here so the pre-existing per-direction assertions stay valid.
const LIVE_JSON = JSON.stringify({
  entries: [
    {
      id: 'probe-1',
      activity: PROBE,
      project: 'remnants',
      since: '3m',
      updated: '2026-05-16T18:42:00Z',
      publicSafe: true,
      source: 'wcc',
    },
  ],
});

async function mockLive(page: Page) {
  await page.route('**/api/live', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'public, max-age=15' },
      body: LIVE_JSON,
    }),
  );
}

test.describe('Live feed — GET contract', () => {
  test('GET /api/live falls through to the SPA under vite dev (no 404, no crash)', async ({ request }) => {
    // Mirrors the /api/content contract assertion: vite dev does not run the
    // Pages Function, so the SPA fallback serves index.html (200 HTML, not
    // JSON, not 404). The TRUE JSON contract is covered against a deployed
    // environment; the hook's graceful fallback is asserted below.
    const res = await request.get('/api/live');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type'] ?? '').toContain('text/html');
    expect(await res.text()).toContain('<!doctype html');
  });
});

test.describe('Live feed — hook consumes /api/live in every direction', () => {
  test('Terminal tail -f block reflects the fetched activity + resolved project', async ({ page }) => {
    await mockLive(page);
    await page.goto('/#terminal');
    const live = page.locator('[data-term-live]');
    await expect(live).toBeVisible();
    await expect(live).toContainText('tail -f /var/log/jynaxx/now');
    await expect(live).toContainText(PROBE);
    await expect(live).toContainText(/remnants/i);
  });

  test('Console signal readout reflects the fetched activity', async ({ page }) => {
    await mockLive(page);
    await page.goto('/#console');
    const sig = page.locator('[data-signal-live]');
    await expect(sig).toBeVisible();
    await expect(sig).toContainText(PROBE);
  });

  test('Arcade live strip reflects the fetched activity (no layout change)', async ({ page }) => {
    await mockLive(page);
    await page.goto('/#arcade');
    const strip = page.locator('[data-arcade-livestrip]');
    await expect(strip).toBeVisible();
    await expect(strip).toContainText(PROBE);
    await expect(strip).toContainText(/cart: remnants/i);
  });
});

test.describe('Live feed — graceful fallback (no API under vite dev)', () => {
  test('Terminal still renders the static JX_NOW line when /api/live is unavailable', async ({ page }) => {
    await page.goto('/#terminal');
    const live = page.locator('[data-term-live]');
    await expect(live).toBeVisible();
    // JX_NOW.line opening clause — proves the fallback path renders content.
    await expect(live).toContainText(/obsessed with telling software like a story/i);
  });
});

test.describe('Live feed — Terminal phosphor keyboard (owns the spacebar fix)', () => {
  test('keyboard root is display:inline-block so it shrink-wraps + centers the spacebar', async ({ page }) => {
    await page.goto('/#terminal');
    const kb = page.locator('[data-phosphor-keyboard]');
    await expect(kb).toBeVisible();
    const display = await kb.evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('inline-block');
  });
});

test.describe('Live feed — Console oscilloscope (canonical ConsoleLiveFeed)', () => {
  // The canonical reference oscilloscope is a soft-sine + localized spike-burst
  // wave that FLOWS via a React interval re-deriving the SVG path each tick —
  // there is NO SVG <animate> element (unlike the superseded #26 sweep-beam).
  // Motion is asserted by the wave path `d` changing over time; reduced motion
  // freezes the interval so `d` is stable. The scope must stay OUTSIDE
  // [data-project-art] so the #24 art-animate contract (console.spec.ts) is
  // untouched, and there must be zero <animate> (no SMIL slipped in).
  test('non-reduced motion: wave path flows (d changes over time), no <animate>, OUTSIDE [data-project-art]', async ({ page }) => {
    await page.goto('/#console');
    const scope = page.locator('[data-signal-scope]');
    await expect(scope).toBeVisible();
    const wave = scope.locator('[data-signal-wave]');
    await expect(wave).toBeVisible();
    const d1 = await wave.getAttribute('d');
    await page.waitForTimeout(500);
    const d2 = await wave.getAttribute('d');
    expect(d1).not.toBeNull();
    expect(d2).not.toEqual(d1);
    await expect(scope.locator('animate')).toHaveCount(0);
    await expect(page.locator('[data-project-art] [data-signal-scope]')).toHaveCount(0);
  });

  test('reduced-motion: wave path frozen (d stable over time), no <animate>', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/#console');
    const scope = page.locator('[data-signal-scope]');
    await expect(scope).toBeVisible();
    const wave = scope.locator('[data-signal-wave]');
    await expect(wave).toBeVisible();
    const d1 = await wave.getAttribute('d');
    await page.waitForTimeout(500);
    const d2 = await wave.getAttribute('d');
    expect(d1).not.toBeNull();
    expect(d2).toEqual(d1);
    await expect(scope.locator('animate')).toHaveCount(0);
    await context.close();
  });

  test('canonical panel chrome: LIVE FEED label, STATE 4-LED column, ▸ rx readout, SIGNAL META fields', async ({ page }) => {
    await mockLive(page);
    await page.goto('/#console');
    const root = page.locator('[data-direction="console"]');
    await expect(root.getByText(/SIGNAL · LIVE FEED/)).toBeVisible();
    const state = page.locator('[data-signal-state]');
    await expect(state).toBeVisible();
    for (const led of ['LIVE', 'ACTIVE', 'RX', 'SYNC']) {
      await expect(state.getByText(led, { exact: true })).toBeVisible();
    }
    await expect(page.locator('[data-signal-rx]')).toContainText(/▸\s*rx\s*·/i);
    const meta = page.locator('[data-signal-meta]');
    await expect(meta).toBeVisible();
    for (const k of ['elapsed', 'channel', 'source', 'mode']) {
      await expect(meta.getByText(k, { exact: true })).toBeVisible();
    }
  });
});

test.describe('Live feed — Terminal reduced-motion freeze', () => {
  test('reduced-motion: activity is shown in full immediately (no char-by-char, no cursor motion)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await mockLive(page);
    await page.goto('/#terminal');
    const live = page.locator('[data-term-live]');
    await expect(live).toBeVisible();
    // Full probe text present without waiting on a type-out interval.
    await expect(live).toContainText(PROBE, { timeout: 1000 });
    // No SVG animation introduced by the live widget under reduced motion.
    await expect(live.locator('animate')).toHaveCount(0);
    await context.close();
  });
});

test.describe('Live feed — rotation (Task #30)', () => {
  const THREE = JSON.stringify({
    entries: [
      { id: 'a', activity: 'E2E-ROT-ALPHA newest', project: 'remnants', since: 'now', updated: '2026-05-17T12:00:03Z', publicSafe: true, source: 'wcc' },
      { id: 'b', activity: 'E2E-ROT-BRAVO middle', project: null, since: '5m', updated: '2026-05-17T12:00:02Z', publicSafe: true, source: 'wcc' },
      { id: 'c', activity: 'E2E-ROT-CHARLIE oldest', project: null, since: '9m', updated: '2026-05-17T12:00:01Z', publicSafe: true, source: 'lcc' },
    ],
  });

  test('Console cycles through the set and wraps (newest-first start)', async ({ page }) => {
    await page.route('**/api/live', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: THREE }),
    );
    await page.goto('/#console');
    const live = page.locator('[data-signal-live]');
    await expect(live).toBeVisible();
    await expect(live).toContainText('E2E-ROT-ALPHA'); // newest shown first
    await expect(live).toContainText('E2E-ROT-BRAVO', { timeout: 9000 });
    await expect(live).toContainText('E2E-ROT-CHARLIE', { timeout: 9000 });
    await expect(live).toContainText('E2E-ROT-ALPHA', { timeout: 9000 }); // wrapped
  });

  test('reduced-motion: newest entry only, static, no rotation, no <animate>', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.route('**/api/live', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: THREE }),
    );
    await page.goto('/#console');
    const live = page.locator('[data-signal-live]');
    await expect(live).toContainText('E2E-ROT-ALPHA');
    await page.waitForTimeout(8000);
    await expect(live).toContainText('E2E-ROT-ALPHA'); // never advanced
    await expect(live).not.toContainText('E2E-ROT-BRAVO');
    await expect(page.locator('[data-direction="console"] animate')).toHaveCount(0);
    await context.close();
  });
});
