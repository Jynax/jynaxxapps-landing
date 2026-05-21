import { test, expect } from '@playwright/test';

// Console mobile e2e — Task #61.
// Covers behavior introduced by the Console mobile build (#54–#58): the
// relocated HUD counters strip, the manifest full-width card expand, the
// workbench row→card toggle, no horizontal overflow at the mobile
// test-matrix widths, and the 1024px tablet boundary. Desktop regression
// is covered by console.spec.ts and canonical-fidelity.spec.ts.
//
// NOTE: must run against a production build (see playwright.config.ts) —
// the Vite dev server mis-renders mobile layouts (see task #64).

const MOBILE = { width: 390, height: 844 }; // iPhone 14
const DESKTOP = { width: 1280, height: 800 };
const MATRIX = [375, 390, 412, 430];
const TICKERS = ['sessions', 'lines', 'commits'] as const;

test.describe('Console mobile (Task #61)', () => {
  test('mobile: exactly one [data-ticker] node per key (conditional mount, not CSS-hidden)', async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#console');
    for (const key of TICKERS) {
      await expect(page.locator(`[data-ticker="${key}"]`)).toHaveCount(1);
    }
  });

  test('desktop: exactly one [data-ticker] node per key', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/#console');
    for (const key of TICKERS) {
      await expect(page.locator(`[data-ticker="${key}"]`)).toHaveCount(1);
    }
  });

  test('mobile: counters strip sits below the hero, not in the sticky HUD', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#console');
    const box = await page.locator('[data-ticker="sessions"]').boundingBox();
    expect(box).not.toBeNull();
    // the mobile HUD bar is a 44px sticky strip; the counters move well below the hero
    expect(box!.y).toBeGreaterThan(120);
  });

  test('desktop: counters render inside the HUD bar', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/#console');
    const box = await page.locator('[data-ticker="sessions"]').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(60);
  });

  test('mobile: sessions ticker increments over time', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#console');
    const ticker = page.locator('[data-ticker="sessions"]');
    const first = await ticker.textContent();
    await page.waitForTimeout(1400);
    expect(await ticker.textContent()).not.toEqual(first);
  });

  test('mobile: tapping a manifest card expands it to full grid width', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#console');
    const card = page.locator('[data-project-card]').first();
    const closed = await card.boundingBox();
    expect(closed).not.toBeNull();
    await card.click();
    await expect(page.locator('[data-card-dossier]').first()).toBeVisible();
    const open = await card.boundingBox();
    expect(open).not.toBeNull();
    // 2-up grid → the open card spans both columns (grid-column: 1 / -1)
    expect(open!.width).toBeGreaterThan(closed!.width * 1.5);
  });

  test('mobile: the open card dossier is not clipped', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#console');
    await page.locator('[data-project-card]').first().click();
    await expect(page.locator('[data-card-dossier]').first()).toBeVisible();
    // the desktop max-height:400 cap is lifted on mobile so the dossier
    // (full blurb + meta + launch) is never clipped under overflow:hidden
    const clipped = await page
      .locator('[data-card-dossier-anim]')
      .first()
      .evaluate(el => el.scrollHeight > el.clientHeight + 1);
    expect(clipped).toBe(false);
  });

  test('mobile: workbench row toggles its dossier open and closed', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#console');
    const rowButton = page.locator('[data-workbench-row] button').first();
    await expect(page.locator('[data-workbench-dossier]')).toHaveCount(0);
    await rowButton.click();
    await expect(page.locator('[data-workbench-dossier]')).toHaveCount(1);
    await rowButton.click();
    await expect(page.locator('[data-workbench-dossier]')).toHaveCount(0);
  });

  for (const width of MATRIX) {
    test(`mobile: no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#console');
      // Console's root <section> is overflow:hidden, which masks a scrollbar —
      // so check every element's right edge against the viewport instead.
      const overflowed = await page.evaluate(() => {
        const vw = window.innerWidth;
        return Array.from(
          document.querySelectorAll('[data-direction="console"] *'),
        ).some(el => el.getBoundingClientRect().right > vw + 2);
      });
      expect(overflowed).toBe(false);
    });
  }

  test('tablet (768px) renders the mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/#console');
    // mobile-layout marker: the HUD counters strip sits below the hero
    const box = await page.locator('[data-ticker="sessions"]').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(120);
  });
});
