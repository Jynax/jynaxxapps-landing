import type { SiteContent } from '../types/content'

export const defaultContent: SiteContent = {
  hero: {
    title: 'JynaxxApps',
    subtitle: 'Building things with AI, for fun and curiosity.',
    tagline:
      'A maker who partners with AI to ship real projects \u2014 then tracks every decision, session, and line of code along the way.',
  },
  projects: [
    {
      id: 'meta-tracker',
      name: 'Meta Tracker',
      tagline: 'Project analytics dashboard',
      description:
        'Tracks every project, session, and decision across the whole portfolio. Interactive node graphs, metrics dashboards, and decision trees \u2014 all built with AI collaboration.',
      url: 'https://meta.jynaxxapps.com',
      aiTools: ['Claude', 'Cursor'],
      status: 'live',
      statusLabel: 'Live',
      visible: true,
    },
    {
      id: 'bip',
      name: 'Buried in Print',
      tagline: 'Reading log & analytics',
      description:
        'Upload a reading log CSV, get trend charts, book cards, year summaries, and timeline views. Built for readers who want to see patterns in what they read.',
      url: 'https://bip.jynaxxapps.com',
      aiTools: ['Claude', 'Codex'],
      status: 'live',
      statusLabel: 'Live',
      visible: true,
    },
    {
      id: 'item-b-gone',
      name: 'Item-B-Gone',
      tagline: 'WoW addon + web dashboard',
      description:
        'A World of Warcraft addon that scans your inventory and flags safe-to-sell items using multiple detection sources. Companion web dashboard for review.',
      url: 'https://ibg.jynaxxapps.com',
      aiTools: ['Claude'],
      status: 'live',
      statusLabel: 'Dashboard Live',
      visible: true,
    },
    {
      id: 'remnants',
      name: 'Remnants',
      tagline: 'Browser-based game',
      description:
        'A procedurally generated exploration game built with zero dependencies \u2014 just React and HTML5 Canvas. Currently in the research and prototyping phase.',
      url: 'https://remnants.jynaxxapps.com',
      aiTools: ['Claude', 'Codex'],
      status: 'research',
      statusLabel: 'Research Phase',
      visible: true,
    },
    {
      id: 'vuln-bank',
      name: 'Vuln Bank',
      tagline: 'Security training app',
      description:
        'A collaborative project exploring secure application development. Built with a coworker using parallel AI agents.',
      url: '',
      aiTools: ['Claude', 'Cursor'],
      status: 'coming-soon',
      statusLabel: 'Coming Soon',
      visible: true,
    },
  ],
  about: {
    paragraphs: [
      "I'm a maker who builds things because they're interesting. Reading analytics, game prototypes, WoW addons, security labs \u2014 if it sounds fun, I'll build it.",
      'Every project here is built in collaboration with AI. Not generated and forgotten \u2014 designed, iterated, shipped, and tracked. Claude, Cursor, and Codex are my co-pilots. I bring the ideas and the taste; they bring speed and tireless patience.',
      'The whole process is tracked in <a href="https://meta.jynaxxapps.com" target="_blank" rel="noopener noreferrer">Meta Tracker</a> \u2014 every session, every decision, every line of code. Radical transparency about how human+AI collaboration actually works.',
    ],
  },
  footer: {
    links: [
      {
        platform: 'Bluesky',
        url: 'https://bsky.app/profile/mrchartrand.bsky.social',
        label: 'Bluesky',
      },
      {
        platform: 'LinkedIn',
        url: 'https://www.linkedin.com/in/michaelchartrand/',
        label: 'LinkedIn',
      },
      {
        platform: 'Email',
        url: 'mailto:jynaxx@gmail.com',
        label: 'Email',
      },
    ],
    note: 'Built by a human with AI. Tracked in <a href="https://meta.jynaxxapps.com" target="_blank" rel="noopener noreferrer">Meta Tracker</a>.',
  },
}
