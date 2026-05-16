import { test, expect } from '@playwright/test';

// Arcade was promoted to a full featured direction (Task #25, May-16 round);
// Journal is the only remaining parked stub.
for (const dir of ['journal'] as const) {
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

    test(`#${dir} reachable by hash but not a switcher dot`, async ({ page }) => {
      await page.goto(`/#${dir}`);
      await expect(page.locator(`[data-direction="${dir}"]`)).toBeVisible();
      // Parked directions are not in the floating switcher pill (only
      // featured ones get a dot), but remain reachable via direct hash.
      await expect(page.locator(`[data-toggle-direction="${dir}"]`)).toHaveCount(0);
      await expect(page.locator('[data-toggle-direction]')).toHaveCount(3);
    });
  });
}
