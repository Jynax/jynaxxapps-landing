import { test, expect } from '@playwright/test';

test.describe('Terminal', () => {
  test('renders CRT chrome + boot ready line', async ({ page }) => {
    await page.goto('/#terminal');
    const root = page.locator('[data-direction="terminal"]');
    await expect(root).toBeVisible();
    await expect(root.getByText(/JYNAXX-OS v2\.6\.0/)).toBeVisible();
    await expect(root.getByText(/type help for commands/i)).toBeVisible();
  });

  test('about block expands on click', async ({ page }) => {
    await page.goto('/#terminal');
    const toggle = page.locator('[data-about-toggle]');
    await toggle.click();
    await expect(page.locator('[data-about-full]')).toBeVisible();
  });

  test('project row expands to a dossier', async ({ page }) => {
    await page.goto('/#terminal');
    const row = page.locator('[data-project-row]').first();
    await row.click();
    await expect(page.locator('[data-dossier]').first()).toBeVisible();
  });

  test('all 12 project rows present (6 apps + 6 workshop)', async ({ page }) => {
    await page.goto('/#terminal');
    await expect(page.locator('[data-project-row]')).toHaveCount(12);
  });

  test('help commands are accessible buttons that jump to their section', async ({ page }) => {
    await page.goto('/#terminal');
    const scroller = page.locator('[data-shell-scroller]');
    await expect(scroller).toHaveJSProperty('scrollTop', 0);

    // The command word is a real, keyboard-focusable button (not a bare span).
    const lsBtn = page.getByRole('button', { name: 'Jump to ls section' });
    await expect(lsBtn).toBeVisible();
    await lsBtn.focus();
    await expect(lsBtn).toBeFocused();

    await lsBtn.click();
    await expect(page.locator('[data-term-section="ls"]')).toBeInViewport();
    expect(await scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });

  test('reduced-motion: all 8 boot lines render immediately, no streaming', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/#terminal');
    // No animation wait: under reduced-motion the boot log is fully rendered at once.
    // 8 = canonical terminal.jsx's 7 POST self-test lines + the mandated final
    // `ready. type help for commands.` row (our architecture keeps it in-array).
    await expect(page.locator('[data-bootline]')).toHaveCount(8);
    await context.close();
  });
});
