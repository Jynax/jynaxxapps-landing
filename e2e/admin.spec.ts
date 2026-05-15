import { test, expect } from '@playwright/test';

test.describe('Admin', () => {
  test('navigating to #/admin shows login form', async ({ page }) => {
    await page.goto('/#/admin');
    const loginCard = page.locator('.admin-login-card');
    await expect(loginCard).toBeVisible();
    await expect(page.locator('.admin-login-title')).toContainText('JynaxxApps Admin');
  });

  test('Google OAuth button container is present', async ({ page }) => {
    await page.goto('/#/admin');
    // The Google button is rendered into a div via GIS script
    // We can verify the wrapper exists
    const btnWrapper = page.locator('.admin-google-btn-wrapper');
    await expect(btnWrapper).toBeVisible();
  });

  test('admin page does not show main site content', async ({ page }) => {
    await page.goto('/#/admin');
    // Hero and projects should NOT be visible on admin
    await expect(page.locator('.hero')).not.toBeVisible();
    await expect(page.locator('.projects')).not.toBeVisible();
  });

  test('navigating from admin back to root shows the site', async ({ page }) => {
    await page.goto('/#/admin');
    await expect(page.locator('.admin-login-card')).toBeVisible();
    await expect(page.locator('[data-direction]')).toHaveCount(0);
    // Navigate back to the site root — the live shell renders a direction and
    // the admin login UI is gone.
    await page.goto('/');
    await expect(page.locator('[data-direction]')).toBeVisible();
    await expect(page.locator('.admin-login-card')).toHaveCount(0);
  });
});
