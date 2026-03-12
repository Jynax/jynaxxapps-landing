import type { SiteContent } from '../types/content'

export function Hero({ hero }: { hero: SiteContent['hero'] }) {
  const scrollToProjects = () => {
    document.querySelector('.projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-name">{hero.title}</h1>
        <p className="hero-tagline">{hero.subtitle}</p>
        <p className="hero-sub">{hero.tagline}</p>
      </div>
      <button
        className="hero-scroll-hint"
        onClick={scrollToProjects}
        aria-label="Scroll to projects"
      >
        &#8595;
      </button>
    </section>
  )
}
