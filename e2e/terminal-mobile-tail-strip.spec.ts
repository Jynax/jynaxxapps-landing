import { test, expect } from '@playwright/test';

// Task #47 / #62 — Terminal mobile — tail-strip
//
// Verifies the PhosphorKeyboard collapses to an in-flow tail-strip on mobile
// (<640px), placed at the bottom of the page so users scroll to discover it.
// Contains the TRACE `?` entry point (consumed by #48). Full desktop keyboard
// renders unchanged at desktop width.

const MOBILE_VIEWPORT = { width: 412, height: 915 };   // Pixel 7
const DESKTOP_VIEWPORT = { width: 1280, height: 900 };

test.describe('Terminal mobile tail-strip (Task #47)', () => {

  test('tail-strip renders on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');
    await expect(page.locator('[data-tail-strip]')).toBeVisible();
  });

  test('tail-strip exposes the TRACE ? button (entry point for #48)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');

    const strip = page.locator('[data-tail-strip]');
    await expect(strip).toBeVisible();
    await expect(strip.locator('[data-trace-open]')).toBeVisible();
  });

  test('TRACE ? button has a >=44x44 tap target on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');

    const traceButton = page.locator('[data-tail-strip] [data-trace-open]');
    await expect(traceButton).toBeVisible();

    const box = await traceButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('full key grid is hidden on mobile (tail-strip replaces it)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');

    await expect(page.locator('[data-tail-strip]')).toBeVisible();
    await expect(page.locator('[data-key]')).toHaveCount(0);
  });
});

test.describe('Terminal keyboard — desktop unchanged (Task #47)', () => {

  test('no tail-strip on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/#terminal');
    await expect(page.locator('[data-tail-strip]')).toHaveCount(0);
  });

  test('full phosphor key grid renders on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/#terminal');

    const keys = page.locator('[data-key]');
    await expect(keys.first()).toBeVisible();
    expect(await keys.count()).toBeGreaterThan(0);
  });
});
