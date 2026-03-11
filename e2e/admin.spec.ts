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

  test('navigating from admin back to root shows site', async ({ page }) => {
    await page.goto('/#/admin');
    await expect(page.locator('.admin-login-card')).toBeVisible();
    // Navigate back to root
    await page.goto('/');
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.admin-login-card')).not.toBeVisible();
  });
});
