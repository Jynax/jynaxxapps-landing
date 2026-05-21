import { test, expect } from '@playwright/test';

// Task #51 — Terminal mobile — Contact section
//
// Verifies the stacked label-above-value mobile layout for the contact block,
// 44px tap targets, link wiring preservation, and no horizontal scroll.
// Also guards that the desktop two-column layout is unchanged at ≥1024px.

const MOBILE_VIEWPORT = { width: 412, height: 915 }; // Pixel 7
const NARROW_VIEWPORT = { width: 360, height: 800 }; // narrow Android
const DESKTOP_VIEWPORT = { width: 1280, height: 900 };

test.describe('Contact block — mobile layout (Task #51)', () => {

  test('contact rows are present in the terminal section', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');
    await expect(page.locator('[data-contact-row]')).toHaveCount(4);
  });

  test('each contact row has a minimum 44px tap target height on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');

    const rows = page.locator('[data-contact-row]');
    await expect(rows).toHaveCount(4); // wait for streamed Terminal content
    const count = await rows.count();
    expect(count).toBe(4);

    for (let i = 0; i < count; i++) {
      const box = await rows.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('bluesky value is not truncated on Pixel 7 width (412px)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');

    // The longest value: @mrchartrand.bsky.social
    const row = page.locator('[data-contact-row]').filter({ hasText: '@mrchartrand.bsky.social' });
    await expect(row).toBeVisible();
    await expect(row).toContainText('@mrchartrand.bsky.social');
  });

  test('bluesky value is not truncated on narrow 360px viewport', async ({ page }) => {
    await page.setViewportSize(NARROW_VIEWPORT);
    await page.goto('/#terminal');

    const row = page.locator('[data-contact-row]').filter({ hasText: '@mrchartrand.bsky.social' });
    await expect(row).toBeVisible();
    await expect(row).toContainText('@mrchartrand.bsky.social');
  });

  test('no horizontal scroll on mobile viewport', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // allow 1px rounding
  });

  test('links are wired correctly on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');

    const rows = page.locator('[data-contact-row]');
    await expect(rows).toHaveCount(4); // wait for streamed Terminal content
    const hrefs = await rows.evaluateAll(els =>
      els.map(el => (el as HTMLAnchorElement).href)
    );

    expect(hrefs.some(h => h.startsWith('mailto:'))).toBe(true);
    expect(hrefs.some(h => h.includes('github.com'))).toBe(true);
    expect(hrefs.some(h => h.includes('bsky.app'))).toBe(true);
    expect(hrefs.some(h => h.includes('feed.xml'))).toBe(true);
  });

  test('external links have rel="noopener noreferrer" on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/#terminal');

    const rows = page.locator('[data-contact-row]');
    await expect(rows).toHaveCount(4); // wait for streamed Terminal content
    const relAttrs = await rows.evaluateAll(els =>
      els
        .filter(el => (el as HTMLAnchorElement).href.startsWith('https://'))
        .map(el => el.getAttribute('rel'))
    );

    expect(relAttrs.length).toBeGreaterThan(0);
    for (const rel of relAttrs) {
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test('no horizontal scroll on narrow 360px viewport', async ({ page }) => {
    await page.setViewportSize(NARROW_VIEWPORT);
    await page.goto('/#terminal');

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe('Contact block — desktop layout unchanged (Task #51)', () => {

  test('contact section is visible on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/#terminal');

    const section = page.locator('section[aria-label="contact"]');
    await expect(section).toBeVisible();
  });

  test('all four contact values are visible on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/#terminal');

    await expect(page.getByText('jynaxx@gmail.com')).toBeVisible();
    await expect(page.getByText('github.com/Jynax')).toBeVisible();
    await expect(page.getByText('@mrchartrand.bsky.social')).toBeVisible();
    await expect(page.getByText('/feed.xml')).toBeVisible();
  });

  test('no [data-contact-row] on desktop (desktop uses static <li> layout)', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/#terminal');

    // On desktop the ContactRow renders a plain <li> without data-contact-row
    await expect(page.locator('[data-contact-row]')).toHaveCount(0);
  });
});
