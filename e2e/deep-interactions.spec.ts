import { test, expect } from '@playwright/test';

// This spec covers ONLY interactions not already asserted by the green suite
// (shell/terminal/console/parked/navigation). Coverage mapping for the retired
// old-DOM assertions is documented in the Task 10 report. The remaining gaps:
//   1. Copy-link button flips to "✓ LINK COPIED" (no existing coverage).
//   2. Terminal about block expand AND collapse round-trip
//      (terminal.spec.ts only asserts the expand half).
//   3. Console dossier Launch link is layered above the toggle overlay, so
//      clicking it does NOT collapse the card (untested layering contract).
//   4. Keyboard "1" returns to Terminal (shell.spec.ts only tests "2"→Console).

test.describe('Deep Interactions', () => {
  test('copy-link button flips to "✓ LINK COPIED"', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#terminal');

    const copyBtn = page.locator('header button[title="Copy shareable link"]');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(copyBtn).toHaveText(/✓ LINK COPIED/);
  });

  test('Terminal about block expands AND collapses (round-trip)', async ({ page }) => {
    await page.goto('/#terminal');
    const toggle = page.locator('[data-about-toggle]');

    await expect(page.locator('[data-about-full]')).toHaveCount(0);
    await toggle.click();
    await expect(page.locator('[data-about-full]')).toBeVisible();
    await toggle.click();
    await expect(page.locator('[data-about-full]')).toHaveCount(0);
  });

  test('Console: clicking the dossier Launch link does not collapse the card', async ({ page, context }) => {
    await page.goto('/#console');
    const card = page.locator('[data-project-card]').first();
    await card.click();
    const dossier = page.locator('[data-card-dossier]').first();
    await expect(dossier).toBeVisible();

    // The Launch <a> is a sibling of the toggle overlay, raised above it via
    // z-index — clicking it opens a new tab and must NOT re-trigger the toggle.
    const launch = dossier.getByRole('link', { name: /^Open / });
    const popupPromise = context.waitForEvent('page');
    await launch.click();
    const popup = await popupPromise;
    await popup.close();

    // Card stays open — the dossier is still rendered.
    await expect(dossier).toBeVisible();
  });

  test('keyboard "1" returns to Terminal from Console', async ({ page }) => {
    await page.goto('/#console');
    await expect(page.locator('[data-direction="console"]')).toBeVisible();
    await page.keyboard.press('1');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
    expect(new URL(page.url()).hash).toBe('#terminal');
  });
});
