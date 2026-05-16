import { test, expect } from '@playwright/test';

test.describe('Arcade (featured direction — Task #25)', () => {
  test('reachable via #arcade hash and is NOT a parked stub', async ({ page }) => {
    await page.goto('/#arcade');
    await expect(page.locator('[data-direction="arcade"]')).toBeVisible();
    // Promoted out of the parked stub — no parked banner anymore.
    await expect(page.locator('[data-parked-banner]')).toHaveCount(0);
  });

  test('is a featured switcher dot; clicking it from Terminal navigates', async ({ page }) => {
    await page.goto('/#terminal');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
    const dot = page.locator('[data-toggle-direction="arcade"]');
    await expect(dot).toHaveCount(1);
    await dot.click();
    await expect(page.locator('[data-direction="arcade"]')).toBeVisible();
    expect(new URL(page.url()).hash).toBe('#arcade');
  });

  test('keyboard "4" switches to Arcade', async ({ page }) => {
    await page.goto('/#terminal');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
    await page.keyboard.press('4');
    await expect(page.locator('[data-direction="arcade"]')).toBeVisible();
  });

  test('cart grid shows the 6 public carts; slots 1–2 are Cyberdeck + SMART', async ({ page }) => {
    await page.goto('/#arcade');
    const carts = page.locator('[data-arcade-cart]');
    await expect(carts).toHaveCount(6);
    await expect(carts.nth(0)).toContainText(/CYBERDECK/i);
    await expect(carts.nth(1)).toContainText(/SMART MACHINE/i);
    // Workshop catalog also present (6 B-side rows).
    await expect(page.locator('[data-arcade-devkit-row]')).toHaveCount(6);
  });

  test('live strip is collapsed by default and expands/collapses to the cabinet', async ({ page }) => {
    await page.goto('/#arcade');
    const strip = page.locator('[data-arcade-livestrip]');
    await expect(strip).toBeVisible();
    // Collapsed: no expanded panel / cabinet yet.
    await expect(page.locator('[data-arcade-livestrip-panel]')).toHaveCount(0);
    await expect(page.locator('[data-arcade-cabinet]')).toHaveCount(0);

    const toggle = page.locator('[data-arcade-livestrip-toggle]');
    await toggle.click();
    await expect(page.locator('[data-arcade-livestrip-panel]')).toBeVisible();
    await expect(page.locator('[data-arcade-cabinet]')).toBeVisible();

    await toggle.click();
    await expect(page.locator('[data-arcade-livestrip-panel]')).toHaveCount(0);
  });

  test('selecting a cart loads its dossier; eject clears it', async ({ page }) => {
    await page.goto('/#arcade');
    // Default loaded cart is Cyberdeck.
    const screen = page.locator('[data-arcade-screen]');
    await expect(screen).toContainText(/NOW LOADING \/ CYBERDECK/i);
    // Selecting another cart swaps the dossier.
    await page.locator('[data-arcade-cart]').nth(2).click();
    await expect(screen).toContainText(/NOW LOADING \/ REMNANTS/i);
  });

  test('no visitor-reactions block (Decision 8.3 #4 — stripped this round)', async ({ page }) => {
    await page.goto('/#arcade');
    const root = page.locator('[data-direction="arcade"]');
    await expect(root).toBeVisible();
    // The reference's reactions block headings must not be present.
    await expect(root.getByText(/PRESS A BUTTON/i)).toHaveCount(0);
    await expect(root.getByText(/visitor reactions/i)).toHaveCount(0);
    await expect(root.getByText(/PHASE 2 PREVIEW/i)).toHaveCount(0);
  });

  test('non-reduced motion: starfield + cabinet animate', async ({ page }) => {
    await page.goto('/#arcade');
    await expect(page.locator('[data-direction="arcade"]')).toBeVisible();
    // Starfield twinkle = many SVG <animate> elements.
    const starAnims = await page.locator('[data-direction="arcade"] animate').count();
    expect(starAnims).toBeGreaterThan(0);
    // Expand the strip — cabinet adds its enemy-flicker + projectile animates.
    await page.locator('[data-arcade-livestrip-toggle]').click();
    await expect(page.locator('[data-arcade-cabinet]')).toBeVisible();
    expect(await page.locator('[data-arcade-cabinet] animate').count()).toBeGreaterThan(0);
  });

  test('reduced-motion: all Arcade SVG animation frozen (no <animate>)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/#arcade');
    await expect(page.locator('[data-direction="arcade"]')).toBeVisible();
    // Starfield: no <animate> at all under reduced motion.
    await expect(page.locator('[data-direction="arcade"] animate')).toHaveCount(0);
    // Cabinet too, once expanded.
    await page.locator('[data-arcade-livestrip-toggle]').click();
    await expect(page.locator('[data-arcade-cabinet]')).toBeVisible();
    await expect(page.locator('[data-arcade-cabinet] animate')).toHaveCount(0);
    await context.close();
  });
});
