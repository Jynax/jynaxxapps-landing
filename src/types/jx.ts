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

// Wire shape for GET/POST /api/live (Task #26). Single current entry —
// Decision 8.3 #3 (S153) settled the api-contracts.md open question in favour
// of one entry, not a rotating queue, so there is no `entries[]` wrapper.
// `project` is a JX_PROJECTS[].id (or null); the frontend hook resolves it to
// the full Project. `updated` is server-stamped ISO on POST (never client-sent).
export type LiveEntry = {
  activity: string;
  project: string | null;
  since: string;
  updated: string;
};

export type ContactKind = 'email' | 'github' | 'bluesky' | 'rss';

export type ContactEntry = {
  kind: ContactKind;
  label: string;
  value: string;
  href: string;
};
