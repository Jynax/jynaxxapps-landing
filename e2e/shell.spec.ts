import { test, expect } from '@playwright/test';

test('bare URL defaults to Terminal', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
});

test('#console deep-link renders Console', async ({ page }) => {
  await page.goto('/#console');
  await expect(page.locator('[data-direction="console"]')).toBeVisible();
});

test('hidden #journal reachable via direct hash, not a switcher dot', async ({ page }) => {
  await page.goto('/#journal');
  await expect(page.locator('[data-direction="journal"]')).toBeVisible();
  // New floating-pill switcher only renders featured directions as dots;
  // parked directions (now journal only) stay reachable by hash but are not
  // in the pill. Featured set is Terminal · Console · Arcade.
  await expect(page.locator('[data-toggle-direction="journal"]')).toHaveCount(0);
  await expect(page.locator('[data-toggle-direction]')).toHaveCount(3);
});

test('switcher pill only shows featured directions', async ({ page }) => {
  await page.goto('/#terminal');
  const btns = page.locator('[data-toggle-direction]');
  await expect(btns).toHaveCount(3);
});

test('keyboard 2 switches to Console and replaces hash', async ({ page }) => {
  await page.goto('/#terminal');
  await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
  await page.keyboard.press('2');
  await expect(page.locator('[data-direction="console"]')).toBeVisible();
  expect(new URL(page.url()).hash).toBe('#console');
});

test('localStorage remembers last direction on bare load', async ({ page }) => {
  await page.goto('/#console');
  await expect(page.locator('[data-direction="console"]')).toBeVisible();
  await page.goto('/');
  await expect(page.locator('[data-direction="console"]')).toBeVisible();
});

test('admin route bypasses the shell', async ({ page }) => {
  await page.goto('/#/admin');
  await expect(page.locator('[data-direction]')).toHaveCount(0);
});

// Regression: the content scroller must overflow and actually scroll so
// below-the-fold content (project list, manifesto, contact, footer) is
// reachable. Pre-fix the direction was a flex item with overflow:hidden,
// collapsing it to viewport height and clipping everything below the fold.
for (const dir of ['terminal', 'console'] as const) {
  test(`content scroller scrolls past the fold (${dir})`, async ({ page }) => {
    await page.goto(`/#${dir}`);
    await expect(page.locator(`[data-direction="${dir}"]`)).toBeVisible();
    const scroller = page.locator('[data-shell-scroller]');

    const before = await scroller.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    // Content must genuinely overflow the scroll viewport.
    expect(before.scrollHeight).toBeGreaterThan(before.clientHeight + 100);

    // And scrolling must actually move the viewport.
    await scroller.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const scrolledTop = await scroller.evaluate((el) => el.scrollTop);
    expect(scrolledTop).toBeGreaterThan(0);
  });
}
