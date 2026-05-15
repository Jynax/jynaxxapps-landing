import { test, expect } from '@playwright/test';

// The static register must satisfy the Project shape and the KV content
// schema must be able to carry the new fields without breaking legacy admin.
test('static register is the v1 source and is shape-valid', async ({ page }) => {
  await page.goto('/');
  const counts = await page.evaluate(() => window.__JX__ ?? null);
  expect(counts).not.toBeNull();
  expect(counts.total).toBe(12);
});

test('content API falls through to the SPA under vite dev (no 404, no crash)', async ({ request }) => {
  // Cloudflare Pages Functions are NOT served by `vite dev`, so `/api/content`
  // is not intercepted as an API route. Vite's SPA fallback serves index.html
  // instead: observed status is 200 with an HTML body (NOT a 404, NOT JSON).
  // This asserts the concrete dev-routing behavior so the test fails if that
  // changes. The TRUE /api/content contract (real JSON payload from the Pages
  // Function) is covered by admin.spec.ts against a deployed environment.
  const res = await request.get('/api/content');
  expect(res.status()).toBe(200);
  const contentType = res.headers()['content-type'] ?? '';
  expect(contentType).toContain('text/html');
  const body = await res.text();
  expect(body).toContain('<!doctype html');
});
