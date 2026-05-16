import type { Project, ContactEntry } from './jx'

export interface SiteContent {
  hero: {
    title: string
    subtitle: string
    tagline: string
  }
  projects: ProjectContent[]
  about: {
    paragraphs: string[]
  }
  footer: {
    links: SocialLink[]
    note: string
  }
  // ── Redesign-shape carriers (Task 8) ──────────────────────────────────────
  // OPTIONAL & back-compatible: every legacy field above stays required and
  // untouched. These let a FUTURE KV blob carry the new register shape without
  // breaking the existing admin editors (which only read/write the legacy
  // fields and ignore these). No admin editor for these exists yet — YAGNI
  // per open-decisions item 2. See jxData.ts v1 SOURCE OF TRUTH note.
  register?: Project[]
  manifesto?: string[]
  now?: { line: string }
  contact?: ContactEntry[]
  footer2?: { copyright: string; built: string; made: string }
}

export interface ProjectContent {
  id: string
  name: string
  tagline: string
  description: string
  url: string
  aiTools: string[]
  status: 'live' | 'coming-soon' | 'research'
  statusLabel: string
  visible: boolean
}

export interface SocialLink {
  platform: string
  url: string
  label: string
}
