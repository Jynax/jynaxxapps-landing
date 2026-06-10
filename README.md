# jynaxxapps-landing

The personal landing site at [jynaxxapps.com](https://jynaxxapps.com) — a portfolio of side projects with a retro-terminal vibe, plus an admin CMS for live updates.

Stack: React + TypeScript + Vite, deployed to Cloudflare Pages with a Workers KV backend for live content.

## Getting Started

```bash
npm install
cp .env.example .env   # fill in VITE_GOOGLE_CLIENT_ID
npm run dev
```

Open http://localhost:5173. The marketing surface loads without any env vars; the admin sign-in flow requires `VITE_GOOGLE_CLIENT_ID`.

## Deployment

The app is wired to Cloudflare Pages. The Pages project must have:

- **Build env var** `VITE_GOOGLE_CLIENT_ID` set to your OAuth client ID.
- **A Workers KV namespace** bound as `CONTENT` (used by `functions/api/content.ts`, `live.ts`, `stats.ts`). The placeholder ID in `wrangler.toml` is just the original namespace — replace it with your own KV namespace ID (Cloudflare → Workers & Pages → KV).
- **A `LIVE_FEED_TOKEN`** secret for the service-to-service POST/DELETE endpoints (set as a runtime secret, not in source).

External contributors: the OAuth client ID is tied to a specific Google project, so the admin sign-in flow won't work end-to-end without your own Cloudflare + Google setup. The public marketing surface works without any of this.

## Tests

```bash
npm run lint
npx tsc --noEmit
npm run test:e2e      # Playwright
```

The `e2e/admin.spec.ts` file covers the logged-out gate and four authenticated CMS scenarios (content load, 404 fallback, successful save, expired-session 401) using `page.route` mocks and a pre-seeded localStorage token. No deployed environment is required.
