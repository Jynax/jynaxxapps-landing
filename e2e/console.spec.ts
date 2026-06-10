import { test, expect } from '@playwright/test';

test.describe('Console', () => {
  test('renders HUD bar + hero in a corner frame', async ({ page }) => {
    await page.goto('/#console');
    const root = page.locator('[data-direction="console"]');
    await expect(root).toBeVisible();
    await expect(root.getByText(/JX·OPS/i)).toBeVisible();
  });
  test('6 public project cards, each with art', async ({ page }) => {
    await page.goto('/#console');
    await expect(page.locator('[data-project-card]')).toHaveCount(6);
    await expect(page.locator('[data-project-art]')).toHaveCount(6);
  });
  test('project card expands to a dossier', async ({ page }) => {
    await page.goto('/#console');
    await page.locator('[data-project-card]').first().click();
    await expect(page.locator('[data-card-dossier]').first()).toBeVisible();
  });
  test('workbench has 6 workshop rows', async ({ page }) => {
    await page.goto('/#console');
    await expect(page.locator('[data-workbench-row]')).toHaveCount(6);
  });
  test('5 directive cards + 4 contact cards', async ({ page }) => {
    await page.goto('/#console');
    await expect(page.locator('[data-directive-card]')).toHaveCount(5);
    await expect(page.locator('[data-contact-card]')).toHaveCount(4);
  });
  test('HUD ticker increments over time (non-reduced motion)', async ({ page }) => {
    await page.goto('/#console');
    const ticker = page.locator('[data-ticker="sessions"]');
    const a = await ticker.textContent();
    // Poll until the ticker text changes — avoids a fixed wait.
    await expect.poll(() => ticker.textContent(), { timeout: 3000 }).not.toEqual(a);
  });
  test('reduced-motion: ticker frozen', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/#console');
    const ticker = page.locator('[data-ticker="sessions"]');
    const a = await ticker.textContent();
    // Verify text stays constant across several polls over ~1.2 s.
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(300);
      expect(await ticker.textContent()).toEqual(a);
    }
    await context.close();
  });
  test('SMART Machine active-route pulse animates (non-reduced motion)', async ({ page }) => {
    await page.goto('/#console');
    // Only the smart-machine art carries an SVG <animate> (active LM-Studio route).
    await expect(page.locator('[data-project-art] animate')).toHaveCount(1);
  });
  test('reduced-motion: SMART Machine pulse frozen (no <animate>)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/#console');
    await expect(page.locator('[data-project-art] animate')).toHaveCount(0);
    await context.close();
  });
});
