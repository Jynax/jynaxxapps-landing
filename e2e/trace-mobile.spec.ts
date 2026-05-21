import { test, expect } from '@playwright/test';

// Task #48 — Terminal mobile — TRACE bottom sheet
//
// Verifies the TRACE word game opens as a bottom sheet on mobile (<640px):
// the `?` tail-strip entry point, the §M.9 sheet header, [ESC] + swipe
// dismissal, the hidden OS-keyboard input driving the current tile row, and
// the no-icon rule. Desktop keeps its existing centered modal.

const MOBILE_VIEWPORT = { width: 412, height: 915 };   // Pixel 7
const DESKTOP_VIEWPORT = { width: 1280, height: 900 };

// Deterministic puzzle by fixed date; fresh context = not locked = attract.
async function seedTrace(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (window as unknown as { __TRACE_TEST__: unknown }).__TRACE_TEST__ = {
      dateISO: '2026-06-15',
    };
  });
}

async function openMobileSheet(page: import('@playwright/test').Page) {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await seedTrace(page);
  await page.goto('/#terminal');
  // Real tap on the tail-strip `?`. Since #60 lifted the mode-pill clear of
  // the tail-strip on Terminal mobile, a coordinate-based click is no longer
  // intercepted — so this doubles as the regression guard for the collision.
  await page.locator('[data-tail-strip] [data-trace-open]').click();
  await expect(page.locator('[data-trace-sheet]')).toBeVisible();
}

test.describe('TRACE mobile bottom sheet (Task #48)', () => {

  test('tapping the tail-strip ? opens the TRACE bottom sheet', async ({ page }) => {
    await openMobileSheet(page);
    await expect(page.locator('[data-bottom-sheet]')).toBeVisible();
  });

  test('sheet header shows the TRACE title and an [ESC] close — no × glyph', async ({ page }) => {
    await openMobileSheet(page);
    const sheet = page.locator('[data-bottom-sheet]');
    await expect(sheet).toContainText('TRACE');
    await expect(page.locator('[data-sheet-close]')).toContainText('[ESC]');
    await expect(sheet).not.toContainText('×');
  });

  test('[ESC] close button dismisses the sheet', async ({ page }) => {
    await openMobileSheet(page);
    await page.locator('[data-sheet-close]').click();
    await expect(page.locator('[data-trace-sheet]')).toHaveCount(0);
  });

  test('swipe-down past 30% dismisses the sheet', async ({ page }) => {
    await openMobileSheet(page);
    const handle = page.locator('[data-sheet-handle]');
    const box = await handle.boundingBox();
    expect(box).not.toBeNull();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy + 700, { steps: 12 });
    await page.mouse.up();
    await expect(page.locator('[data-trace-sheet]')).toHaveCount(0);
  });

  test('PRESS TO BEGIN advances to the playing phase with tile rows', async ({ page }) => {
    await openMobileSheet(page);
    await page.locator('[data-trace-begin]').click();
    await expect(page.locator('[data-trace-mobile-playing]')).toBeVisible();
    // start row + current row + target row at minimum
    expect(await page.locator('[data-trace-tile-row]').count()).toBeGreaterThanOrEqual(3);
  });

  test('typing into the hidden input updates the current tile row in real time', async ({ page }) => {
    await openMobileSheet(page);
    await page.locator('[data-trace-begin]').click();
    await expect(page.locator('[data-trace-mobile-playing]')).toBeVisible();

    await page.locator('[data-trace-hidden-input]').fill('crane', { force: true });
    await expect(page.locator('[data-trace-row-variant="current"]')).toContainText('CRANE');
  });

  test('no ✓ / ✕ icon characters anywhere in the sheet (attract + playing)', async ({ page }) => {
    await openMobileSheet(page);
    const sheet = page.locator('[data-trace-sheet]');
    await expect(sheet).not.toContainText('✓');
    await expect(sheet).not.toContainText('✕');

    await page.locator('[data-trace-begin]').click();
    await expect(page.locator('[data-trace-mobile-playing]')).toBeVisible();
    await expect(sheet).not.toContainText('✓');
    await expect(sheet).not.toContainText('✕');
  });
});

test.describe('TRACE desktop — unchanged (Task #48)', () => {

  test('? opens the centered modal on desktop, not a bottom sheet', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await seedTrace(page);
    await page.goto('/#terminal');

    await page.locator('[data-trace-open]').first().click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();
    await expect(page.locator('[data-bottom-sheet]')).toHaveCount(0);
  });
});
