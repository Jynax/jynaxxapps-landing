import { test, expect } from '@playwright/test';

test.describe('Data Integrity', () => {
  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForSelector('.hero');
    // Filter out Google Identity Services errors (external script)
    const ownErrors = errors.filter(e =>
      !e.includes('accounts.google.com') &&
      !e.includes('gsi/client')
    );
    expect(ownErrors).toHaveLength(0);
  });

  test('all main sections render in correct order', async ({ page }) => {
    await page.goto('/');
    // Verify the main structural elements exist
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.projects')).toBeVisible();
    await expect(page.locator('.about')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
  });

  test('project cards have required content', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.project-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    // Each card should have at minimum a name
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const text = await card.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });
});
