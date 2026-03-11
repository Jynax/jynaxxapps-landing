import { test, expect } from '@playwright/test';

test.describe('Deep Interactions — Project Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.hero');
  });

  test('hero heading and subtitle have text content', async ({ page }) => {
    const name = page.locator('.hero-name');
    const tagline = page.locator('.hero-tagline');
    await expect(name).not.toBeEmpty();
    await expect(tagline).not.toBeEmpty();
  });

  test('project cards show name and description', async ({ page }) => {
    const cards = page.locator('.project-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.project-card-name')).not.toBeEmpty();
      await expect(card.locator('.project-card-desc')).not.toBeEmpty();
    }
  });

  test('project cards show status labels', async ({ page }) => {
    const statuses = page.locator('.project-card-status');
    const count = await statuses.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(statuses.nth(i)).not.toBeEmpty();
    }
  });

  test('coming soon cards do not link', async ({ page }) => {
    const comingSoon = page.locator('.project-card--coming-soon');
    const count = await comingSoon.count();
    if (count === 0) {
      test.skip();
      return;
    }
    // Coming soon cards should NOT be wrapped in an anchor
    for (let i = 0; i < count; i++) {
      const parent = comingSoon.nth(i).locator('..');
      const tagName = await parent.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).not.toBe('a');
    }
  });

  test('live project cards link externally', async ({ page }) => {
    const liveAnchors = page.locator('.project-card-anchor');
    const count = await liveAnchors.count();
    if (count === 0) {
      test.skip();
      return;
    }
    for (let i = 0; i < count; i++) {
      await expect(liveAnchors.nth(i)).toHaveAttribute('target', '_blank');
      const href = await liveAnchors.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('project cards show AI tool badges', async ({ page }) => {
    const tools = page.locator('.project-card-tool');
    const count = await tools.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Deep Interactions — About & Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('about section has content paragraphs', async ({ page }) => {
    const aboutContent = page.locator('.about-content p');
    const count = await aboutContent.count();
    expect(count).toBeGreaterThan(0);
  });

  test('footer social links have valid hrefs', async ({ page }) => {
    const links = page.locator('.footer-links a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href?.length).toBeGreaterThan(0);
    }
  });

  test('footer note is present', async ({ page }) => {
    const note = page.locator('.footer-note');
    await expect(note).toBeVisible();
    await expect(note).not.toBeEmpty();
  });
});

test.describe('Deep Interactions — Theme', () => {
  test('toggling theme changes body/root appearance', async ({ page }) => {
    await page.goto('/');
    const picker = page.locator('.theme-picker');

    // Get initial theme data attribute
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme') ||
      document.body.getAttribute('data-theme') ||
      document.documentElement.className
    );

    await picker.click();

    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme') ||
      document.body.getAttribute('data-theme') ||
      document.documentElement.className
    );

    expect(newTheme).not.toBe(initialTheme);
  });
});

test.describe('Deep Interactions — Responsive', () => {
  test('key sections visible at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.hero');

    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.hero-name')).toBeVisible();
    await expect(page.locator('.projects')).toBeVisible();
    await expect(page.locator('.project-card').first()).toBeVisible();
    await expect(page.locator('.about')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
    await expect(page.locator('.theme-picker')).toBeVisible();
  });
});

test.describe('Deep Interactions — Error Free', () => {
  test('no console errors across all interactions', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForSelector('.hero');

    // Toggle theme
    await page.locator('.theme-picker').click();
    await page.locator('.theme-picker').click();

    // Navigate to admin and back
    await page.goto('/#/admin');
    await page.waitForSelector('.admin-login-card');
    await page.goto('/');
    await page.waitForSelector('.hero');

    const ownErrors = errors.filter(e =>
      !e.includes('accounts.google.com') &&
      !e.includes('gsi/client') &&
      !e.includes('Failed to load resource') // external scripts in test env
    );
    expect(ownErrors).toHaveLength(0);
  });
});
