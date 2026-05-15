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

export type ContactKind = 'email' | 'github' | 'bluesky' | 'rss';

export type ContactEntry = {
  kind: ContactKind;
  label: string;
  value: string;
  href: string;
};
