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

    // TraceOverlay renders a visually-hidden aria-live="polite" region as a
    // DOM sibling immediately before [data-bottom-sheet-root] (React fragment
    // renders them into the same parent). Confirm via parentElement adjacency.
    const hasSiblingLiveRegion = await page.locator('[data-bottom-sheet-root]').evaluate(el => {
      const prev = el.previousElementSibling;
      return prev !== null && prev.getAttribute('aria-live') === 'polite';
    });
    expect(hasSiblingLiveRegion).toBe(true);
  });

  test('submitting a valid word populates the live region with accepted announcement', async ({ page }) => {
    await openMobileAndPlay(page);

    // 'share' is a valid 1-letter change from 'stare'
    await page.locator('[data-trace-hidden-input]').fill('share', { force: true });
    await page.locator('[data-trace-submit]').click();

    // The live region inside TraceMobilePlay announces the accepted word.
    const liveRegion = page.locator('[data-trace-mobile-playing] [aria-live="polite"]');
    await expect(liveRegion).toContainText('SHARE');
    await expect(liveRegion).toContainText('accepted');
  });

  test('winning the game announces via TraceOverlay persistent region (not TraceMobilePlay)', async ({ page }) => {
    await openMobileAndPlay(page);

    // Win in 3 moves: share → shore → shone
    for (const word of ['share', 'shore', 'shone']) {
      await page.locator('[data-trace-hidden-input]').fill(word, { force: true });
      await page.locator('[data-trace-submit]').click();
    }

    // After the final submit TraceMobilePlay unmounts (phase → over).
    // The win/loss announcement comes from TraceOverlay's persistent
    // aria-live sibling region, scoped to the TRACE region parent so we
    // don't pick up unrelated live regions on the page.
    // The region's parent is the React fragment root of the mobile render
    // path — locate it as the parent of [data-bottom-sheet-root].
    const traceRegion = page.locator('[data-bottom-sheet-root]').locator('..');
    const persistentAnnouncer = traceRegion.locator('[aria-live="polite"]');
    await expect(persistentAnnouncer).toContainText(/route resolved/i);
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
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return container.querySelectorAll(sel).length;
    });
    expect(focusableCount).toBeGreaterThan(0);

    // Focus the last focusable inside the sheet directly (bypassing Tab to get there)
    await sheet.evaluate(container => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
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
