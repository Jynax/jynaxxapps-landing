import { test, expect } from '@playwright/test';

test.describe('Navigation & Layout', () => {
  test('page loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/JynaxxApps/i);
  });

  test('bare URL renders the Terminal direction by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
  });

  test('toggle bar is present with the three featured directions', async ({ page }) => {
    await page.goto('/');
    const toggles = page.locator('[data-toggle-direction]');
    await expect(toggles).toHaveCount(3);
    await expect(page.locator('[data-toggle-direction="terminal"]')).toBeVisible();
    await expect(page.locator('[data-toggle-direction="console"]')).toBeVisible();
    await expect(page.locator('[data-toggle-direction="arcade"]')).toBeVisible();
  });

  test('clicking the Console toggle switches direction and updates the hash', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();

    await page.locator('[data-toggle-direction="console"]').click();

    await expect(page.locator('[data-direction="console"]')).toBeVisible();
    await expect(page.locator('[data-direction="terminal"]')).toHaveCount(0);
    expect(new URL(page.url()).hash).toBe('#console');
  });

  test('footer copyright is present in the Terminal direction', async ({ page }) => {
    await page.goto('/#terminal');
    const root = page.locator('[data-direction="terminal"]');
    await expect(root).toBeVisible();
    await expect(root.getByText(/all rights reversed/i)).toBeVisible();
  });

  test('contact links use the correct schemes', async ({ page }) => {
    await page.goto('/#terminal');
    const root = page.locator('[data-direction="terminal"]');
    await expect(root).toBeVisible();

    // Email contact is a mailto: link.
    const mailto = root.locator('a[href^="mailto:"]');
    await expect(mailto.first()).toBeVisible();
    await expect(mailto.first()).toHaveAttribute('href', 'mailto:jynaxx@gmail.com');

    // GitHub contact is the canonical https URL and opens in a new tab.
    const github = root.locator('a[href="https://github.com/Jynax"]');
    await expect(github).toBeVisible();
    await expect(github).toHaveAttribute('target', '_blank');
  });
});
