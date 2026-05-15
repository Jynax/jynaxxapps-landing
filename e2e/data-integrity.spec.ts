import { test, expect } from '@playwright/test';

// Benign console noise we tolerate (external Google Identity script, dev-only
// React/Vite chatter). We FAIL on any error-level message not in this list and
// on ANY uncaught page error.
function isBenign(text: string): boolean {
  return (
    text.includes('accounts.google.com') ||
    text.includes('gsi/client') ||
    // only Google Identity (GIS) resource failures are benign; an app-origin resource failure must fail the test
    (text.includes('Failed to load resource') && (text.includes('accounts.google.com') || text.includes('gsi/') || text.includes('apis.google.com'))) ||
    text.includes('Download the React DevTools')
  );
}

const DIRECTIONS = ['terminal', 'console', 'journal', 'arcade'] as const;

test.describe('Data Integrity', () => {
  for (const dir of DIRECTIONS) {
    test(`#${dir} loads with no uncaught console errors or page errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && !isBenign(msg.text())) errors.push(msg.text());
      });
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(`/#${dir}`);
      await expect(page.locator(`[data-direction="${dir}"]`)).toBeVisible();
      await page.waitForTimeout(300); // explicit settle: let async effects + lazy chunks flush so late console/pageerror is captured before asserting

      expect(errors, errors.join('\n')).toHaveLength(0);
    });
  }

  test('project register exposes exactly 12 projects (6 public + 6 workshop)', async ({ page }) => {
    await page.goto('/#terminal');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
    const counts = await page.evaluate(() => window.__JX__);
    expect(counts).toEqual({ total: 12, public: 6, workshop: 6 });
  });

  test('Terminal renders all 12 project rows', async ({ page }) => {
    await page.goto('/#terminal');
    await expect(page.locator('[data-project-row]')).toHaveCount(12);
  });

  test('Console renders 6 public cards and 6 workshop rows', async ({ page }) => {
    await page.goto('/#console');
    await expect(page.locator('[data-project-card]')).toHaveCount(6);
    await expect(page.locator('[data-workbench-row]')).toHaveCount(6);
  });

  test('parked stubs render all 12 projects', async ({ page }) => {
    await page.goto('/#journal');
    await expect(page.locator('[data-parked-project]')).toHaveCount(12);
  });

  test('the 5 manifesto lines render in a direction', async ({ page }) => {
    // Parked stubs render the manifesto as plain text lines (no padding/box),
    // so each line is matchable verbatim.
    await page.goto('/#journal');
    const root = page.locator('[data-direction="journal"]');
    await expect(root).toBeVisible();
    for (const line of [
      'Build to learn.',
      'Break things on purpose.',
      'Ship the weird one.',
      'Take notes. Then take more notes.',
      'AI is a coworker, not a wand.',
    ]) {
      await expect(root.getByText(line, { exact: true })).toBeVisible();
    }
  });
});
