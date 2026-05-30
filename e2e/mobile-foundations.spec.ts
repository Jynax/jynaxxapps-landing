import { test, expect } from '@playwright/test';

// Task #43 — Mobile foundations
//
// Test seam: window.__BOTTOM_SHEET_TEST__ = true renders a test trigger button
// so the BottomSheet primitive can be exercised before it's wired into directions.

const MOBILE_VIEWPORT = { width: 375, height: 667 }; // iPhone SE

/** Set scrollTop and dispatch scroll event atomically in the same evaluate context. */
async function scrollTo(page: import('@playwright/test').Page, scrollTop: number) {
  await page.evaluate((top) => {
    const el = document.querySelector('[data-shell-scroller]') as HTMLElement | null;
    if (!el) return;
    el.scrollTop = top;
    el.dispatchEvent(new Event('scroll', { bubbles: false }));
  }, scrollTop);
}

test.describe('Mode-pill mobile behavior (Task #43)', () => {

  test('pill starts collapsed on mobile and shows active-direction label when expanded', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');
    // Pill starts collapsed — collapsed marker visible, full pill not yet rendered
    await expect(page.locator('[data-pill-collapsed]')).toBeVisible();
    await expect(page.locator('[data-pill]')).toHaveCount(0);
    // Tap to expand
    await page.locator('[data-pill-collapsed]').click();
    await expect(page.locator('[data-pill]')).toBeVisible();
    await expect(page.locator('[data-pill-label]')).toContainText('Tech');
  });

  test('pill starts collapsed on mobile — no scroll required', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
    // Pill is collapsed immediately without any user action
    await expect(page.locator('[data-pill-collapsed]')).toBeVisible();
    await expect(page.locator('[data-pill]')).toHaveCount(0);
  });

  test('collapsed marker expands the pill on tap', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
    // Pill starts collapsed — no scroll needed
    await expect(page.locator('[data-pill-collapsed]')).toBeVisible();
    await page.locator('[data-pill-collapsed]').click();
    await expect(page.locator('[data-pill]')).toBeVisible();
    await expect(page.locator('[data-pill-collapsed]')).toHaveCount(0);
  });

  test('selecting a direction collapses the pill back to the marker', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
    // Expand
    await page.locator('[data-pill-collapsed]').click();
    await expect(page.locator('[data-pill]')).toBeVisible();
    // Pick a direction
    await page.locator('[data-toggle-direction="console"]').click();
    // Pill collapses back to marker
    await expect(page.locator('[data-pill-collapsed]')).toBeVisible();
    await expect(page.locator('[data-pill]')).toHaveCount(0);
  });

  test('pill dot buttons have 44px hit area on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');
    // Expand the pill first (starts collapsed)
    await page.locator('[data-pill-collapsed]').click();
    await expect(page.locator('[data-pill]')).toBeVisible();

    const btn = page.locator('[data-toggle-direction="console"]');
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBe(44);
    expect(box!.height).toBe(44);
  });
});

test.describe('BottomSheet primitive (Task #43)', () => {

  test('sheet opens and displays content', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ = true;
    });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Sheet absent until opened
    await expect(page.locator('[data-bottom-sheet]')).toHaveCount(0);

    await page.locator('[data-test-sheet-open]').click();
    await expect(page.locator('[data-bottom-sheet]')).toBeVisible();
    await expect(page.locator('[data-test-sheet-content]')).toBeVisible();
  });

  test('sheet closes via close button', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ = true;
    });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.locator('[data-test-sheet-open]').click();
    await expect(page.locator('[data-bottom-sheet]')).toBeVisible();

    await page.locator('[data-sheet-close]').click();
    await expect(page.locator('[data-bottom-sheet]')).toHaveCount(0);
  });

  test('sheet closes via backdrop tap', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ = true;
    });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.locator('[data-test-sheet-open]').click();
    await expect(page.locator('[data-bottom-sheet]')).toBeVisible();

    // Backdrop is obscured at center by the sheet panel — call .click() directly on the
    // DOM element to bypass hit-testing; React's delegated handler still fires.
    await page.evaluate(() => {
      (document.querySelector('[data-sheet-backdrop]') as HTMLElement).click();
    });
    await expect(page.locator('[data-bottom-sheet]')).toHaveCount(0);
  });

  test('sheet dismisses via pointer-drag past 30% of sheet height', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ = true;
    });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.locator('[data-test-sheet-open]').click();

    const sheet = page.locator('[data-bottom-sheet]');
    await expect(sheet).toBeVisible();

    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();

    // Drag down past 30% of sheet height (pointer events fire on mouse drag)
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + 40; // near top of sheet (below drag handle)
    const swipeDistance = Math.ceil(box!.height * 0.35); // 35% — past threshold

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + swipeDistance, { steps: 10 });
    await page.mouse.up();

    await expect(sheet).toHaveCount(0);
  });

  test('sheet snap-back: drag less than 30% does NOT dismiss', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ = true;
    });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.locator('[data-test-sheet-open]').click();

    const sheet = page.locator('[data-bottom-sheet]');
    await expect(sheet).toBeVisible();

    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();

    const startX = box!.x + box!.width / 2;
    const startY = box!.y + 40;
    const swipeDistance = Math.floor(box!.height * 0.15); // 15% — below threshold

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + swipeDistance, { steps: 5 });
    await page.mouse.up();

    // Sheet should still be present
    await expect(sheet).toBeVisible();
  });

  test('sheet has drag handle', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ = true;
    });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.locator('[data-test-sheet-open]').click();

    await expect(page.locator('[data-sheet-handle]')).toBeVisible();
  });

  test('sheet closes on Escape key', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ = true;
    });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.locator('[data-test-sheet-open]').click();
    await expect(page.locator('[data-bottom-sheet]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-bottom-sheet]')).toHaveCount(0);
  });

  test('reduced-motion: sheet renders without layout errors', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.addInitScript(() => {
      (window as Window & { __BOTTOM_SHEET_TEST__?: boolean }).__BOTTOM_SHEET_TEST__ = true;
    });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.locator('[data-test-sheet-open]').click();
    await expect(page.locator('[data-bottom-sheet]')).toBeVisible();

    expect(errors).toHaveLength(0);
    await context.close();
  });
});
