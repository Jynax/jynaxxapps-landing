// SOURCE: static register for v1 (open-decisions item 2 sanctions stubbing KV). Swap to KV-backed register when an admin editor exists — out of scope for scaffold.

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

// NOTE: the `frozen` label hardcodes Meta Tracker's `· v0.85` per the spec's reference-impl behavior.
export const JX_STATUS: Record<ProjectStatus, { label: string; color: string }> = {
  active:          { label: 'active',           color: '#86C26B' },
  building:        { label: 'building',          color: '#86C26B' },
  frozen:          { label: 'frozen · v0.85',    color: '#7BA9E0' },
  maintained:      { label: 'maintained',        color: '#9BB07A' },
  'winding-down':  { label: 'winding down',      color: '#C68A5C' },
  'shipped-private': { label: 'shipped · private', color: '#9BB07A' },
  research:        { label: 'research',          color: '#F4B942' },
  sketch:          { label: 'sketch',            color: '#C68A5C' },
  soon:            { label: 'coming soon',       color: '#8A7E6E' },
};

export const JX_PROJECTS: Project[] = [
  // ── Live in the wild (public) ────────────────────────────────────────────

  {
    id: 'remnants',
    name: 'Remnants',
    slug: 'remnants.jynaxxapps.com',
    tag: 'Browser extraction shooter, zero deps',
    blurb: 'Shadowrun-adjacent browser game built deliberately without dependencies — pure HTML5 Canvas + vanilla ES6 in a single file. Phase 2.1 is playable; currently tidying up and building out the world before the next push.',
    status: 'active',
    stack: ['React 18', 'HTML5 Canvas', 'JS (ES6+)'],
    started: '2026-01',
    touched: 'this week',
    href: 'https://remnants.jynaxxapps.com',
    chapter: 'I.',
    group: 'public',
  },

  {
    id: 'item-b-gone',
    name: 'Item-B-Gone',
    slug: 'ibg.jynaxxapps.com',
    tag: 'A WoW inventory triage tool',
    blurb: 'Two-part World of Warcraft tool — a Lua tooltip addon that flags items safe to delete (with reasons) plus a React dashboard that reads SavedVariables for a character-by-character view. Addon v0.3, dashboard v4.',
    status: 'active',
    stack: ['Lua', 'Static HTML/CSS/JS', 'Node (build)', 'R2'],
    started: '2025-11',
    touched: 'weekends',
    href: 'https://ibg.jynaxxapps.com',
    chapter: 'II.',
    group: 'public',
  },

  {
    id: 'meta-tracker',
    name: 'Meta Tracker',
    slug: 'meta.jynaxxapps.com',
    tag: 'The hub every other project fed into',
    blurb: 'Project analytics dashboard tracking decisions, metrics, and velocity across the portfolio. Interactive node graph, decision tree, charts. A story-based reframe is being considered — maybe it lives on the landing page next.',
    status: 'frozen',
    stack: ['React', 'TypeScript', 'Tailwind', 'Vite', 'React Flow'],
    started: '2025-08',
    touched: 'May 4 (snapshot)',
    href: 'https://meta.jynaxxapps.com',
    chapter: 'III.',
    group: 'public',
  },

  {
    id: 'buried-in-print',
    name: 'Buried in Print',
    slug: 'bip.jynaxxapps.com',
    tag: 'Reading log that thinks',
    blurb: 'Turns a "books read" spreadsheet into interactive filters, monthly + YoY charts, and exportable book / year cards. Built for non-dev users (originally, for my partner). v1.0 — purpose reached.',
    status: 'frozen',
    stack: ['React 18', 'TypeScript', 'Tailwind', 'Vite', 'Recharts'],
    started: '2025-09',
    touched: 'dependency upkeep',
    href: 'https://bip.jynaxxapps.com',
    chapter: 'IV.',
    group: 'public',
  },

  {
    id: 'note-worthy',
    name: 'Note Worthy',
    slug: 'noteworthy.jynaxxapps.com',
    tag: 'Sheet-music transposer with OMR',
    blurb: 'Optical music recognition + transposition tool. Frozen mid-build before the OMR engine landed. Not yet deployed.',
    status: 'frozen',
    stack: ['Vite', 'React', 'TypeScript', 'Tailwind'],
    started: '2025-10',
    touched: 'paused',
    href: '#',
    chapter: 'V.',
    group: 'public',
  },

  {
    id: 'on-the-move',
    name: 'On the Move',
    slug: 'subdomain reserved',
    tag: 'Coming soon — placeholder',
    blurb: 'A future app, currently a holding page. Scope still being confirmed.',
    status: 'soon',
    stack: [],
    started: 'TBD',
    touched: 'reserved',
    href: '#',
    chapter: 'VI.',
    group: 'public',
  },

  // ── In the workshop ───────────────────────────────────────────────────────

  {
    id: 'cyberdeck',
    name: 'Cyberdeck',
    slug: 'hardware',
    tag: 'A portable Pi 5 reader, hand-built',
    blurb: 'Dual-display Raspberry Pi 5 cyberdeck I\'m building for my partner. Primary use: reading around the house with KOReader. Phase 1 bench build — touch display working, one keyboard-input blocker left.',
    status: 'building',
    stack: ['Raspberry Pi 5', 'Pi OS Bookworm', 'labwc/Wayland', 'KOReader', 'Piper TTS', 'Bluetooth HID'],
    started: '2026-02',
    touched: 'this week',
    href: '#',
    chapter: 'VII.',
    group: 'workshop',
  },

  {
    id: 'smart-machine',
    name: 'SMART Machine',
    slug: 'internal · self-hosted',
    tag: 'Model routing as code, not muscle memory',
    blurb: 'Self-hosted n8n workflow that classifies a task and routes it to the best-fit model (local SLM, LM Studio, Anthropic API, paid escape hatch). Two-stage interpreter + dispatcher. Phase 2 build, reversibility-first execution under review.',
    status: 'building',
    stack: ['n8n', 'LM Studio', 'Claude', 'self-hosted SearXNG'],
    started: '2026-01',
    touched: 'this week',
    href: '#',
    chapter: 'VIII.',
    group: 'workshop',
  },

  {
    id: 'harness-brain',
    name: 'Harness Brain',
    slug: 'research · no repo',
    tag: 'Which model should run my harness?',
    blurb: 'Evaluation project — find a model that clears an 80%-viable bar on daily tasks, and figure out what hardware that implies. Bar + candidate roster locked; real-task pilot runs next.',
    status: 'research',
    stack: ['Eval framework'],
    started: '2026-03',
    touched: 'last week',
    href: '#',
    chapter: 'IX.',
    group: 'workshop',
  },

  {
    id: 'feedback-capture',
    name: 'Feedback Capture',
    slug: 'private · local only',
    tag: 'Annotated bug-capture for myself',
    blurb: 'Chromium extension + local Node server. Draw a region, red-box, arrow, note, save. Paired with a /captures command that turns saved captures into task briefs. v1.0 in daily use.',
    status: 'shipped-private',
    stack: ['Chromium MV3 extension', 'Node.js'],
    started: '2025-12',
    touched: 'small tweaks',
    href: '#',
    chapter: 'X.',
    group: 'workshop',
  },

  {
    id: 'fit-tracker',
    name: 'FIT Tracker Replacement',
    slug: 'Android · scoping',
    tag: 'Part of the MS/Google divestment',
    blurb: 'A simple Android app to replace Google Fit. Phase 0 — stack, scope, local-vs-cloud all intentionally TBD.',
    status: 'sketch',
    stack: ['TBD (Kotlin/Compose vs Flutter vs PWA — deliberately undecided)'],
    started: '2026-04',
    touched: 'scoping',
    href: '#',
    chapter: 'XI.',
    group: 'workshop',
  },

  {
    id: 'home-lab-consolidation',
    name: 'Home Lab Consolidation',
    slug: 'infrastructure · self-hosted',
    tag: 'Evicting Big Tech from the house',
    blurb: 'For years the family’s digital life has been smeared across six machines and two clouds, with an 8TB drive playing the role of "I’ll sort it later." This is the un-smearing: pull every photo, manuscript and EPUB off OneDrive and Google, dedupe years of chaos, and land it on one home server the household actually owns. Proprietary apps swapped for FOSS, sync automated, nothing held hostage to a subscription.',
    status: 'building',
    stack: ['Syncthing', 'Restic', 'Tailscale', 'Samba/SMB', 'Immich', 'Calibre-Web', 'n8n'],
    started: '2026-04',
    touched: 'worked most weeks',
    href: '#',
    chapter: 'XII.',
    group: 'workshop',
  },
];

export const JX_MANIFESTO: string[] = [
  'Build to learn.',
  'Break things on purpose.',
  'Ship the weird one.',
  'Take notes. Then take more notes.',
  'AI is a coworker, not a wand.',
];

export const JX_NOW = {
  line: 'obsessed with telling software like a story. rewriting meta tracker’s decision graph. drinking too much coffee.',
};

export const JX_CONTACT = [
  { kind: 'email',   label: 'email',   value: 'jynaxx@gmail.com',            href: 'mailto:jynaxx@gmail.com' },
  { kind: 'github',  label: 'github',  value: 'github.com/Jynax',             href: 'https://github.com/Jynax' },
  { kind: 'bluesky', label: 'bluesky', value: '@mrchartrand.bsky.social',     href: 'https://bsky.app/profile/mrchartrand.bsky.social' },
  { kind: 'rss',     label: 'rss',     value: '/feed.xml',                    href: '/feed.xml' },
];

export const JX_FOOTER = {
  copyright: '© 2024–2026 jynaxx · all rights reversed',
  built:     'built with claude · cursor · curiosity',
  made:      'made in canada',
};

if (typeof window !== 'undefined') {
  (window as any).__JX__ = {
    total:    JX_PROJECTS.length,
    public:   JX_PROJECTS.filter(p => p.group === 'public').length,
    workshop: JX_PROJECTS.filter(p => p.group === 'workshop').length,
  };
}
