import { test, expect } from '@playwright/test';

test('register exposes 12 projects, 6 public + 6 workshop', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const counts = await page.evaluate(() =>
    (window as unknown as { __JX__?: { total: number; public: number; workshop: number } }).__JX__ ?? null
  );
  expect(counts).not.toBeNull();
  expect(counts.total).toBe(12);
  expect(counts.public).toBe(6);
  expect(counts.workshop).toBe(6);
});
