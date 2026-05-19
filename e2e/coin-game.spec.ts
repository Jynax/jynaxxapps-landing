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

  test('missing 3 coins ends the run, then INSERT COIN rotates to the next game', async ({ browser }) => {
    // Use reduced-motion context so the game runs the setInterval path which
    // page.clock drives deterministically. The player stays stationary so
    // most coins fall past (random spawn positions; player covers ~14% of field).
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.clock.install();
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    const overlay = page.locator('[data-arcade-coingame]');
    await expect(overlay).toHaveAttribute('data-coingame-state', 'playing');

    // Advance clock until 3 coins fall past the stationary player → game over.
    await page.clock.runFor(20_000);
    await expect(overlay).toHaveAttribute('data-coingame-state', 'over');
    await expect(page.locator('[data-coingame-finalscore]')).toBeVisible();

    // Rotate: with one game registered it loops back into the same game,
    // proving the shell cycles rather than dead-ends.
    await page.locator('[data-coingame-next]').click();
    await expect(overlay).toHaveAttribute('data-coingame-state', 'playing');
    await expect(page.locator('[data-coingame-title]')).toHaveText('COIN CATCH');
    await context.close();
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

  test('no timer: the TIME HUD readout is gone, a LIVES/MISS readout is present', async ({ page }) => {
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    await expect(page.locator('[data-arcade-coingame]')).toHaveAttribute('data-coingame-state', 'playing');
    await expect(page.locator('[data-coingame-timer]')).toHaveCount(0);
    await expect(page.locator('[data-coingame-lives]')).toHaveCount(1);
  });

  test('missing 3 coins ends the run (GAME OVER), score still bubbles up', async ({ page }) => {
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    // Do NOT move the collector; let coins fall past until 3 misses.
    await expect(page.locator('[data-arcade-coingame][data-coingame-state="over"]'))
      .toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[data-coingame-finalscore]')).toBeVisible();
  });

  test('difficulty ramps: coins fall faster later in a run than at the start', async ({ page }) => {
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    await expect(page.locator('[data-arcade-coingame]')).toHaveAttribute('data-coingame-state', 'playing');

    // Sample early fall speed.
    await page.waitForSelector('[data-coingame-coin]');
    const earlyY1 = (await page.locator('[data-coingame-coin]').first().boundingBox())!.y;
    await page.waitForTimeout(200);
    const earlyY2 = (await page.locator('[data-coingame-coin]').first().boundingBox())!.y;
    const earlySpeed = (earlyY2 - earlyY1) / 200;

    // Track coins with pointer-follow to survive and let the ramp advance (~8s).
    const field = page.locator('[data-coingame-field]');
    const fb = await field.boundingBox();
    for (let i = 0; i < 80; i++) {
      const coinBox = await page.locator('[data-coingame-coin]').first().boundingBox().catch(() => null);
      const targetX = coinBox ? fb!.x + coinBox.x + coinBox.width / 2 : fb!.x + fb!.width / 2;
      await page.mouse.move(targetX, fb!.y + fb!.height / 2);
      await page.waitForTimeout(100);
      const state = await page.locator('[data-arcade-coingame]').getAttribute('data-coingame-state');
      if (state !== 'playing') break;
    }

    const state = await page.locator('[data-arcade-coingame]').getAttribute('data-coingame-state');
    if (state !== 'playing') return;

    // Sample late fall speed.
    await page.waitForSelector('[data-coingame-coin]');
    const lateY1 = (await page.locator('[data-coingame-coin]').first().boundingBox())!.y;
    await page.waitForTimeout(200);
    const lateY2 = (await page.locator('[data-coingame-coin]').first().boundingBox())!.y;
    const lateSpeed = (lateY2 - lateY1) / 200;

    expect(lateSpeed).toBeGreaterThan(earlySpeed * 1.3);
  });

  test('collector is the Pot of Gold and is smaller than the old chibi (78px)', async ({ page }) => {
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await page.locator('[data-coingame-insert]').click();
    await expect(page.locator('[data-arcade-coingame]')).toHaveAttribute('data-coingame-state', 'playing');
    const collector = page.locator('[data-coingame-player]');
    await expect(collector).toBeVisible();
    const box = await collector.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThan(78);
    expect(box!.width).toBeGreaterThanOrEqual(40);
    await expect(collector.locator('[data-pot-of-gold]')).toHaveCount(1);
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
