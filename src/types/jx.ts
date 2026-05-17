// Pure type declarations — the shared shape for the static register and
// contact data. This file is the dependency root: it imports NOTHING from
// `data/`. Both `data/jxData.ts` and `types/content.ts` depend on it, so the
// dependency direction is `types/jx.ts ← (data/jxData.ts AND types/content.ts)`.

export type ProjectStatus =
  | 'active'
  | 'building'
  | 'frozen'
  | 'maintained'
  | 'winding-down'
  | 'shipped-private'
  | 'research'
  | 'sketch'
  | 'soon';

export type Project = {
  id: string;
  name: string;
  slug: string;
  tag: string;
  blurb: string;
  status: ProjectStatus;
  stack: string[];
  started: string;
  touched: string;
  href: string;
  chapter: string;
  group: 'public' | 'workshop';
};

// Wire shape for GET/POST /api/live (Task #26 → evolved Task #30).
//
// Decision 8.3 #3 (single current entry, S153) is DELIBERATELY REVERSED by
// Task #30 (spec live-feed-evolution-spec-2026-05-17, decisions.md): the feed
// is now a server-managed capped rotating set. The stored KV value is an
// envelope `{ entries: LiveFeedEntry[] }`, newest-first, cap 3, 24h TTL.
//
// `project` is a JX_PROJECTS[].id (or null); the frontend hook resolves it to
// the full Project. `id`/`updated` are server-generated on POST (never client-
// sent). `publicSafe` is REQUIRED true — defense-in-depth privacy gate
// (spec §2); the server rejects any insert missing/!== true.
export type LiveFeedEntry = {
  id: string;
  activity: string;
  project: string | null;
  since: string;
  updated: string; // server-stamped ISO-8601 on insert
  publicSafe: true;
  source: 'wcc' | 'lcc';
};

export type LiveFeedEnvelope = {
  entries: LiveFeedEntry[];
};

export type ContactKind = 'email' | 'github' | 'bluesky' | 'rss';

export type ContactEntry = {
  kind: ContactKind;
  label: string;
  value: string;
  href: string;
};
