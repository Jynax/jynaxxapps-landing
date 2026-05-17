import { test, expect } from '@playwright/test';

// Task #29 — Arcade "insert coin" easter-egg: rotation shell + Coin Catch.

test.describe('Arcade insert-coin easter egg (Task #29)', () => {
  test('INSERT COIN is a hidden-but-real control; click opens the attract screen', async ({ page }) => {
    await page.goto('/#arcade');
    await expect(page.locator('[data-direction="arcade"]')).toBeVisible();

    // No overlay until invoked — it's an easter egg, not a featured control.
    await expect(page.locator('[data-arcade-coingame]')).toHaveCount(0);

    const trigger = page.locator('[data-arcade-insert-coin]');
    await expect(trigger).toHaveCount(1);
    await trigger.click();

    const overlay = page.locator('[data-arcade-coingame]');
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute('data-coingame-state', 'attract');
    await expect(overlay).toHaveAttribute('role', 'dialog');
    await expect(page.locator('[data-coingame-title]')).toHaveText('COIN CATCH');
  });

  test('keyboard: trigger focusable + Enter opens; Space starts play', async ({ page }) => {
    await page.goto('/#arcade');
    const trigger = page.locator('[data-arcade-insert-coin]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const overlay = page.locator('[data-arcade-coingame]');
    await expect(overlay).toHaveAttribute('data-coingame-state', 'attract');

    await page.keyboard.press('Space');
    await expect(overlay).toHaveAttribute('data-coingame-state', 'playing');
    await expect(page.locator('[data-coingame-field]')).toBeVisible();
    await expect(page.locator('[data-coingame-player]')).toBeVisible();
    await expect(page.locator('[data-coingame-score]')).toBeVisible();
  });

  test('play then dismiss: Esc, ✕ button, and backdrop all close it', async ({ page }) => {
    await page.goto('/#arcade');

    // Esc from attract.
    await page.locator('[data-arcade-insert-coin]').click();
    await expect(page.locator('[data-arcade-coingame]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-arcade-coingame]')).toHaveCount(0);

    // ✕ button from playing.
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    await expect(page.locator('[data-arcade-coingame]')).toHaveAttribute('data-coingame-state', 'playing');
    await page.locator('[data-coingame-close]').click();
    await expect(page.locator('[data-arcade-coingame]')).toHaveCount(0);

    // Backdrop click from attract.
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-arcade-coingame]').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('[data-arcade-coingame]')).toHaveCount(0);
  });

  test('arrow keys move the player and do not switch direction', async ({ page }) => {
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    const player = page.locator('[data-coingame-player]');
    await expect(player).toBeVisible();

    const before = await player.evaluate(el => getComputedStyle(el).transform);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const after = await player.evaluate(el => getComputedStyle(el).transform);
    expect(after).not.toBe(before);

    // Arrow play did not leak to the 1–4 direction switcher.
    await expect(page.locator('[data-direction="arcade"]')).toBeVisible();
  });

  test('game over after the timer, then INSERT COIN rotates to the next game', async ({ page }) => {
    await page.clock.install();
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    const overlay = page.locator('[data-arcade-coingame]');
    await expect(overlay).toHaveAttribute('data-coingame-state', 'playing');

    // Run out the 15s clock deterministically.
    await page.clock.fastForward(16000);
    await expect(overlay).toHaveAttribute('data-coingame-state', 'over');
    await expect(page.locator('[data-coingame-finalscore]')).toBeVisible();

    // Rotate: with one game registered it loops back into the same game,
    // proving the shell cycles rather than dead-ends.
    await page.locator('[data-coingame-next]').click();
    await expect(overlay).toHaveAttribute('data-coingame-state', 'playing');
    await expect(page.locator('[data-coingame-title]')).toHaveText('COIN CATCH');
  });

  test('HUD hi-score shows a persistent personal best + achieved-on date', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'jx_arcade_hiscore',
        JSON.stringify({ score: 9001, date: '2026-05-17' }),
      );
    });
    await page.goto('/#arcade');
    const hud = page.locator('[data-direction="arcade"]');
    await expect(hud).toContainText('9,001');
    await expect(page.locator('[data-arcade-hiscore-date]')).toHaveText('· 26.05.17');
  });

  test('HUD hi-score shows no date before the seed is beaten', async ({ page }) => {
    await page.goto('/#arcade');
    await expect(page.locator('[data-direction="arcade"]')).toContainText('1,247');
    await expect(page.locator('[data-arcade-hiscore-date]')).toHaveCount(0);
  });

  test('plays counter: shows the global total, POSTs once per browser', async ({ page }) => {
    const methods: string[] = [];
    await page.route('**/api/arcade-plays', route => {
      const m = route.request().method();
      methods.push(m);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: m === 'POST' ? 42 : 41 }),
      });
    });

    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await expect(page.locator('[data-coingame-plays]')).toContainText('41');

    // First play POSTs (→ 42) and gates further POSTs via localStorage.
    await page.locator('[data-coingame-insert]').click();
    await expect(page.locator('[data-arcade-coingame]')).toHaveAttribute('data-coingame-state', 'playing');
    await page.keyboard.press('Escape');

    // Reopen + play again — must NOT POST a second time.
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    await page.keyboard.press('Escape');

    expect(methods.filter(m => m === 'POST')).toHaveLength(1);
  });

  test('plays counter hides gracefully when the endpoint is unavailable', async ({ page }) => {
    // No route mock — vite dev serves SPA HTML for /api/*, so count stays unknown.
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await expect(page.locator('[data-arcade-coingame]')).toBeVisible();
    await expect(page.locator('[data-coingame-plays]')).toHaveCount(0);
  });

  test('reduced motion: playable, and adds zero SVG <animate> to the arcade', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.clock.install();
    await page.goto('/#arcade');

    // Baseline arcade reduced-motion contract still holds.
    await expect(page.locator('[data-direction="arcade"] animate')).toHaveCount(0);

    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    await expect(page.locator('[data-arcade-coingame]')).toHaveAttribute('data-coingame-state', 'playing');

    // Overlay + game introduce no SMIL animation under reduced motion.
    await expect(page.locator('[data-arcade-coingame] animate')).toHaveCount(0);
    await expect(page.locator('[data-direction="arcade"] animate')).toHaveCount(0);

    // Discrete tick variant still reaches game over. runFor (not fastForward)
    // so the 650ms setInterval actually iterates rather than firing once.
    await page.clock.runFor(16000);
    await expect(page.locator('[data-arcade-coingame]')).toHaveAttribute('data-coingame-state', 'over');

    await context.close();
  });
});
