import { test, expect } from '@playwright/test';

for (const dir of ['journal', 'arcade'] as const) {
  test.describe(`Parked: ${dir}`, () => {
    test(`renders at #${dir} with parked banner + shared content`, async ({ page }) => {
      await page.goto(`/#${dir}`);
      const root = page.locator(`[data-direction="${dir}"]`);
      await expect(root).toBeVisible();
      await expect(page.locator(`[data-parked-banner]`)).toBeVisible();
      await expect(page.locator(`[data-parked-banner]`)).toContainText(/parked|design pending/i);
      // shared content rendered plainly: all 12 projects + manifesto present
      await expect(root.locator('[data-parked-project]')).toHaveCount(12);
      await expect(root.getByText(/Build to learn\./)).toBeVisible();
    });

    test(`#${dir} still shows the shell hidden-badge`, async ({ page }) => {
      await page.goto(`/#${dir}`);
      await expect(page.locator('[data-hidden-badge]')).toBeVisible();
    });
  });
}
