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
