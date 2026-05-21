import { test, expect } from '@playwright/test';

test('design tokens are available on :root', async ({ page }) => {
  await page.goto('/#terminal');
  const termBg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--term-bg').trim()
  );
  expect(termBg.toLowerCase()).toBe('#0a0805');
  const conCyan = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--con-cyan').trim()
  );
  expect(conCyan.toLowerCase()).toBe('#6ce0d4');
});

test('Tailwind preflight is active (unstyled h1 inherits font-size)', async ({ page }) => {
  await page.goto('/#terminal');
  const fontSize = await page.evaluate(() => {
    const h = document.createElement('h1');
    h.textContent = 'x';
    document.body.appendChild(h);
    const fs = getComputedStyle(h).fontSize;
    h.remove();
    return fs;
  });
  // Browser default for an <h1> is 2em (32px). Tailwind v4 Preflight (always
  // emitted by `@import "tailwindcss"`, no JIT scan needed) resets headings to
  // `font-size: inherit`, so it inherits the 16px body size. This is a reliable
  // runtime signal that Tailwind is wired in, independent of JIT class scanning.
  expect(fontSize).toBe('16px');
});
