import { test, expect } from '@playwright/test';

// Task #27 — canonical-fidelity pass. Audit found shipped code silently
// diverged from the May-16 canonical reference in several places that were
// NOT deliberate. These assert the corrections (see decisions.md Chapter 9).

test.describe('Terminal — PhosphorKeyboard canonical 4-row layout (audit #1)', () => {
  test('keyboard has the number row + punctuation keys (not just 3 letter rows)', async ({ page }) => {
    await page.goto('/#terminal');
    const kb = page.locator('[data-phosphor-keyboard]');
    await expect(kb).toBeVisible();
    // Canonical row 1 is `1234567890-=`; shipped only had QWERTY/ASDF/ZXCV.
    for (const digit of ['1', '0']) {
      await expect(kb.locator(`[data-key="${digit}"]`)).toHaveCount(1);
    }
    for (const punct of ['-', '.', ',']) {
      await expect(kb.locator(`[data-key="${punct}"]`)).toHaveCount(1);
    }
  });
});

test.describe('Terminal — PhosphorKeyboard phosphor decay trail (S156 follow-up)', () => {
  // The text type-out and the lit key share one counter (LiveNow `shown`), so
  // they advance at the same rate — but a key snapping off each tick READS ~2x
  // faster than the text growing. Fix: a CRT-phosphor afterglow — keys fade out
  // over a few hundred ms instead of snapping, so the eye follows the text's
  // cadence. No second clock; same typing rate.
  test('non-reduced: keys carry a decay (fade-out) transition, not an instant snap-off', async ({ page }) => {
    await page.goto('/#terminal');
    const key = page.locator('[data-phosphor-keyboard] [data-key="Q"]').first();
    await expect(key).toBeVisible();
    const durMs = await key.evaluate((el) => {
      const d = getComputedStyle(el).transitionDuration; // e.g. "0.45s" or "0s"
      return d.split(',').reduce((m, s) => Math.max(m, parseFloat(s) * (s.includes('ms') ? 1 : 1000)), 0);
    });
    // Was `transition: none` (0ms). Decay must be a few hundred ms.
    expect(durMs).toBeGreaterThanOrEqual(300);
  });

  test('reduced-motion: decay frozen (transition-duration 0s via global tokens rule)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/#terminal');
    const key = page.locator('[data-phosphor-keyboard] [data-key="Q"]').first();
    await expect(key).toBeVisible();
    const durMs = await key.evaluate((el) => {
      const d = getComputedStyle(el).transitionDuration;
      return d.split(',').reduce((m, s) => Math.max(m, parseFloat(s) * (s.includes('ms') ? 1 : 1000)), 0);
    });
    expect(durMs).toBe(0);
    await context.close();
  });
});

test.describe('Console — SectionHeader uppercase title (audit #15)', () => {
  test('section header title is rendered uppercase (canonical textTransform)', async ({ page }) => {
    await page.goto('/#console');
    const title = page.locator('[data-section-title]').first();
    await expect(title).toBeVisible();
    const tt = await title.evaluate((el) => getComputedStyle(el).textTransform);
    expect(tt).toBe('uppercase');
  });
});

test.describe('Console — project dossier .35s open animation restored (audit #16)', () => {
  test('dossier wrapper animates open via a max-height transition (not an instant mount)', async ({ page }) => {
    await page.goto('/#console');
    const anim = page.locator('[data-card-dossier-anim]').first();
    // Canonical: always rendered, max-height 0↔400 with `transition: max-height .35s ease`.
    await expect(anim).toHaveCount(1);
    const css = await anim.evaluate((el) => {
      const s = getComputedStyle(el);
      return { dur: s.transitionDuration, prop: s.transitionProperty };
    });
    expect(css.prop).toContain('max-height');
    expect(css.dur).toContain('0.35s');
  });
});

test.describe('Shell — Arcade switcher accent matches canonical (audit #5)', () => {
  test('Arcade switcher control uses canonical sun-yellow #FFD93D, not hot-pink', async ({ page }) => {
    // On /#arcade the arcade dot isActive → its background IS the accent hex.
    await page.goto('/#arcade');
    const dot = page.locator('[data-toggle-direction="arcade"]').first();
    await expect(dot).toHaveCount(1);
    const bg = await dot.evaluate((el) => getComputedStyle(el).backgroundColor);
    // #FFD93D === rgb(255, 217, 61); hot-pink #FF3D7F === rgb(255, 61, 127).
    expect(bg).toContain('255, 217, 61');
    expect(bg).not.toContain('255, 61, 127');
  });
});

test.describe('Terminal — prompt ~ uses fg-bright (audit #6)', () => {
  test('the ~ token is brighter than the dim host token', async ({ page }) => {
    await page.goto('/#terminal');
    const tilde = page.locator('[data-prompt-tilde]').first();
    const host = page.locator('[data-prompt-host]').first();
    await expect(tilde).toHaveCount(1);
    await expect(host).toHaveCount(1);
    const tildeColor = await tilde.evaluate((el) => getComputedStyle(el).color);
    const hostColor = await host.evaluate((el) => getComputedStyle(el).color);
    // Canonical renders ~ in fg-bright; host stays fg-dim → they must differ.
    expect(tildeColor).not.toEqual(hostColor);
  });
});
