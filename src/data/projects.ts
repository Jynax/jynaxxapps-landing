export interface Project {
  name: string
  tagline: string
  description: string
  url: string
  aiTools: string[]
  status: 'live' | 'coming-soon' | 'research'
  statusLabel: string
}

export const projects: Project[] = [
  {
    name: 'Meta Tracker',
    tagline: 'Project analytics dashboard',
    description: 'Tracks every project, session, and decision across the whole portfolio. Interactive node graphs, metrics dashboards, and decision trees — all built with AI collaboration.',
    url: 'https://meta.jynaxxapps.com',
    aiTools: ['Claude', 'Cursor'],
    status: 'live',
    statusLabel: 'Live',
  },
  {
    name: 'Buried in Print',
    tagline: 'Reading log & analytics',
    description: 'Upload a reading log CSV, get trend charts, book cards, year summaries, and timeline views. Built for readers who want to see patterns in what they read.',
    url: 'https://bip.jynaxxapps.com',
    aiTools: ['Claude', 'Codex'],
    status: 'live',
    statusLabel: 'Live',
  },
  {
    name: 'Item-B-Gone',
    tagline: 'WoW addon + web dashboard',
    description: 'A World of Warcraft addon that scans your inventory and flags safe-to-sell items using multiple detection sources. Companion web dashboard for review.',
    url: 'https://ibg.jynaxxapps.com',
    aiTools: ['Claude'],
    status: 'live',
    statusLabel: 'Dashboard Live',
  },
  {
    name: 'Remnants',
    tagline: 'Browser-based game',
    description: 'A procedurally generated exploration game built with zero dependencies — just React and HTML5 Canvas. Currently in the research and prototyping phase.',
    url: 'https://remnants.jynaxxapps.com',
    aiTools: ['Claude', 'Codex'],
    status: 'research',
    statusLabel: 'Research Phase',
  },
  {
    name: 'Vuln Bank',
    tagline: 'Security training app',
    description: 'A collaborative project exploring secure application development. Built with a coworker using parallel AI agents.',
    url: '',
    aiTools: ['Claude', 'Cursor'],
    status: 'coming-soon',
    statusLabel: 'Coming Soon',
  },
]
