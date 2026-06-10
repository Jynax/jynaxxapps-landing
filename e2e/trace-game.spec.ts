import { test, expect } from '@playwright/test';

// Task #40 — TRACE hidden daily word-puzzle in Terminal.
//
// Test seam: window.__TRACE_TEST__ = { dateISO, puzzleId } pins the date and
// picks a specific puzzle for deterministic runs.
//
// Puzzle #1 (seeded): stare → shone, par 3, budget 8 (3+5).
// Winning path (3 moves): share, shore, shone.
// Losing path (8 valid non-winning moves): scare, share, shore, store, score,
//   scare, share, shore — all 1-letter changes, never reach shone.

test.describe('TRACE word-puzzle in Terminal (Task #40)', () => {

  test('? button is present, focusable, click opens attract screen', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();

    // Overlay absent until triggered — it is a hidden easter egg.
    await expect(page.locator('[data-trace-overlay]')).toHaveCount(0);

    const trigger = page.locator('[data-trace-open]');
    await expect(trigger).toHaveCount(1);
    await expect(trigger).toHaveAttribute('aria-label', 'Open daily word puzzle');

    await trigger.click();
    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute('data-trace-phase', 'attract');
    await expect(overlay).toHaveAttribute('role', 'dialog');
    await expect(page.locator('[data-trace-puzzle]')).toContainText('STARE');
    await expect(page.locator('[data-trace-puzzle]')).toContainText('SHONE');
  });

  test('ENTER begins play; winning path transitions to over with "route resolved"', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();

    // Wait for the lazy chunk to mount before pressing Enter.
    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(overlay).toHaveAttribute('data-trace-phase', 'playing');
    await expect(page.locator('[data-trace-game]')).toBeVisible();

    // Win: stare → share → shore → shone (3 moves, par 3)
    for (const word of ['share', 'shore', 'shone']) {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
    }

    await expect(overlay).toHaveAttribute('data-trace-phase', 'over');
    await expect(overlay).toContainText('route resolved');
  });

  test('exhausting budget loses; par-length route is revealed in over screen', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-trace-game]')).toBeVisible();

    // 8 valid non-winning moves — budget exhausted
    for (const word of ['scare', 'share', 'shore', 'store', 'score', 'scare', 'share', 'shore']) {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
    }

    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toHaveAttribute('data-trace-phase', 'over');
    await expect(overlay).toContainText('connection dropped');

    // BFS route reveal starts with the start word
    const reveal = page.locator('[data-trace-reveal]');
    await expect(reveal).toBeVisible();
    await expect(reveal).toContainText('STARE');
  });

  test('after completing today, re-open shows locked view with no begin button', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-trace-game]')).toBeVisible();

    // Win
    for (const word of ['share', 'shore', 'shone']) {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('[data-trace-overlay]')).toHaveAttribute('data-trace-phase', 'over');

    // Close and re-open — same date is still injected via initScript
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-trace-overlay]')).toHaveCount(0);
    await page.locator('[data-trace-open]').click();

    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toHaveAttribute('data-trace-phase', 'attract');
    await expect(page.locator('[data-trace-locked]')).toBeVisible();
    await expect(overlay).toContainText('route resolved');
    // No play button in locked view
    await expect(page.locator('[data-trace-begin]')).toHaveCount(0);
  });

  test('streak: yesterday win + today win = 2; share text shows streak', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
      // Pre-seed yesterday's win so today's win extends the streak.
      localStorage.setItem('trace.v1', JSON.stringify({
        lastPlayedDate: '2026-05-18',
        lastResult: 'win',
        lastPath: ['stare', 'share', 'shore', 'shone'],
        streak: 1, maxStreak: 1, totalPlayed: 1,
      }));
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-trace-game]')).toBeVisible();

    for (const word of ['share', 'shore', 'shone']) {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
    }

    await expect(page.locator('[data-trace-overlay]')).toHaveAttribute('data-trace-phase', 'over');
    await expect(page.locator('[data-trace-overlay]')).toContainText('streak 2');
  });

  test('share text: win copy matches exact formatShare output', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-trace-game]')).toBeVisible();

    // First-ever win in 3 moves → streak 1, maxStreak 1
    for (const word of ['share', 'shore', 'shone']) {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('[data-trace-overlay]')).toHaveAttribute('data-trace-phase', 'over');

    const expected = `TRACE #1  ▸ resolved 3 / par 3\n▮▮▮\nstreak 1 · best 1\njynaxxapps.com`;
    await expect(page.locator('[data-trace-overlay] pre')).toHaveText(expected);
  });

  test('ESC closes overlay; Terminal content remains visible', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-trace-overlay]')).toHaveCount(0);
    await expect(page.locator('[data-direction="terminal"]')).toBeVisible();
  });

  test('attract screen: par/budget line is not shown', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toHaveAttribute('data-trace-phase', 'attract');
    await expect(page.locator('[data-trace-overlay]')).not.toContainText('budget');
  });

  test('over screen: player path is shown after a win', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-trace-game]')).toBeVisible();

    for (const word of ['share', 'shore', 'shone']) {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
    }

    await expect(page.locator('[data-trace-overlay]')).toHaveAttribute('data-trace-phase', 'over');
    const playerPath = page.locator('[data-trace-player-path]');
    await expect(playerPath).toBeVisible();
    await expect(playerPath).toContainText('STARE');
    await expect(playerPath).toContainText('SHONE');

    // Spec §10 — no icons. Over header uses the boot-log idiom.
    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toContainText('[ OK ] route resolved');
    await expect(overlay).not.toContainText('✓');
    await expect(overlay).not.toContainText('✕');
  });

  test('over screen: player path is shown after a loss', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-trace-game]')).toBeVisible();

    for (const word of ['scare', 'share', 'shore', 'store', 'score', 'scare', 'share', 'shore']) {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
    }

    await expect(page.locator('[data-trace-overlay]')).toHaveAttribute('data-trace-phase', 'over');
    const playerPath = page.locator('[data-trace-player-path]');
    await expect(playerPath).toBeVisible();
    await expect(playerPath).toContainText('STARE');

    // Spec §10 — no icons. Over header uses the boot-log idiom.
    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toContainText('[FAIL] no route — connection dropped');
    await expect(overlay).not.toContainText('✓');
    await expect(overlay).not.toContainText('✕');
  });

  test('modifier keys (Ctrl/Meta/Alt) do not feed letters into the entry', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();
    await expect(page.locator('[data-trace-overlay]')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-trace-game]')).toBeVisible();

    // 's' + Ctrl+H (would inject an extra 'h' without the guard) + 'hare'
    // Correct: entry = 'share' (valid 1-step move, accepted silently).
    // Broken:  entry = 'shhar' (truncated from 6) → "not a word" error.
    await page.keyboard.press('s');
    await page.keyboard.press('Control+h');
    await page.keyboard.type('hare');
    await page.keyboard.press('Enter');

    const game = page.locator('[data-trace-game]');
    await expect(game).toContainText('SHARE');
    await expect(game).not.toContainText('not a word');
  });

  test('reduced-motion: overlay renders and completes a game with zero thrown errors', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.addInitScript(() => {
      (window as Window & { __TRACE_TEST__?: unknown }).__TRACE_TEST__ =
        { dateISO: '2026-05-19', puzzleId: 1 };
    });
    await page.goto('/#terminal');
    await page.locator('[data-trace-open]').click();

    const overlay = page.locator('[data-trace-overlay]');
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute('data-trace-phase', 'attract');

    await page.keyboard.press('Enter');
    await expect(overlay).toHaveAttribute('data-trace-phase', 'playing');

    for (const word of ['share', 'shore', 'shone']) {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
    }
    await expect(overlay).toHaveAttribute('data-trace-phase', 'over');

    expect(errors).toHaveLength(0);
    await context.close();
  });
});
