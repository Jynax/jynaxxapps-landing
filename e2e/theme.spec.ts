import { test, expect } from '@playwright/test';

test.describe('Theme', () => {
  test('theme picker button is visible', async ({ page }) => {
    await page.goto('/');
    const picker = page.locator('.theme-picker');
    await expect(picker).toBeVisible();
  });

  test('clicking theme picker toggles between dark and light', async ({ page }) => {
    await page.goto('/');
    const picker = page.locator('.theme-picker');

    // Get initial theme from data attribute or class on html/body
    const initialLabel = await picker.getAttribute('aria-label');

    await picker.click();

    const newLabel = await picker.getAttribute('aria-label');
    // Label should change (indicates theme toggled)
    expect(newLabel).not.toBe(initialLabel);
  });

  test('theme persists across navigation', async ({ page }) => {
    await page.goto('/');
    const picker = page.locator('.theme-picker');

    // Toggle theme
    await picker.click();
    const afterToggle = await picker.getAttribute('aria-label');

    // Reload page
    await page.reload();
    await page.waitForSelector('.theme-picker');
    const afterReload = await picker.getAttribute('aria-label');

    expect(afterReload).toBe(afterToggle);
  });

  test('theme picker has accessible label', async ({ page }) => {
    await page.goto('/');
    const picker = page.locator('.theme-picker');
    const label = await picker.getAttribute('aria-label');
    expect(label).toMatch(/Switch to (dark|light) mode/);
  });
});
