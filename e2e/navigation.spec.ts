import { test, expect } from '@playwright/test';

test.describe('Navigation & Layout', () => {
  test('page loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/JynaxxApps/i);
  });

  test('hero section is visible with name and tagline', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
    await expect(page.locator('.hero-name')).toBeVisible();
    await expect(page.locator('.hero-tagline')).toBeVisible();
  });

  test('project showcase section renders', async ({ page }) => {
    await page.goto('/');
    const projects = page.locator('.projects');
    await expect(projects).toBeVisible();
    await expect(page.locator('.projects .section-title')).toContainText(/What I'm Building/i);
  });

  test('project cards render', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.project-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('about section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.about')).toBeVisible();
  });

  test('footer with social links is visible', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    const links = footer.locator('.footer-links a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('footer links open in new tab', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.footer-links a');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toHaveAttribute('target', '_blank');
    }
  });
});
