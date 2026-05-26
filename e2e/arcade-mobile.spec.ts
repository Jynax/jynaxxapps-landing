import { test, expect } from '@playwright/test';

// Arcade mobile e2e — Task #78.
// Covers page-level mobile behaviour introduced by #73–#74: scoreboard
// placement, cart single-column, INSERT COIN sizing, live-strip hide gate,
// no-horizontal-overflow matrix, and the no-<animate> regression guard.
// Coarse-pointer (touch) game tests live in arcade-coin-catch-mobile.spec.ts.
//
// NOTE: must run against a production build (see playwright.config.ts).

const MOBILE = { width: 390, height: 844 }; // iPhone 14 portrait
const DESKTOP = { width: 1280, height: 800 };
const MATRIX = [375, 390, 412, 430];
const TABLET_W = 768;

test.describe('Arcade mobile — page chrome (Task #78)', () => {
  // Scoreboard is standalone (count=1) on mobile; on desktop it lives inside
  // the collapsible strip panel so count=0 until expanded.
  test('mobile: exactly one [data-arcade-scoreboard] mounted standalone', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#arcade');
    await expect(page.locator('[data-arcade-scoreboard]')).toHaveCount(1);
  });

  test('mobile: scoreboard sits standalone above the cart grid', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#arcade');
    const scoreY = (await page.locator('[data-arcade-scoreboard]').boundingBox())!.y;
    const cartY = (await page.locator('[data-arcade-cart]').first().boundingBox())!.y;
    expect(scoreY).toBeLessThan(cartY);
  });

  test('desktop: scoreboard renders inside the live strip expanded panel', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/#arcade');
    // Strip collapsed by default — scoreboard not in DOM yet.
    await expect(page.locator('[data-arcade-scoreboard]')).toHaveCount(0);
    // Direct click — Playwright waits for the button to become actionable.
    await page.locator('[data-arcade-livestrip-toggle]').click();
    await expect(
      page.locator('[data-arcade-livestrip-panel] [data-arcade-scoreboard]'),
    ).toHaveCount(1);
  });

  test('mobile: cart grid is single-column', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#arcade');
    const cards = page.locator('[data-arcade-cart]');
    // Wait for carts to mount (retrying assertion) before reading count.
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);
    for (let i = 0; i < count; i++) {
      const w = (await cards.nth(i).boundingBox())!.width;
      expect(w).toBeGreaterThan(300); // single-col on 390px ≈ 358px wide
    }
  });

  test('mobile: INSERT COIN button is full-width and ≥64px tall', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#arcade');
    const box = (await page.locator('[data-arcade-insert-coin]').boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(MOBILE.width - 64); // 16px gutter each side + tolerance
    expect(box.height).toBeGreaterThanOrEqual(64);
  });

  test('mobile: live strip hides when the coin game overlay opens', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#arcade');
    await expect(page.locator('[data-arcade-livestrip]')).toHaveCount(1);
    await page.locator('[data-arcade-insert-coin]').click();
    // gameOpen gate fires on overlay open (coinOpen=true), not on playing start.
    await expect(page.locator('[data-arcade-coingame]')).toBeVisible();
    await expect(page.locator('[data-arcade-livestrip]')).toHaveCount(0);
  });

  for (const width of MATRIX) {
    test(`mobile: no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#arcade');
      const overflowed = await page.evaluate(() => {
        const vw = window.innerWidth;
        return Array.from(
          document.querySelectorAll('[data-direction="arcade"] *'),
        ).some(el => el.getBoundingClientRect().right > vw + 2);
      });
      expect(overflowed).toBe(false);
    });
  }

  test('tablet (768px): mobile layout — scoreboard above cart grid', async ({ page }) => {
    await page.setViewportSize({ width: TABLET_W, height: 1024 });
    await page.goto('/#arcade');
    const scoreY = (await page.locator('[data-arcade-scoreboard]').boundingBox())!.y;
    const cartY = (await page.locator('[data-arcade-cart]').first().boundingBox())!.y;
    expect(scoreY).toBeLessThan(cartY);
  });

  // Regression guard: no <animate> nodes outside the two known legacy SMIL sources.
  // Run at desktop so the live strip toggle can be clicked to mount the cabinet.
  // Direct click (no isVisible guard) — Playwright waits for actionability.
  test('no stray <animate> nodes outside [data-starfield] and [data-arcade-cabinet]', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/#arcade');
    await page.locator('[data-arcade-livestrip-toggle]').click();
    await expect(page.locator('[data-arcade-cabinet]')).toBeVisible();
    const stray = await page.evaluate(() => {
      const root = document.querySelector('[data-direction="arcade"]')!;
      const all = Array.from(root.querySelectorAll('animate'));
      const starfield = root.querySelector('[data-starfield]');
      const cabinet = root.querySelector('[data-arcade-cabinet]');
      return all.filter(
        n => !(starfield?.contains(n) || cabinet?.contains(n)),
      ).length;
    });
    expect(stray).toBe(0);
  });
});
