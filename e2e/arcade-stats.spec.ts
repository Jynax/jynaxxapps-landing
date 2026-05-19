import { test, expect } from '@playwright/test'

// ── Task 1: pure-store unit tests (Node context) ────────────────────────────
// No browser — mirrors how live-store.spec.ts unit-tests liveStore.

test('statsStore validates and builds', async () => {
  const { validatePayload, buildEnvelope } = await import(
    '../functions/api/statsStore.ts'
  )
  expect(validatePayload({ since: 'FEB 2026', projects: 12, prsMerged: 400 })).toBe(true)
  expect(validatePayload({ since: 'FEB 2026', projects: -1, prsMerged: 400 })).toBe(false)
  expect(validatePayload({ projects: 12, prsMerged: 400 })).toBe(false)
  expect(validatePayload(null)).toBe(false)
  const env = buildEnvelope({ since: 'FEB 2026', projects: 12, prsMerged: 400 })
  expect(typeof env.generatedAt).toBe('string')
  expect(env.projects).toBe(12)
})

// ── Task 2: /api/stats endpoint contract ────────────────────────────────────
// Pages Functions are NOT served by `vite dev` (same pattern as /api/live in
// live-feed.spec.ts). The SPA fallback serves index.html for any unknown path.
// The TRUE KV contract is covered by the statsStore unit tests above; the
// widget's graceful-fallback is asserted in Task 4 below.

test('GET /api/stats falls through to the SPA under vite dev (no 404, no crash)', async ({
  request,
}) => {
  const res = await request.get('/api/stats')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type'] ?? '').toContain('text/html')
  expect(await res.text()).toContain('<!doctype html')
})

test('POST /api/stats falls through to the SPA under vite dev (no crash)', async ({
  request,
}) => {
  const res = await request.post('/api/stats', {
    data: { since: 'FEB 2026', projects: 12, prsMerged: 400 },
  })
  // vite dev returns the SPA for any unhandled path — not a Pages Function error
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type'] ?? '').toContain('text/html')
})

// ── Task 4: scoreboard widget + graceful fallback ───────────────────────────

async function mockStats(page: import('@playwright/test').Page) {
  await page.route('**/api/stats', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'public, max-age=15' },
      body: JSON.stringify({
        generatedAt: '2026-05-19T12:00:00.000Z',
        since: 'FEB 2026',
        projects: 12,
        prsMerged: 400,
      }),
    }),
  )
}

test('scoreboard shows the four real rows + UPDATED tag, with graceful fallback', async ({
  page,
}) => {
  // /api/stats is not served by vite dev → hook falls back to static values,
  // so the board still renders (no crash, no blank).
  await page.goto('/#arcade')
  await page.click('[data-arcade-livestrip-toggle]')
  const sb = page.locator('[data-arcade-livestrip-panel]')
  await expect(sb.getByText('SINCE')).toBeVisible()
  await expect(sb.getByText('PROJECTS')).toBeVisible()
  await expect(sb.getByText('PRS MERGED')).toBeVisible()
  await expect(sb.getByText('COFFEE')).toBeVisible()
  await expect(sb.getByText(/UPDATED/)).toBeVisible()
  await expect(sb.getByText(/LINES|COMMITS|SESSIONS/)).toHaveCount(0)
})

test('scoreboard shows live values when /api/stats responds', async ({ page }) => {
  await mockStats(page)
  await page.goto('/#arcade')
  await page.click('[data-arcade-livestrip-toggle]')
  const sb = page.locator('[data-arcade-livestrip-panel]')
  await expect(sb.getByText('SINCE')).toBeVisible()
  await expect(sb.getByText('FEB 2026')).toBeVisible()
  await expect(sb.getByText(/400/)).toBeVisible() // prsMerged
  await expect(sb.getByText(/UPDATED/)).toBeVisible()
})
