import { test, expect } from '@playwright/test';

test('design tokens are available on :root', async ({ page }) => {
  await page.goto('/#terminal');
  const termBg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--term-bg').trim()
  );
  expect(termBg).toBe('#0A0805');
  const conCyan = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--con-cyan').trim()
  );
  expect(conCyan).toBe('#6CE0D4');
});

test('a Tailwind utility class applies', async ({ page }) => {
  await page.goto('/#terminal');
  await page.setContent('<div class="hidden" id="t">x</div>');
  const display = await page.evaluate(() => {
    const el = document.getElementById('t')!;
    return getComputedStyle(el).display;
  });
  expect(display).toBe('none');
});
