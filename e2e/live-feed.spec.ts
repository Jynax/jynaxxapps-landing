import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Task #26 — live activity feed. Single current entry (Decision 8.3 #3),
// real GET/POST /api/live, per-direction widgets, reduced-motion freeze.
//
// Pages Functions are NOT served by `vite dev` (same as /api/content, see
// cms-schema.spec.ts), so the hook must gracefully fall back to the static
// JX_NOW line. The real consumer contract is exercised here by mocking the
// /api/live route with the locked single-entry JSON shape.

const PROBE = 'E2E-LIVE-PROBE rewiring the flux capacitor';

// Locked wire shape: { activity, project, since, updated } — no entries[] wrapper.
const LIVE_JSON = JSON.stringify({
  activity: PROBE,
  project: 'remnants',
  since: '3m',
  updated: '2026-05-16T18:42:00Z',
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

test.describe('Live feed — Console oscilloscope', () => {
  test('non-reduced motion: oscilloscope sweep animates and is OUTSIDE [data-project-art]', async ({ page }) => {
    await page.goto('/#console');
    const scope = page.locator('[data-signal-scope]');
    await expect(scope).toBeVisible();
    expect(await scope.locator('animate').count()).toBeGreaterThan(0);
    // Must not pollute the #24 art-animate contract (console.spec.ts asserts
    // exactly one [data-project-art] animate — the SMART route pulse).
    await expect(page.locator('[data-project-art] [data-signal-scope]')).toHaveCount(0);
  });

  test('reduced-motion: oscilloscope sweep frozen (no <animate>)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/#console');
    const scope = page.locator('[data-signal-scope]');
    await expect(scope).toBeVisible();
    await expect(scope.locator('animate')).toHaveCount(0);
    await context.close();
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
