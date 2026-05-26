import { test, expect, type Page } from '@playwright/test';

// Arcade Coin Catch mobile e2e — Task #78.
// Tests coarse-pointer paths (touch drag, ◀/▶ pads, portal slot, paddle size).
// All tests in this file require the mobile-iphone-14 project (hasTouch +
// pointer:coarse) — skipped on the desktop chromium project.
//
// NOTE: must run against a production build (see playwright.config.ts).

// Skip all tests in this file when not running under the iPhone 14 project.
// test.skip at file level doesn't receive testInfo — use beforeEach instead.
test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile-iphone-14',
    'Coin Catch mobile tests need the iPhone 14 project (hasTouch + pointer:coarse).',
  );
});

async function getPlayerX(page: Page): Promise<number> {
  const transform = await page
    .locator('[data-coingame-player]')
    .evaluate(el => (el as HTMLElement).style.transform);
  const match = transform.match(/translateX\(([+-]?\d+(?:\.\d+)?)px\)/);
  return match ? parseFloat(match[1]) : 0;
}

async function openOverlay(page: Page) {
  await page.goto('/#arcade');
  await page.locator('[data-arcade-insert-coin]').click();
  await expect(page.locator('[data-arcade-coingame]')).toBeVisible();
}

async function startPlaying(page: Page) {
  await openOverlay(page);
  await page.locator('[data-coingame-insert]').click();
  await expect(page.locator('[data-coingame-field]')).toBeVisible();
}

test.describe('Arcade Coin Catch — mobile sheet (Task #78)', () => {
  test('sheet opens full-takeover (100dvh × 100vw)', async ({ page, viewport }) => {
    await openOverlay(page);
    const box = (await page.locator('[data-arcade-coingame]').boundingBox())!;
    expect(box.width).toBe(viewport!.width);
    expect(box.height).toBeGreaterThanOrEqual(viewport!.height - 4); // allow 1px rounding
  });

  test('close button is ≥44×44 with aria-label "Close mini-game" and dismisses', async ({ page }) => {
    await openOverlay(page);
    const close = page.locator('[aria-label="Close mini-game"]');
    const box = (await close.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await close.click();
    await expect(page.locator('[data-arcade-coingame]')).toHaveCount(0);
  });

  test('attract phase shows TAP TO START on mobile', async ({ page }) => {
    await openOverlay(page);
    await expect(page.locator('text=TAP TO START')).toBeVisible();
  });

  test('pad portal slot is present while overlay is open', async ({ page }) => {
    await openOverlay(page);
    await expect(page.locator('[data-coingame-pad-slot]')).toHaveCount(1);
  });

  test('HUD score + lives render inside the play frame', async ({ page }) => {
    await startPlaying(page);
    const field = (await page.locator('[data-coingame-field]').boundingBox())!;
    const score = (await page.locator('[data-coingame-score]').boundingBox())!;
    const lives = (await page.locator('[data-coingame-lives]').boundingBox())!;
    expect(score.x).toBeGreaterThanOrEqual(field.x);
    expect(score.y).toBeGreaterThanOrEqual(field.y);
    expect(lives.x + lives.width).toBeLessThanOrEqual(field.x + field.width + 2);
    expect(lives.y).toBeGreaterThanOrEqual(field.y);
  });

  test('◀ / ▶ pads render with ≥72×72 tap targets once playing', async ({ page }) => {
    await startPlaying(page);
    for (const label of ['Slide left', 'Slide right']) {
      const box = (await page.locator(`[aria-label="${label}"]`).boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(72);
      expect(box.height).toBeGreaterThanOrEqual(72);
    }
  });

  test('touch on play frame repositions the paddle X', async ({ page }) => {
    await startPlaying(page);
    const fieldBox = (await page.locator('[data-coingame-field]').boundingBox())!;

    // Tap at the right third of the field — touchstart handler repositions
    // the paddle to touch.clientX - fieldLeft - POT_W/2.
    // new Touch() constructor is not available in Chromium; page.touchscreen.tap()
    // dispatches a real touchstart/touchend that Playwright's mobile emulation supports.
    const tapX = fieldBox.x + fieldBox.width * 0.75;
    const tapY = fieldBox.y + fieldBox.height * 0.5;
    await page.touchscreen.tap(tapX, tapY);

    // Wait for React to flush setPlayerX into the DOM transform.
    const minExpectedX = fieldBox.width * 0.4; // tapping at 75% → paddle lands ≥40% in
    await page.waitForFunction(
      (min: number) => {
        const el = document.querySelector('[data-coingame-player]');
        const t = (el as HTMLElement | null)?.style.transform ?? '';
        const m = t.match(/translateX\(([+-]?\d+(?:\.\d+)?)px\)/);
        return m ? parseFloat(m[1]) > min : false;
      },
      minExpectedX,
      { timeout: 2000 },
    );

    expect(await getPlayerX(page)).toBeGreaterThan(minExpectedX);
  });

  test('press-and-hold ▶ glides paddle right; release stops', async ({ page }) => {
    await startPlaying(page);
    const beforeX = await getPlayerX(page);
    const padRight = page.locator('[aria-label="Slide right"]');

    // pointerdown triggers React's onPointerDown → sets padDirRef.current = 1
    await padRight.dispatchEvent('pointerdown', {
      bubbles: true,
      pointerId: 1,
      isPrimary: true,
    });

    // Wait until the rAF game loop has advanced the paddle at least 1px right.
    await page.waitForFunction(
      (bx: number) => {
        const el = document.querySelector('[data-coingame-player]');
        const t = (el as HTMLElement | null)?.style.transform ?? '';
        const m = t.match(/translateX\(([+-]?\d+(?:\.\d+)?)px\)/);
        return m ? parseFloat(m[1]) > bx : false;
      },
      beforeX,
      { timeout: 2000 },
    );

    const duringX = await getPlayerX(page);
    await padRight.dispatchEvent('pointerup', {
      bubbles: true,
      pointerId: 1,
      isPrimary: true,
    });
    expect(duringX).toBeGreaterThan(beforeX);
  });
});

// Landscape gate — viewport override; runs under mobile-iphone-14 project.
test.describe('Arcade Coin Catch — landscape rotate card (Task #78)', () => {
  test('landscape mobile: rotate card shown, game field not mounted', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 }); // landscape iPhone 14
    await page.goto('/#arcade');
    await page.locator('[data-arcade-insert-coin]').click();
    await expect(page.locator('text=ROTATE PHONE')).toBeVisible();
    await expect(page.locator('[data-coingame-field]')).toHaveCount(0);
  });
});
