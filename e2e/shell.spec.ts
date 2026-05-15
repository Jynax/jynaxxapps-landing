import { test, expect } from '@playwright/test';

test('bare URL defaults to Terminal', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
});

test('#console deep-link renders Console', async ({ page }) => {
  await page.goto('/#console');
  await expect(page.locator('[data-direction="console"]')).toBeVisible();
});

test('hidden #journal reachable + shows hidden badge', async ({ page }) => {
  await page.goto('/#journal');
  await expect(page.locator('[data-direction="journal"]')).toBeVisible();
  await expect(page.locator('[data-hidden-badge]')).toBeVisible();
});

test('toggle bar only shows featured directions', async ({ page }) => {
  await page.goto('/#terminal');
  const btns = page.locator('[data-toggle-direction]');
  await expect(btns).toHaveCount(2);
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
