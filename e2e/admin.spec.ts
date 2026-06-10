import { test, expect } from '@playwright/test';
import { defaultContent } from '../src/data/defaultContent';

// A realistic-looking base64 token (timestamp:email:hmac).
// The mount-time validation GET is mocked to 200 so the token is never rejected.
const FAKE_TOKEN = 'dGVzdC10b2tlbi12YWx1ZQ=='; // base64("test-token-value")

/** Seed a valid-looking token and stub the validation GET so it is accepted. */
async function seedAuthAndMockValidation(page: import('@playwright/test').Page) {
  // Seed token before navigation so useAdminAuth initialises as authenticated.
  await page.addInitScript((token) => {
    localStorage.setItem('jynaxx-admin-token', token);
  }, FAKE_TOKEN);

  // Mount-time validation GET: return 200 so the token is not cleared.
  await page.route('**/api/content', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(defaultContent),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe('Admin', () => {
  test('navigating to #/admin shows login form', async ({ page }) => {
    await page.goto('/#/admin');
    const loginCard = page.locator('.admin-login-card');
    await expect(loginCard).toBeVisible();
    await expect(page.locator('.admin-login-title')).toContainText('JynaxxApps Admin');
  });

  test('Google OAuth button container is present', async ({ page }) => {
    await page.goto('/#/admin');
    // The Google button is rendered into a div via GIS script
    // We can verify the wrapper exists
    const btnWrapper = page.locator('.admin-google-btn-wrapper');
    await expect(btnWrapper).toBeVisible();
  });

  test('admin page does not show main site content', async ({ page }) => {
    await page.goto('/#/admin');
    // Hero and projects should NOT be visible on admin
    await expect(page.locator('.hero')).not.toBeVisible();
    await expect(page.locator('.projects')).not.toBeVisible();
  });

  test('navigating from admin back to root shows the site', async ({ page }) => {
    await page.goto('/#/admin');
    await expect(page.locator('.admin-login-card')).toBeVisible();
    await expect(page.locator('[data-direction]')).toHaveCount(0);
    // Navigate back to the site root — the live shell renders a direction and
    // the admin login UI is gone.
    await page.goto('/');
    await expect(page.locator('[data-direction]')).toBeVisible();
    await expect(page.locator('.admin-login-card')).toHaveCount(0);
  });
});

test.describe('Admin — authenticated CMS editor (mocked API)', () => {
  test('authenticated state: editor renders with content from mocked GET /api/content 200', async ({ page }) => {
    await seedAuthAndMockValidation(page);
    await page.goto('/#/admin');

    // Admin header and editor fieldsets should be visible (not the login form).
    await expect(page.locator('.admin')).toBeVisible();
    await expect(page.locator('.admin-login-card')).toHaveCount(0);

    // Hero fieldset is rendered with content from the mocked API response.
    await expect(page.locator('.admin-fieldset').first()).toBeVisible();

    // The hero title value from defaultContent should be pre-filled.
    const titleInput = page.locator('.admin-input').first();
    await expect(titleInput).toHaveValue(defaultContent.hero.title);
  });

  test('GET /api/content 404: editor falls back to defaultContent with no crash', async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem('jynaxx-admin-token', token);
    }, FAKE_TOKEN);

    // Route on the request, not on arrival order (callCount is race-prone).
    // useAdminAuth.ts:23 — token-validation GET includes Authorization: Bearer <token>.
    // Admin.tsx:22       — content-fetch GET has no Authorization header.
    await page.route('**/api/content', async (route) => {
      if (route.request().method() === 'GET') {
        if (route.request().headers()['authorization']) {
          // Token-validation call — return 200 to keep token valid.
          await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
        } else {
          // Content-fetch call — simulate 404 (nothing in KV yet).
          await route.fulfill({ status: 404, contentType: 'application/json', body: 'null' });
        }
      } else {
        await route.continue();
      }
    });

    await page.goto('/#/admin');

    // Editor should render (fallback to defaultContent) with a warning notice.
    await expect(page.locator('.admin-warning')).toBeVisible();
    await expect(page.locator('.admin-warning')).toContainText('Could not load from API');

    // Inputs are populated with defaultContent fallback — hero title is present.
    const titleInput = page.locator('.admin-input').first();
    await expect(titleInput).toHaveValue(defaultContent.hero.title);
  });

  test('successful save: PUT /api/content mocked 200 shows success feedback', async ({ page }) => {
    await seedAuthAndMockValidation(page);

    // Also stub the PUT.
    await page.route('**/api/content', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(defaultContent),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/#/admin');
    await expect(page.locator('.admin')).toBeVisible();

    // Dirty the form so the Save button becomes active.
    const titleInput = page.locator('.admin-input').first();
    await titleInput.fill('Updated Title');

    // Click Save.
    await page.locator('.admin-btn--primary').click();

    // Success message should appear.
    await expect(page.locator('.admin-save-msg')).toBeVisible();
    await expect(page.locator('.admin-save-msg')).toContainText('Saved!');
    await expect(page.locator('.admin-save-msg')).toContainText('live');
  });

  test('expired session: PUT returns 401 shows re-auth state, no silent failure', async ({ page }) => {
    await seedAuthAndMockValidation(page);

    // Override PUT to return 401 (expired/invalid token).
    await page.route('**/api/content', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(defaultContent),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/#/admin');
    await expect(page.locator('.admin')).toBeVisible();

    // Dirty the form to enable Save.
    await page.locator('.admin-input').first().fill('Dirty value');

    // Click Save — the 401 response should trigger logout + error message.
    await page.locator('.admin-btn--primary').click();

    // The save-msg should surface the session-expired message (not silent).
    await expect(page.locator('.admin-save-msg')).toBeVisible();
    await expect(page.locator('.admin-save-msg')).toContainText('Session expired');

    // After logout the login form should be visible (token cleared).
    // logout is delayed 1500 ms by Admin.tsx so the message renders first.
    await expect(page.locator('.admin-login-card')).toBeVisible({ timeout: 4000 });
  });
});
