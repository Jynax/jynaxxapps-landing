import { test, expect } from '@playwright/test';

// Task #93 — Accessibility round
// Item 3: Mobile TRACE live-region announces accepted words
// Item 2 (mobile): Focus trap in BottomSheet

// Puzzle #1: stare → shone, par 3, budget 8.
// First valid move from 'stare': 'share' (1 letter change s→h at pos 2)
const MOBILE_VIEWPORT = { width: 412, height: 915 };

async function seedTrace(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (window as unknown as { __TRACE_TEST__: unknown }).__TRACE_TEST__ = {
      dateISO: '2026-05-19',
      puzzleId: 1,
    };
  });
}

// Opens the TRACE bottom sheet on mobile and advances to playing phase
async function openMobileAndPlay(page: import('@playwright/test').Page) {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await seedTrace(page);
  await page.goto('/#terminal');
  await page.locator('[data-tail-strip] [data-trace-open]').click();
  await expect(page.locator('[data-trace-sheet]')).toBeVisible();
  await page.locator('[data-trace-begin]').click();
  await expect(page.locator('[data-trace-mobile-playing]')).toBeVisible();
}

// ── Item 3: Mobile TRACE aria-live announcements ──────────────────────────────

test.describe('Mobile TRACE accepted-word announcements (Item 3)', () => {
  test('polite live region exists when TRACE overlay is open on mobile (any phase)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await seedTrace(page);
    await page.goto('/#terminal');
    await page.locator('[data-tail-strip] [data-trace-open]').click();
    await expect(page.locator('[data-trace-sheet]')).toBeVisible();

    // TraceOverlay renders a visually-hidden aria-live="polite" region at mount
    // (sibling of the BottomSheet, for over-phase announcements). Count >= 1.
    const liveRegions = page.locator('[aria-live="polite"]');
    await expect(liveRegions).toHaveCount(1);
  });

  test('submitting a valid word populates the live region with accepted announcement', async ({ page }) => {
    await openMobileAndPlay(page);

    // 'share' is a valid 1-letter change from 'stare'
    await page.locator('[data-trace-hidden-input]').fill('share', { force: true });
    await page.locator('[data-trace-submit]').click();

    // The live region should announce the accepted word
    const liveRegion = page.locator('[data-trace-mobile-playing] [aria-live="polite"]');
    await expect(liveRegion).toContainText('SHARE');
    await expect(liveRegion).toContainText('accepted');
  });

  test('winning the game populates the play-phase live region with resolved announcement', async ({ page }) => {
    await openMobileAndPlay(page);

    // Win in 3 moves: share → shore → shone
    for (const word of ['share', 'shore', 'shone']) {
      await page.locator('[data-trace-hidden-input]').fill(word, { force: true });
      await page.locator('[data-trace-submit]').click();
    }

    // The TraceMobilePlay live region (inside [data-trace-mobile-playing]) should
    // announce the win via the move-announce pattern. After the last submit the
    // component may unmount (phase=over) — check the region before that happens
    // OR check the sheet-level over-phase announcer.
    // Use a flexible locator: any aria-live="polite" on the page with "resolved".
    await expect(page.locator('[aria-live="polite"]').filter({ hasText: /resolved/i })).toHaveCount(1);
  });
});

// ── Item 2 (mobile): Focus trap in BottomSheet ────────────────────────────────

test.describe('Focus trap — BottomSheet (Item 2, mobile)', () => {
  test('Tab from last focusable in BottomSheet wraps to first (stays inside)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await seedTrace(page);
    await page.goto('/#terminal');
    await page.locator('[data-tail-strip] [data-trace-open]').click();
    const sheet = page.locator('[data-bottom-sheet]');
    await expect(sheet).toBeVisible();

    // Focus the last focusable element inside the sheet, then Tab — should wrap to first.
    const focusableCount = await sheet.evaluate(container => {
      const sel = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
      return container.querySelectorAll(sel).length;
    });
    expect(focusableCount).toBeGreaterThan(0);

    // Focus the last focusable inside the sheet directly (bypassing Tab to get there)
    await sheet.evaluate(container => {
      const sel = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
      const els = Array.from(container.querySelectorAll<HTMLElement>(sel));
      els[els.length - 1].focus();
    });

    // Tab from last → should wrap to first (still inside)
    await page.keyboard.press('Tab');
    const activeIsInside = await sheet.evaluate(container =>
      container.contains(document.activeElement)
    );
    expect(activeIsInside).toBe(true);
  });

  test('Shift+Tab from first focusable in BottomSheet wraps to last (stays inside)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await seedTrace(page);
    await page.goto('/#terminal');
    await page.locator('[data-tail-strip] [data-trace-open]').click();
    const sheet = page.locator('[data-bottom-sheet]');
    await expect(sheet).toBeVisible();

    // Focus the close button (first focusable in header) then Shift+Tab → wraps to last
    await page.locator('[data-sheet-close]').focus();
    await page.keyboard.press('Shift+Tab');
    const activeIsInside = await sheet.evaluate(container =>
      container.contains(document.activeElement)
    );
    expect(activeIsInside).toBe(true);
  });
});
