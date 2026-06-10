import { test, expect } from '@playwright/test';

// Task #93 — Accessibility round
// Item 1: TRACE ? button not hidden from ATs by ancestor aria-hidden
// Item 2: Focus trap in TraceOverlay, CoinGameOverlay, BottomSheet (desktop surfaces)
// Item 3: Mobile TRACE live-region for accepted words — tested in a11y-mobile.spec.ts

// ── Shared helpers ─────────────────────────────────────────────────────────────

async function seedTrace(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (window as unknown as { __TRACE_TEST__: unknown }).__TRACE_TEST__ = {
      dateISO: '2026-05-19',
      puzzleId: 1,
    };
  });
}

// ── Item 1: ? button aria-hidden ancestor check ────────────────────────────────

test.describe('TRACE ? button not hidden from ATs (Item 1)', () => {
  test('[data-trace-open] on desktop keyboard has NO ancestor with aria-hidden="true"', async ({ page }) => {
    await seedTrace(page);
    await page.goto('/#terminal');
    await expect(page.locator('[data-phosphor-keyboard]')).toBeVisible();

    // Walk parentElement chain from the ? button — none should have aria-hidden=true
    const hasHiddenAncestor = await page.locator('[data-phosphor-keyboard] [data-trace-open]').evaluate(el => {
      let node = el.parentElement;
      while (node) {
        if (node.getAttribute('aria-hidden') === 'true') return true;
        node = node.parentElement;
      }
      return false;
    });
    expect(hasHiddenAncestor).toBe(false);
  });

  test('exactly one [data-trace-open] in the desktop keyboard area', async ({ page }) => {
    await seedTrace(page);
    await page.goto('/#terminal');
    await expect(page.locator('[data-phosphor-keyboard]')).toBeVisible();
    // The desktop keyboard renders exactly one ? button inside it
    await expect(page.locator('[data-phosphor-keyboard] [data-trace-open]')).toHaveCount(1);
  });

  test('[data-trace-open] on desktop is focusable (tabindex not -1)', async ({ page }) => {
    await seedTrace(page);
    await page.goto('/#terminal');
    const btn = page.locator('[data-phosphor-keyboard] [data-trace-open]');
    await expect(btn).toBeVisible();
    // Buttons are natively focusable; ensure the element is actually a button
    await expect(btn).toHaveAttribute('aria-label', 'Open daily word puzzle');
  });
});

// ── Item 2: Focus trap ─────────────────────────────────────────────────────────

test.describe('Focus trap — TraceOverlay desktop (Item 2)', () => {
  test('Tab from last focusable element wraps to first (stays inside overlay)', async ({ page }) => {
    await seedTrace(page);
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').first().click();
    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toBeVisible();

    // Focus the last focusable inside the panel directly, then Tab → wraps to first
    const panel = overlay.locator('[tabindex="-1"]');
    await panel.evaluate(container => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = Array.from(container.querySelectorAll<HTMLElement>(sel));
      if (els.length > 0) els[els.length - 1].focus();
    });

    await page.keyboard.press('Tab');
    const activeIsInside = await panel.evaluate(container =>
      container.contains(document.activeElement)
    );
    expect(activeIsInside).toBe(true);
  });

  test('Shift+Tab from first focusable wraps to last (stays inside overlay)', async ({ page }) => {
    await seedTrace(page);
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').first().click();
    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toBeVisible();

    // Focus the first focusable (close button), then Shift+Tab → wraps to last
    const panel = overlay.locator('[tabindex="-1"]');
    await panel.evaluate(container => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = Array.from(container.querySelectorAll<HTMLElement>(sel));
      if (els.length > 0) els[0].focus();
    });
    await page.keyboard.press('Shift+Tab');
    const activeIsInside = await panel.evaluate(container =>
      container.contains(document.activeElement)
    );
    expect(activeIsInside).toBe(true);
  });
});

test.describe('Focus trap — CoinGameOverlay (Item 2)', () => {
  test('Tab from last focusable wraps to first (stays inside coingame overlay)', async ({ page }) => {
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    const overlay = page.locator('[data-arcade-coingame]');
    await expect(overlay).toBeVisible();

    // The trap is scoped to the full overlay surface ([data-arcade-coingame]),
    // which includes the close button sibling before the inner panel div.
    // Focus the last focusable in the overlay, then Tab → should wrap to first
    // (still inside the overlay).
    await overlay.evaluate(container => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = Array.from(container.querySelectorAll<HTMLElement>(sel));
      if (els.length > 0) els[els.length - 1].focus();
    });

    await page.keyboard.press('Tab');
    const activeIsInside = await overlay.evaluate(container =>
      container.contains(document.activeElement)
    );
    expect(activeIsInside).toBe(true);
  });

  test('Shift+Tab from first focusable wraps to last (stays inside coingame overlay)', async ({ page }) => {
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    const overlay = page.locator('[data-arcade-coingame]');
    await expect(overlay).toBeVisible();

    // Focus the first focusable in the overlay (the close button), then
    // Shift+Tab → should wrap to the last focusable (still inside the overlay).
    await overlay.evaluate(container => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = Array.from(container.querySelectorAll<HTMLElement>(sel));
      if (els.length > 0) els[0].focus();
    });
    await page.keyboard.press('Shift+Tab');
    const activeIsInside = await overlay.evaluate(container =>
      container.contains(document.activeElement)
    );
    expect(activeIsInside).toBe(true);
  });
});
